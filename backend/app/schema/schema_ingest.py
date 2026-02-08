"""
schema_ingest.py — One-time schema ingestion into vector embeddings.

This script converts the database schema into semantic embeddings and
persists them in the vector store (pgvector).  It is designed to be:

  - **Idempotent**: checks if schema vectors already exist; skips if present.
  - **Triggered only by**: initial deployment, explicit admin command, or
    CI/CD migration step.
  - **NEVER triggered by**: user queries, sessions, memory updates, or
    prompt failures.

Embedding granularity:
  - One vector per table (table name + description + columns + relationships)
  - Additional vectors for important column groups / join relationships

Schema is NEVER passed raw to the LLM.  Only the pre-embedded semantic
representation is used at runtime via similarity search.
"""

from __future__ import annotations

import logging

from app.core.longcat_client import generate_embedding
from app.memory.vector_store import get_vector_store

logger = logging.getLogger(__name__)

# ── Schema definitions ──────────────────────────────────────────────────
# Each entry is one embedding unit conforming to the spec:
#   table, description, columns, column_details, relationships

SCHEMA_DEFINITIONS: list[dict] = [
    {
        "table": "departments",
        "description": (
            "Department master data. Each department has a unique name and "
            "a physical location. Used to organise employees and production orders."
        ),
        "columns": ["dept_id", "dept_name", "location", "created_at"],
        "column_details": {
            "dept_id": "BIGINT PK, auto-generated identity",
            "dept_name": "TEXT UNIQUE NOT NULL — department name",
            "location": "TEXT — physical location of the department",
            "created_at": "TIMESTAMPTZ — row creation timestamp",
        },
        "relationships": [
            "employees.dept_id → departments.dept_id",
            "production_orders.dept_id → departments.dept_id",
        ],
    },
    {
        "table": "employees",
        "description": (
            "Employee master data including personal info, salary, status, "
            "department assignment, designation, and manager hierarchy. "
            "Central HR table linked to attendance, leaves, and users."
        ),
        "columns": [
            "emp_id", "emp_name", "email", "phone", "address",
            "hire_date", "salary", "status", "dept_id", "designation",
            "manager_id", "created_at",
        ],
        "column_details": {
            "emp_id": "BIGINT PK, auto-generated identity",
            "emp_name": "TEXT NOT NULL — full name",
            "email": "TEXT UNIQUE — email address",
            "phone": "TEXT — phone number",
            "address": "TEXT — residential address",
            "hire_date": "DATE — date of joining",
            "salary": "NUMERIC(10,2) — monthly salary",
            "status": "TEXT CHECK IN ('Active','Inactive','On Leave') DEFAULT 'Active'",
            "dept_id": "BIGINT NOT NULL FK → departments.dept_id",
            "designation": "TEXT — job title",
            "manager_id": "BIGINT FK → employees.emp_id (self-referencing hierarchy)",
            "created_at": "TIMESTAMPTZ — row creation timestamp",
        },
        "relationships": [
            "employees.dept_id → departments.dept_id",
            "employees.manager_id → employees.emp_id (self-join)",
            "attendance.emp_id → employees.emp_id",
            "leaves.emp_id → employees.emp_id",
            "users.emp_id → employees.emp_id",
        ],
    },
    {
        "table": "users",
        "description": (
            "Application authentication table. Each user is linked to an "
            "employee record. Stores hashed password and role (user/analyst/admin)."
        ),
        "columns": ["user_id", "emp_id", "username", "password_hash", "role", "last_login"],
        "column_details": {
            "user_id": "BIGINT PK, auto-generated identity",
            "emp_id": "BIGINT UNIQUE FK → employees.emp_id ON DELETE CASCADE",
            "username": "TEXT UNIQUE NOT NULL",
            "password_hash": "TEXT NOT NULL — bcrypt hash",
            "role": "TEXT CHECK IN ('user','analyst','admin') DEFAULT 'user'",
            "last_login": "TIMESTAMPTZ — last successful login timestamp",
        },
        "relationships": [
            "users.emp_id → employees.emp_id",
        ],
    },
    {
        "table": "attendance",
        "description": (
            "Daily attendance records per employee. Tracks check-in/out times, "
            "attendance status (Present, Absent, Late, Half Day, Leave), "
            "and calculated hours worked. UNIQUE constraint on (emp_id, att_date)."
        ),
        "columns": ["att_id", "emp_id", "att_date", "check_in", "check_out", "status", "hours_worked"],
        "column_details": {
            "att_id": "BIGINT PK, auto-generated identity",
            "emp_id": "BIGINT FK → employees.emp_id ON DELETE CASCADE",
            "att_date": "DATE NOT NULL — attendance date",
            "check_in": "TIME — clock-in time",
            "check_out": "TIME — clock-out time",
            "status": "TEXT CHECK IN ('Present','Absent','Late','Half Day','Leave')",
            "hours_worked": "NUMERIC(4,2) — computed hours",
        },
        "relationships": [
            "attendance.emp_id → employees.emp_id",
        ],
    },
    {
        "table": "leaves",
        "description": (
            "Leave requests per employee. Supports Sick, Casual, Annual, and "
            "Maternity leave types with Pending/Approved/Rejected workflow."
        ),
        "columns": ["leave_id", "emp_id", "leave_type", "start_date", "end_date", "status"],
        "column_details": {
            "leave_id": "BIGINT PK, auto-generated identity",
            "emp_id": "BIGINT FK → employees.emp_id",
            "leave_type": "TEXT CHECK IN ('Sick','Casual','Annual','Maternity')",
            "start_date": "DATE — leave starts",
            "end_date": "DATE — leave ends",
            "status": "TEXT CHECK IN ('Pending','Approved','Rejected') DEFAULT 'Pending'",
        },
        "relationships": [
            "leaves.emp_id → employees.emp_id",
        ],
    },
    {
        "table": "suppliers",
        "description": (
            "Supplier directory for raw materials. Stores contact person, "
            "phone, email, and address for each supplier."
        ),
        "columns": ["supplier_id", "supplier_name", "contact_person", "phone", "email", "address"],
        "column_details": {
            "supplier_id": "BIGINT PK, auto-generated identity",
            "supplier_name": "TEXT NOT NULL",
            "contact_person": "TEXT — main contact",
            "phone": "TEXT",
            "email": "TEXT",
            "address": "TEXT",
        },
        "relationships": [
            "raw_materials.supplier_id → suppliers.supplier_id",
        ],
    },
    {
        "table": "raw_materials",
        "description": (
            "Catalogue of raw materials used in garment production (fabrics, "
            "threads, buttons, zippers, etc.). Includes supplier link, unit "
            "cost, and reorder threshold."
        ),
        "columns": ["material_id", "material_name", "category", "unit", "supplier_id", "cost_per_unit", "reorder_level"],
        "column_details": {
            "material_id": "BIGINT PK, auto-generated identity",
            "material_name": "TEXT NOT NULL",
            "category": "TEXT — e.g. Fabric, Thread, Accessories",
            "unit": "TEXT — e.g. meters, spools, pieces",
            "supplier_id": "BIGINT FK → suppliers.supplier_id",
            "cost_per_unit": "NUMERIC(8,2) — unit cost",
            "reorder_level": "INT DEFAULT 100 — minimum stock threshold",
        },
        "relationships": [
            "raw_materials.supplier_id → suppliers.supplier_id",
            "inventory.material_id → raw_materials.material_id",
            "production_details.material_id → raw_materials.material_id",
        ],
    },
    {
        "table": "inventory",
        "description": (
            "Current stock levels for each raw material. One row per material. "
            "Quantity is compared against raw_materials.reorder_level for "
            "low-stock alerts."
        ),
        "columns": ["inv_id", "material_id", "quantity", "last_updated"],
        "column_details": {
            "inv_id": "BIGINT PK, auto-generated identity",
            "material_id": "BIGINT UNIQUE FK → raw_materials.material_id",
            "quantity": "NUMERIC(10,2) DEFAULT 0 — current stock",
            "last_updated": "TIMESTAMPTZ DEFAULT now()",
        },
        "relationships": [
            "inventory.material_id → raw_materials.material_id",
        ],
    },
    {
        "table": "products",
        "description": (
            "Finished product catalogue (garments). Categories: Mens, Womens, "
            "Kids. Sizes: S, M, L, XL, XXL. Each product has a unique code "
            "and selling price."
        ),
        "columns": ["product_id", "product_name", "product_code", "category", "size", "selling_price", "created_at"],
        "column_details": {
            "product_id": "BIGINT PK, auto-generated identity",
            "product_name": "TEXT NOT NULL",
            "product_code": "TEXT UNIQUE — SKU",
            "category": "TEXT CHECK IN ('Mens','Womens','Kids')",
            "size": "TEXT CHECK IN ('S','M','L','XL','XXL')",
            "selling_price": "NUMERIC(8,2)",
            "created_at": "TIMESTAMPTZ",
        },
        "relationships": [
            "production_orders.product_id → products.product_id",
            "sales_orders.product_id → products.product_id",
        ],
    },
    {
        "table": "production_orders",
        "description": (
            "Manufacturing work orders. Each order targets a product with a "
            "target quantity, tracks completion, and has a lifecycle status: "
            "Planned → In Progress → Completed (or Cancelled). Assigned to a department."
        ),
        "columns": ["order_id", "product_id", "order_date", "target_quantity", "completed_quantity", "status", "dept_id"],
        "column_details": {
            "order_id": "BIGINT PK, auto-generated identity",
            "product_id": "BIGINT FK → products.product_id",
            "order_date": "DATE — order creation date",
            "target_quantity": "INT — planned units",
            "completed_quantity": "INT DEFAULT 0 — finished units",
            "status": "TEXT CHECK IN ('Planned','In Progress','Completed','Cancelled') DEFAULT 'Planned'",
            "dept_id": "BIGINT FK → departments.dept_id",
        },
        "relationships": [
            "production_orders.product_id → products.product_id",
            "production_orders.dept_id → departments.dept_id",
            "production_details.order_id → production_orders.order_id",
        ],
    },
    {
        "table": "production_details",
        "description": (
            "Bill-of-materials detail for each production order. Records which "
            "raw materials were consumed and how much."
        ),
        "columns": ["detail_id", "order_id", "material_id", "quantity_used"],
        "column_details": {
            "detail_id": "BIGINT PK, auto-generated identity",
            "order_id": "BIGINT FK → production_orders.order_id",
            "material_id": "BIGINT FK → raw_materials.material_id",
            "quantity_used": "NUMERIC(10,2) — amount consumed",
        },
        "relationships": [
            "production_details.order_id → production_orders.order_id",
            "production_details.material_id → raw_materials.material_id",
        ],
    },
    {
        "table": "sales_orders",
        "description": (
            "Sales transaction records. Each row is a sale of a product to a "
            "customer with quantity, date, and total revenue."
        ),
        "columns": ["sale_id", "product_id", "quantity", "sale_date", "customer_name", "total_amount"],
        "column_details": {
            "sale_id": "BIGINT PK, auto-generated identity",
            "product_id": "BIGINT FK → products.product_id",
            "quantity": "INT — units sold",
            "sale_date": "DATE — transaction date",
            "customer_name": "TEXT — buyer name",
            "total_amount": "NUMERIC(10,2) — revenue from this sale",
        },
        "relationships": [
            "sales_orders.product_id → products.product_id",
        ],
    },
]


# ── Public API ──────────────────────────────────────────────────────────


async def ingest_schema(force: bool = False) -> dict:
    """
    Ingest database schema into vector embeddings.

    Parameters
    ----------
    force : bool
        If True, re-ingest even if vectors already exist.

    Returns
    -------
    dict
        Summary with keys ``tables_processed`` and ``skipped``.
    """
    store = get_vector_store()
    await store.ensure_collection()

    processed = 0
    skipped = 0

    for table_def in SCHEMA_DEFINITIONS:
        table_name = table_def["table"]

        # Idempotent check: skip if already embedded (unless force)
        if not force:
            already_exists = await store.exists(
                collection="schema",
                meta_filter={"table": table_name},
            )
            if already_exists:
                logger.debug("Schema for '%s' already exists — skipping.", table_name)
                skipped += 1
                continue

        # Build embedding text: rich semantic representation
        embed_text = _build_embed_text(table_def)

        # Generate embedding via LLM endpoint
        embedding = await generate_embedding(embed_text)

        # Store in vector DB
        await store.upsert(
            collection="schema",
            content=embed_text,
            metadata={
                "table": table_name,
                "description": table_def["description"],
                "columns": table_def["columns"],
                "column_details": table_def.get("column_details", {}),
                "relationships": table_def.get("relationships", []),
            },
            embedding=embedding,
        )

        processed += 1
        logger.info("Ingested schema for table '%s'.", table_name)

    summary = {"tables_processed": processed, "skipped": skipped}
    logger.info("Schema ingestion complete: %s", summary)
    return summary


def _build_embed_text(table_def: dict) -> str:
    """
    Compose a rich natural-language description of a table for embedding.
    This is what gets converted to a vector — NOT raw CREATE TABLE SQL.
    """
    parts = [
        f"Table: {table_def['table']}",
        f"Description: {table_def['description']}",
        f"Columns: {', '.join(table_def['columns'])}",
    ]

    if table_def.get("column_details"):
        details = "; ".join(
            f"{col}: {desc}" for col, desc in table_def["column_details"].items()
        )
        parts.append(f"Column details: {details}")

    if table_def.get("relationships"):
        parts.append(f"Relationships: {'; '.join(table_def['relationships'])}")

    return "\n".join(parts)

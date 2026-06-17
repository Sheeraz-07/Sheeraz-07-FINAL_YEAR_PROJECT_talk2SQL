"""
analytics.py — Real analytics endpoint for organization-level KPIs and charts.

This endpoint reads directly from the active database (Supabase or SQL Server)
and returns structured analytics useful for business decision making.
"""

from __future__ import annotations

import logging
import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Any

from fastapi import APIRouter, Query

from app.db.executor import execute_readonly_query

logger = logging.getLogger(__name__)

router = APIRouter()


def _normalize_database(database: str | None) -> str:
    if not database:
        return "supabase"

    key = database.strip().lower()
    aliases = {
        "supabase": "supabase",
        "postgres": "supabase",
        "postgresql": "supabase",
        "textile": "supabase",
        "textile_industry": "supabase",
        "textile_industry_db": "supabase",
        "garment_db": "supabase",
        "sql_server": "sql_server",
        "sqlserver": "sql_server",
        "mssql": "sql_server",
        "furniture": "sql_server",
        "furniturefactorydb": "sql_server",
    }
    return aliases.get(key, "supabase")


def _sanitize_range_days(range_days: int) -> int:
    allowed = {7, 30, 90, 365}
    return range_days if range_days in allowed else 30


def _to_number(value: Any, default: float = 0.0) -> float:
    if value is None:
        return default
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, (int, float)):
        return float(value)
    try:
        return float(value)
    except Exception:
        return default


def _serialize_value(value: Any) -> Any:
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, date):
        return value.isoformat()
    if isinstance(value, Decimal):
        return float(value)
    return value


def _serialize_rows(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [
        {k: _serialize_value(v) for k, v in row.items()}
        for row in rows
    ]


def _percent_change(current: float, previous: float) -> float:
    if previous == 0:
        return 0.0 if current == 0 else 100.0
    return ((current - previous) / previous) * 100.0


def _current_window_predicate(column: str, days: int, database: str) -> str:
    if database == "sql_server":
        return f"CAST({column} AS date) >= DATEADD(day, -{days}, CAST(GETDATE() AS date))"
    return f"{column}::date >= CURRENT_DATE - INTERVAL '{days} days'"


def _previous_window_predicate(column: str, days: int, database: str) -> str:
    if database == "sql_server":
        return (
            f"CAST({column} AS date) >= DATEADD(day, -{days * 2}, CAST(GETDATE() AS date)) "
            f"AND CAST({column} AS date) < DATEADD(day, -{days}, CAST(GETDATE() AS date))"
        )
    return (
        f"{column}::date >= CURRENT_DATE - INTERVAL '{days * 2} days' "
        f"AND {column}::date < CURRENT_DATE - INTERVAL '{days} days'"
    )


def _day_bucket(column: str, database: str) -> str:
    if database == "sql_server":
        return f"CONVERT(date, {column})"
    return f"DATE({column})"


def _limit_prefix(limit: int, database: str) -> str:
    if database == "sql_server":
        return f"TOP {limit} "
    return ""


def _limit_suffix(limit: int, database: str) -> str:
    if database == "sql_server":
        return ""
    return f" LIMIT {limit}"


async def _safe_query(sql: str, database: str, fallback: list[dict[str, Any]] | None = None) -> list[dict[str, Any]]:
    try:
        result = await execute_readonly_query(sql, database=database)
        return result["rows"]
    except Exception as exc:
        logger.warning("Analytics query failed: %s", exc)
        return fallback or []


@router.get("/analytics")
async def get_analytics(
    range_days: int = Query(default=30, description="Allowed: 7, 30, 90, 365"),
    database: str = Query(default="supabase", description="supabase or sql_server"),
) -> dict[str, Any]:
    request_id = str(uuid.uuid4())
    selected_database = _normalize_database(database)
    days = _sanitize_range_days(range_days)

    sales_current_where = _current_window_predicate("sale_date", days, selected_database)
    sales_prev_where = _previous_window_predicate("sale_date", days, selected_database)
    attendance_current_where = _current_window_predicate("att_date", days, selected_database)
    attendance_prev_where = _previous_window_predicate("att_date", days, selected_database)
    production_current_where = _current_window_predicate("order_date", days, selected_database)
    production_prev_where = _previous_window_predicate("order_date", days, selected_database)

    summary_current_sql = (
        "SELECT "
        "COALESCE(SUM(total_amount), 0) AS revenue, "
        "COUNT(*) AS total_orders, "
        "COALESCE(AVG(total_amount), 0) AS avg_order_value "
        "FROM sales_orders "
        f"WHERE {sales_current_where}"
    )
    summary_prev_sql = (
        "SELECT "
        "COALESCE(SUM(total_amount), 0) AS revenue, "
        "COUNT(*) AS total_orders, "
        "COALESCE(AVG(total_amount), 0) AS avg_order_value "
        "FROM sales_orders "
        f"WHERE {sales_prev_where}"
    )

    production_current_sql = (
        "SELECT "
        "COALESCE(SUM(completed_quantity), 0) AS completed_qty, "
        "COALESCE(SUM(target_quantity), 0) AS target_qty "
        "FROM production_orders "
        f"WHERE {production_current_where}"
    )
    production_prev_sql = (
        "SELECT "
        "COALESCE(SUM(completed_quantity), 0) AS completed_qty, "
        "COALESCE(SUM(target_quantity), 0) AS target_qty "
        "FROM production_orders "
        f"WHERE {production_prev_where}"
    )

    attendance_current_sql = (
        "SELECT "
        "COALESCE(100.0 * SUM(CASE WHEN LOWER(status) IN ('present', 'p', 'on_time', 'late') THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 0) "
        "AS attendance_rate "
        "FROM attendance "
        f"WHERE {attendance_current_where}"
    )
    attendance_prev_sql = (
        "SELECT "
        "COALESCE(100.0 * SUM(CASE WHEN LOWER(status) IN ('present', 'p', 'on_time', 'late') THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 0) "
        "AS attendance_rate "
        "FROM attendance "
        f"WHERE {attendance_prev_where}"
    )

    sales_day = _day_bucket("sale_date", selected_database)
    attendance_day = _day_bucket("att_date", selected_database)

    sales_trend_sql = (
        "SELECT "
        f"{sales_day} AS day, "
        "COALESCE(SUM(total_amount), 0) AS revenue, "
        "COUNT(*) AS orders "
        "FROM sales_orders "
        f"WHERE {sales_current_where} "
        f"GROUP BY {sales_day} "
        f"ORDER BY {sales_day}"
    )

    attendance_trend_sql = (
        "SELECT "
        f"{attendance_day} AS day, "
        "COALESCE(100.0 * SUM(CASE WHEN LOWER(status) IN ('present', 'p', 'on_time', 'late') THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 0) "
        "AS attendance_rate "
        "FROM attendance "
        f"WHERE {attendance_current_where} "
        f"GROUP BY {attendance_day} "
        f"ORDER BY {attendance_day}"
    )

    products_table = "furniture_products" if selected_database == "sql_server" else "products"
    inventory_table = "material_inventory" if selected_database == "sql_server" else "inventory"

    if selected_database == "sql_server":
        top_products_sql = (
            "SELECT TOP 8 "
            "p.product_name AS product_name, "
            "SUM(sod.quantity) AS units_sold, "
            "COALESCE(SUM(sod.line_total), 0) AS revenue "
            "FROM sales_orders so "
            "JOIN sales_order_details sod ON so.sale_id = sod.sale_id "
            f"JOIN {products_table} p ON p.product_id = sod.product_id "
            f"WHERE {sales_current_where} "
            "GROUP BY p.product_name "
            "ORDER BY revenue DESC"
        )
        
        category_mix_sql = (
            "SELECT "
            "COALESCE(p.category, 'Uncategorized') AS category, "
            "COALESCE(SUM(sod.line_total), 0) AS revenue "
            "FROM sales_orders so "
            "JOIN sales_order_details sod ON so.sale_id = sod.sale_id "
            f"JOIN {products_table} p ON p.product_id = sod.product_id "
            f"WHERE {sales_current_where} "
            "GROUP BY COALESCE(p.category, 'Uncategorized') "
            "ORDER BY revenue DESC"
        )
    else:
        top_products_sql = (
            "SELECT "
            "p.product_name AS product_name, "
            "SUM(so.quantity) AS units_sold, "
            "COALESCE(SUM(so.total_amount), 0) AS revenue "
            "FROM sales_orders so "
            f"JOIN {products_table} p ON p.product_id = so.product_id "
            f"WHERE {sales_current_where} "
            "GROUP BY p.product_name "
            "ORDER BY revenue DESC LIMIT 8"
        )

        category_mix_sql = (
            "SELECT "
            "COALESCE(p.category, 'Uncategorized') AS category, "
            "COALESCE(SUM(so.total_amount), 0) AS revenue "
            "FROM sales_orders so "
            f"JOIN {products_table} p ON p.product_id = so.product_id "
            f"WHERE {sales_current_where} "
            "GROUP BY COALESCE(p.category, 'Uncategorized') "
            "ORDER BY revenue DESC"
        )

    dept_productivity_sql = (
        "SELECT "
        f"{_limit_prefix(8, selected_database)}"
        "COALESCE(d.dept_name, 'Unknown') AS department, "
        "COALESCE(SUM(po.completed_quantity), 0) AS completed_qty, "
        "COALESCE(SUM(po.target_quantity), 0) AS target_qty, "
        "COALESCE(100.0 * SUM(po.completed_quantity) / NULLIF(SUM(po.target_quantity), 0), 0) AS completion_rate "
        "FROM production_orders po "
        "LEFT JOIN departments d ON d.dept_id = po.dept_id "
        f"WHERE {production_current_where} "
        "GROUP BY d.dept_name "
        "ORDER BY completion_rate DESC"
        f"{_limit_suffix(8, selected_database)}"
    )

    total_employees_sql = (
        "SELECT COUNT(*) AS total_employees FROM employees"
    )

    production_orders_count_sql = (
        "SELECT COUNT(*) AS total_production_orders "
        "FROM production_orders "
        f"WHERE {production_current_where}"
    )

    production_orders_count_prev_sql = (
        "SELECT COUNT(*) AS total_production_orders "
        "FROM production_orders "
        f"WHERE {production_prev_where}"
    )

    low_stock_summary_sql = (
        "SELECT COUNT(*) AS low_stock_items "
        f"FROM {inventory_table} i "
        "JOIN raw_materials rm ON rm.material_id = i.material_id "
        "WHERE i.quantity < rm.reorder_level"
    )

    low_stock_detail_sql = (
        "SELECT "
        f"{_limit_prefix(10, selected_database)}"
        "rm.material_name, "
        "i.quantity AS current_stock, "
        "rm.reorder_level, "
        "(rm.reorder_level - i.quantity) AS deficit "
        f"FROM {inventory_table} i "
        "JOIN raw_materials rm ON rm.material_id = i.material_id "
        "WHERE i.quantity < rm.reorder_level "
        "ORDER BY deficit DESC"
        f"{_limit_suffix(10, selected_database)}"
    )

    summary_current = (await _safe_query(summary_current_sql, selected_database, [{}]))[0]
    summary_prev = (await _safe_query(summary_prev_sql, selected_database, [{}]))[0]
    production_current = (await _safe_query(production_current_sql, selected_database, [{}]))[0]
    production_prev = (await _safe_query(production_prev_sql, selected_database, [{}]))[0]
    attendance_current = (await _safe_query(attendance_current_sql, selected_database, [{}]))[0]
    attendance_prev = (await _safe_query(attendance_prev_sql, selected_database, [{}]))[0]

    sales_trend = _serialize_rows(await _safe_query(sales_trend_sql, selected_database))
    attendance_trend = _serialize_rows(await _safe_query(attendance_trend_sql, selected_database))
    top_products = _serialize_rows(await _safe_query(top_products_sql, selected_database))
    category_mix = _serialize_rows(await _safe_query(category_mix_sql, selected_database))
    dept_productivity = _serialize_rows(await _safe_query(dept_productivity_sql, selected_database))

    total_employees_result = (await _safe_query(total_employees_sql, selected_database, [{}]))[0]
    production_orders_count = (await _safe_query(production_orders_count_sql, selected_database, [{}]))[0]
    production_orders_count_prev = (await _safe_query(production_orders_count_prev_sql, selected_database, [{}]))[0]

    low_stock_summary = (await _safe_query(low_stock_summary_sql, selected_database, [{}]))[0]
    low_stock_items = _serialize_rows(await _safe_query(low_stock_detail_sql, selected_database))

    revenue = _to_number(summary_current.get("revenue"))
    total_orders = _to_number(summary_current.get("total_orders"))
    avg_order_value = _to_number(summary_current.get("avg_order_value"))

    prev_revenue = _to_number(summary_prev.get("revenue"))
    prev_total_orders = _to_number(summary_prev.get("total_orders"))
    prev_avg_order_value = _to_number(summary_prev.get("avg_order_value"))

    completed_qty = _to_number(production_current.get("completed_qty"))
    target_qty = _to_number(production_current.get("target_qty"))
    prev_completed_qty = _to_number(production_prev.get("completed_qty"))
    prev_target_qty = _to_number(production_prev.get("target_qty"))

    fulfillment_rate = 0.0 if target_qty == 0 else (completed_qty / target_qty) * 100.0
    prev_fulfillment_rate = 0.0 if prev_target_qty == 0 else (prev_completed_qty / prev_target_qty) * 100.0

    attendance_rate = _to_number(attendance_current.get("attendance_rate"))
    prev_attendance_rate = _to_number(attendance_prev.get("attendance_rate"))

    total_employees = int(_to_number(total_employees_result.get("total_employees"), default=0.0))
    production_orders_current = int(_to_number(production_orders_count.get("total_production_orders"), default=0.0))
    production_orders_prev = int(_to_number(production_orders_count_prev.get("total_production_orders"), default=0.0))

    low_stock_count = int(_to_number(low_stock_summary.get("low_stock_items"), default=0.0))

    payload = {
        "request_id": request_id,
        "database": selected_database,
        "range_days": days,
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "kpis": {
            "total_revenue": {
                "value": round(revenue, 2),
                "change_pct": round(_percent_change(revenue, prev_revenue), 2),
            },
            "total_orders": {
                "value": int(total_orders),
                "change_pct": round(_percent_change(total_orders, prev_total_orders), 2),
            },
            "avg_order_value": {
                "value": round(avg_order_value, 2),
                "change_pct": round(_percent_change(avg_order_value, prev_avg_order_value), 2),
            },
            "fulfillment_rate": {
                "value": round(fulfillment_rate, 2),
                "change_pct": round(_percent_change(fulfillment_rate, prev_fulfillment_rate), 2),
            },
            "attendance_rate": {
                "value": round(attendance_rate, 2),
                "change_pct": round(_percent_change(attendance_rate, prev_attendance_rate), 2),
            },
            "low_stock_items": {
                "value": low_stock_count,
                "change_pct": 0.0,
            },
            "total_employees": {
                "value": total_employees,
                "change_pct": 0.0,
            },
            "total_production_orders": {
                "value": production_orders_current,
                "change_pct": round(_percent_change(production_orders_current, production_orders_prev), 2),
            },
        },
        "charts": {
            "sales_trend": sales_trend,
            "attendance_trend": attendance_trend,
            "category_mix": category_mix,
            "top_products": top_products,
            "department_productivity": dept_productivity,
        },
        "alerts": {
            "low_stock_items": low_stock_items,
        },
    }

    return payload

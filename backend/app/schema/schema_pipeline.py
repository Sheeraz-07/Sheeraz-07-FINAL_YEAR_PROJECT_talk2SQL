"""
schema_pipeline.py - DB-agnostic schema normalization, compression, caching,
and query-time filtering to keep LLM prompts compact.
"""

from __future__ import annotations

import hashlib
import json
import re
from collections import defaultdict
from typing import Any


def normalize_schema(
    raw_tables: list[str],
    raw_columns: list[dict[str, Any]],
    raw_fks: list[dict[str, Any]],
    raw_constraints: list[dict[str, Any]],
    db_type: str,
) -> tuple[list[str], list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]]]:
    """Normalize metadata shape so both SQL Server and Supabase use one pipeline."""
    tables = [str(t).lower() for t in raw_tables]

    columns: list[dict[str, Any]] = []
    for col in raw_columns:
        columns.append(
            {
                "table_name": str(col["table_name"]).lower(),
                "column_name": str(col["column_name"]).lower(),
                "is_pk": bool(col.get("is_pk", False)),
                "data_type": str(col.get("data_type", "")).lower(),
                "is_nullable": str(col.get("is_nullable", "YES")).upper(),
                "column_default": col.get("column_default"),
            }
        )

    foreign_keys: list[dict[str, Any]] = []
    for fk in raw_fks:
        foreign_keys.append(
            {
                "table_name": str(fk["table_name"]).lower(),
                "column_name": str(fk["column_name"]).lower(),
                "referenced_table": str(fk["referenced_table"]).lower(),
                "referenced_column": str(fk.get("referenced_column", "id")).lower(),
            }
        )

    constraints: list[dict[str, Any]] = []
    for chk in raw_constraints:
        constraints.append(
            {
                "table_name": str(chk["table_name"]).lower(),
                "definition": str(chk.get("definition", "")),
            }
        )

    return tables, columns, foreign_keys, constraints


class SchemaCompressor:
    """Compress schema while preserving high-value columns (PK/FK/ID)."""

    def __init__(
        self,
        tables: list[str],
        columns: list[dict[str, Any]],
        fks: list[dict[str, Any]],
        constraints: list[dict[str, Any]],
    ):
        self.tables = tables
        self.columns = columns
        self.fks = fks
        self.constraints = constraints

        self._fk_lookup: dict[tuple[str, str], tuple[str, str]] = {}
        for fk in self.fks:
            key = (fk["table_name"], fk["column_name"])
            val = (fk["referenced_table"], fk["referenced_column"])
            self._fk_lookup[key] = val

    def build_schema(self) -> dict[str, list[dict[str, Any]]]:
        schema: dict[str, list[dict[str, Any]]] = defaultdict(list)

        for col in self.columns:
            table_name = col["table_name"]
            column_name = col["column_name"]
            fk_target = self._fk_lookup.get((table_name, column_name))

            schema[table_name].append(
                {
                    "column_name": column_name,
                    "is_pk": bool(col.get("is_pk", False)),
                    "is_fk": fk_target is not None,
                    "fk_to": fk_target,
                    "data_type": col.get("data_type", ""),
                    "is_nullable": col.get("is_nullable", "YES"),
                    "column_default": col.get("column_default"),
                }
            )

        return schema

    def extract_constraints(self) -> dict[str, list[str]]:
        out: dict[str, list[str]] = defaultdict(list)
        for c in self.constraints:
            definition = c.get("definition", "")
            if "in" in definition.lower():
                values = re.findall(r"\((.*?)\)", definition)
                if values:
                    out[c["table_name"]].append(values[0])
        return out

    def compress(self, max_cols: int = 8) -> dict[str, list[dict[str, Any]]]:
        base = self.build_schema()
        compressed: dict[str, list[dict[str, Any]]] = {}

        for table in self.tables:
            cols = base.get(table, [])

            important = [
                c
                for c in cols
                if c["is_pk"] or c["is_fk"] or c["column_name"].endswith("_id") or c["column_name"] == "id"
            ]
            others = [c for c in cols if c not in important]

            final = important + others
            compressed[table] = final[:max_cols]

        return compressed

    def generate(self, max_cols: int = 8) -> tuple[dict[str, list[dict[str, Any]]], dict[str, list[str]]]:
        compressed = self.compress(max_cols=max_cols)
        constraints = self.extract_constraints()
        return compressed, constraints


def generate_schema_hash(columns: list[dict[str, Any]], fks: list[dict[str, Any]]) -> str:
    raw = json.dumps({"columns": columns, "fks": fks}, sort_keys=True)
    return hashlib.md5(raw.encode("utf-8")).hexdigest()


class SchemaCache:
    def __init__(self) -> None:
        self.cache: dict[str, dict[str, Any]] = {}

    def get(self, db_key: str) -> dict[str, Any] | None:
        return self.cache.get(db_key)

    def set(self, db_key: str, value: dict[str, Any]) -> None:
        self.cache[db_key] = value


_SCHEMA_CACHE = SchemaCache()


def _tokenize(text_value: str) -> set[str]:
    normalized = text_value.replace("_", " ").replace(".", " ").lower()
    tokens = re.findall(r"[a-z0-9]+", normalized)
    return {t for t in tokens if len(t) > 1}


def filter_schema(
    compressed_schema: dict[str, list[dict[str, Any]]],
    user_query: str,
    top_k: int = 5,
) -> dict[str, list[dict[str, Any]]]:
    query_tokens = _tokenize(user_query)
    if not query_tokens:
        selected_tables = list(compressed_schema.keys())[:top_k]
        return {t: compressed_schema[t] for t in selected_tables}

    scored: list[tuple[float, str]] = []

    for table, cols in compressed_schema.items():
        table_tokens = _tokenize(table)
        col_tokens = set()
        for col in cols:
            col_tokens.update(_tokenize(col["column_name"]))

        score = 0.0
        for token in query_tokens:
            if token in table_tokens:
                score += 4.0
            if token in col_tokens:
                score += 2.0

            table_text = table.lower()
            if token.endswith("s") and token[:-1] and token[:-1] in table_text:
                score += 0.5
            elif f"{token}s" in table_text:
                score += 0.5

        scored.append((score, table))

    scored.sort(key=lambda x: x[0], reverse=True)

    chosen = [t for s, t in scored if s > 0][:top_k]
    if not chosen:
        chosen = [t for _, t in scored[:top_k]]

    return {t: compressed_schema[t] for t in chosen}


def _to_prompt_snippets(
    schema: dict[str, list[dict[str, Any]]],
    constraints: dict[str, list[str]],
) -> list[dict[str, Any]]:
    snippets: list[dict[str, Any]] = []

    for table, cols in schema.items():
        col_names = [c["column_name"] for c in cols]

        column_details: dict[str, str] = {}
        relationships: list[str] = []

        for c in cols:
            detail_parts = [str(c.get("data_type", "")).strip()]
            if str(c.get("is_nullable", "YES")).upper() == "NO":
                detail_parts.append("NOT NULL")
            if c.get("column_default") is not None:
                detail_parts.append(f"DEFAULT {c['column_default']}")
            if c.get("is_pk"):
                detail_parts.append("PK")
            if c.get("is_fk") and c.get("fk_to"):
                ref_table, ref_col = c["fk_to"]
                detail_parts.append(f"FK->{ref_table}.{ref_col}")
                relationships.append(f"{table}.{c['column_name']} -> {ref_table}.{ref_col}")

            column_details[c["column_name"]] = " ".join([p for p in detail_parts if p])

        constraint_entries = constraints.get(table, [])
        description = f"Table: {table}"
        if constraint_entries:
            description += f" | Constraints: {'; '.join(constraint_entries[:2])}"

        snippets.append(
            {
                "table": table,
                "description": description,
                "columns": col_names,
                "column_details": column_details,
                "relationships": list(dict.fromkeys(relationships)),
                "similarity": 1.0,
            }
        )

    return snippets


def get_llm_schema(
    db_key: str,
    raw_data: tuple[list[str], list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]]],
    user_query: str,
    db_type: str,
    top_k: int = 5,
    max_cols: int = 8,
) -> list[dict[str, Any]]:
    normalized = normalize_schema(*raw_data, db_type)
    tables, columns, fks, constraints = normalized

    schema_hash = generate_schema_hash(columns, fks)
    cached = _SCHEMA_CACHE.get(db_key)

    if not cached or cached["hash"] != schema_hash:
        compressor = SchemaCompressor(tables, columns, fks, constraints)
        compressed, parsed_constraints = compressor.generate(max_cols=max_cols)
        _SCHEMA_CACHE.set(
            db_key,
            {
                "hash": schema_hash,
                "compressed": compressed,
                "constraints": parsed_constraints,
            },
        )

    cache_obj = _SCHEMA_CACHE.get(db_key) or {"compressed": {}, "constraints": {}}

    # Always send whole compressed schema so the LLM has full DB context,
    # while still keeping token usage controlled by compression.
    return _to_prompt_snippets(cache_obj["compressed"], cache_obj["constraints"])

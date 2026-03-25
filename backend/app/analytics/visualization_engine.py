from __future__ import annotations

import re
from collections import Counter
from datetime import date, datetime
from decimal import Decimal
from typing import Any

NUMERIC_HINTS = {
    "int",
    "integer",
    "bigint",
    "smallint",
    "numeric",
    "decimal",
    "real",
    "double",
    "float",
    "money",
    "number",
}
DATETIME_HINTS = {
    "date",
    "datetime",
    "timestamp",
    "timestamptz",
    "time",
    "smalldatetime",
}
BOOL_HINTS = {"bool", "boolean", "bit"}


def _is_numeric(value: Any) -> bool:
    return isinstance(value, (int, float, Decimal)) and not isinstance(value, bool)


def _is_datetime(value: Any) -> bool:
    if isinstance(value, (datetime, date)):
        return True
    if not isinstance(value, str):
        return False
    value = value.strip()
    if not value:
        return False
    return bool(
        re.match(r"^\d{4}-\d{2}-\d{2}", value)
        or re.match(r"^\d{2}/\d{2}/\d{4}$", value)
        or re.match(r"^\d{4}/\d{2}/\d{2}$", value)
    )


def _normalize_type_from_hint(type_hint: str) -> str | None:
    hint = (type_hint or "").lower()
    if any(token in hint for token in NUMERIC_HINTS):
        return "numeric"
    if any(token in hint for token in DATETIME_HINTS):
        return "datetime"
    if any(token in hint for token in BOOL_HINTS):
        return "boolean"
    if hint:
        return "categorical"
    return None


def _detect_column_type(values: list[Any], schema_hints: list[str] | None) -> str:
    # Prefer schema hints when available, then verify with sampled values.
    if schema_hints:
        normalized = [_normalize_type_from_hint(h) for h in schema_hints]
        normalized = [n for n in normalized if n]
        if normalized:
            vote = Counter(normalized).most_common(1)[0][0]
            if vote in {"numeric", "datetime", "boolean"}:
                return vote

    non_null = [v for v in values if v is not None and v != ""]
    if not non_null:
        return "categorical"

    numeric_count = sum(1 for v in non_null if _is_numeric(v))
    datetime_count = sum(1 for v in non_null if _is_datetime(v))
    bool_count = sum(1 for v in non_null if isinstance(v, bool))

    total = len(non_null)
    if numeric_count / total >= 0.8:
        return "numeric"
    if datetime_count / total >= 0.8:
        return "datetime"
    if bool_count / total >= 0.8:
        return "boolean"
    return "categorical"


def analyze_dataset(data: list[dict[str, Any]], schema: dict[str, Any], query: str) -> dict[str, Any]:
    """
    Build dataset metadata used by the visualization recommendation engine.
    """
    row_count = len(data)
    if row_count == 0:
        return {
            "row_count": 0,
            "columns": [],
            "column_names": [],
            "numeric_columns": [],
            "categorical_columns": [],
            "datetime_columns": [],
            "boolean_columns": [],
            "aggregation_present": False,
            "is_grouped_data": False,
            "null_heavy": True,
            "needs_table_only": True,
            "schema_table_count": len(schema.get("tables", [])),
            "database": schema.get("database", "supabase"),
        }

    column_names = list(data[0].keys())
    hints = schema.get("column_type_hints", {}) if isinstance(schema, dict) else {}

    columns_meta: list[dict[str, Any]] = []
    numeric_columns: list[str] = []
    categorical_columns: list[str] = []
    datetime_columns: list[str] = []
    boolean_columns: list[str] = []

    for column in column_names:
        values = [row.get(column) for row in data]
        non_null = [v for v in values if v is not None and v != ""]
        unique_count = len({str(v) for v in non_null})
        null_ratio = 1.0 - (len(non_null) / max(len(values), 1))

        column_type = _detect_column_type(values, hints.get(column.lower()))

        if column_type == "numeric":
            numeric_columns.append(column)
        elif column_type == "datetime":
            datetime_columns.append(column)
        elif column_type == "boolean":
            boolean_columns.append(column)
        else:
            categorical_columns.append(column)

        columns_meta.append(
            {
                "name": column,
                "type": column_type,
                "cardinality": unique_count,
                "null_ratio": round(null_ratio, 4),
                "sample_values": [str(v) for v in non_null[:3]],
            }
        )

    query_lower = (query or "").lower()
    aggregation_present = bool(re.search(r"\b(sum|count|avg|average|min|max|group\s+by|having)\b", query_lower))

    grouped_by_shape = (
        len(numeric_columns) >= 1
        and (len(categorical_columns) >= 1 or len(datetime_columns) >= 1)
        and row_count <= 500
    )
    is_grouped_data = aggregation_present or grouped_by_shape

    null_heavy = all(c["null_ratio"] >= 0.8 for c in columns_meta) if columns_meta else True

    needs_table_only = (
        not aggregation_present
        and len(numeric_columns) == 0
        and len(datetime_columns) == 0
    )

    return {
        "row_count": row_count,
        "columns": columns_meta,
        "column_names": column_names,
        "numeric_columns": numeric_columns,
        "categorical_columns": categorical_columns,
        "datetime_columns": datetime_columns,
        "boolean_columns": boolean_columns,
        "aggregation_present": aggregation_present,
        "is_grouped_data": is_grouped_data,
        "null_heavy": null_heavy,
        "needs_table_only": needs_table_only,
        "schema_table_count": len(schema.get("tables", [])),
        "database": schema.get("database", "supabase"),
    }


def suggest_visualizations(metadata: dict[str, Any]) -> dict[str, Any]:
    """
    Rule-based chart suggestion engine.
    """
    all_supported = [
        "bar",
        "line",
        "pie",
        "scatter",
        "histogram",
        "box",
        "area",
        "stacked_bar",
        "grouped_bar",
        "table",
    ]

    if metadata.get("row_count", 0) == 0 or metadata.get("null_heavy"):
        return {
            "default_charts": [],
            "available_charts": all_supported,
            "fallback_message": "Not enough structured data for visualization",
        }

    numeric = metadata.get("numeric_columns", [])
    categorical = metadata.get("categorical_columns", [])
    datetime_cols = metadata.get("datetime_columns", [])
    agg = metadata.get("aggregation_present", False)
    is_grouped = metadata.get("is_grouped_data", False)

    charts: list[dict[str, Any]] = []

    # Case 6: raw table (no aggregation and no strong chart signal)
    if metadata.get("needs_table_only") and not agg:
        return {
            "default_charts": [
                {
                    "type": "table",
                    "title": "Table View",
                    "reason": "Raw row-level dataset detected.",
                }
            ],
            "available_charts": all_supported,
            "suggestion": "Apply aggregation for better insights",
        }

    # Case 2: time series
    if datetime_cols and numeric:
        charts.append(
            {
                "type": "line",
                "x": datetime_cols[0],
                "y": numeric[0],
                "title": f"{numeric[0]} over {datetime_cols[0]}",
                "reason": "Time-series trend is best read as a line.",
            }
        )
        charts.append(
            {
                "type": "area",
                "x": datetime_cols[0],
                "y": numeric[0],
                "title": f"Area trend of {numeric[0]}",
                "reason": "Area chart highlights cumulative movement across time.",
            }
        )

    # Case 5: multiple categories + numeric
    if len(categorical) >= 2 and numeric:
        charts.append(
            {
                "type": "stacked_bar",
                "x": categorical[0],
                "series": categorical[1],
                "y": numeric[0],
                "title": f"{numeric[0]} by {categorical[0]} and {categorical[1]}",
                "reason": "Stacked bars compare contribution across two category dimensions.",
            }
        )
        charts.append(
            {
                "type": "grouped_bar",
                "x": categorical[0],
                "series": categorical[1],
                "y": numeric[0],
                "title": f"Grouped comparison by {categorical[0]}",
                "reason": "Grouped bars support side-by-side category comparison.",
            }
        )

    # Case 1: categorical + numeric (grouped data)
    if len(categorical) >= 1 and len(numeric) >= 1 and is_grouped:
        charts.append(
            {
                "type": "bar",
                "x": categorical[0],
                "y": numeric[0],
                "title": f"{numeric[0]} by {categorical[0]}",
                "reason": "Bar chart is the default for category-to-value comparisons.",
            }
        )

        category_cardinality = 0
        for col in metadata.get("columns", []):
            if col.get("name") == categorical[0]:
                category_cardinality = int(col.get("cardinality", 0))
                break

        if 0 < category_cardinality < 6:
            charts.append(
                {
                    "type": "pie",
                    "labels": categorical[0],
                    "values": numeric[0],
                    "title": f"Share of {numeric[0]} by {categorical[0]}",
                    "reason": "Few categories make pie slices readable.",
                }
            )

    # Case 3: single numeric column
    if len(numeric) == 1 and not categorical and not datetime_cols:
        charts.append(
            {
                "type": "histogram",
                "x": numeric[0],
                "title": f"Distribution of {numeric[0]}",
                "reason": "Histogram reveals distribution shape.",
            }
        )
        charts.append(
            {
                "type": "box",
                "x": numeric[0],
                "title": f"Spread of {numeric[0]}",
                "reason": "Box plot highlights median and outlier range.",
            }
        )

    # Case 4: two numeric columns
    if len(numeric) >= 2:
        charts.append(
            {
                "type": "scatter",
                "x": numeric[0],
                "y": numeric[1],
                "title": f"{numeric[1]} vs {numeric[0]}",
                "reason": "Scatter plot is best for numeric correlation.",
            }
        )

    if not charts:
        charts.append(
            {
                "type": "table",
                "title": "Table View",
                "reason": "No strong chart mapping found.",
            }
        )

    deduped: list[dict[str, Any]] = []
    seen: set[str] = set()
    for chart in charts:
        signature = f"{chart.get('type')}|{chart.get('x')}|{chart.get('y')}|{chart.get('series')}"
        if signature in seen:
            continue
        seen.add(signature)
        deduped.append(chart)

    return {
        "default_charts": deduped[:3],
        "available_charts": all_supported,
    }


def build_visualization_payload(
    data: list[dict[str, Any]],
    schema_snapshot: dict[str, Any],
    query: str,
) -> dict[str, Any]:
    metadata = analyze_dataset(data=data, schema=schema_snapshot, query=query)
    suggestion = suggest_visualizations(metadata)

    return {
        "metadata": metadata,
        "default_charts": suggestion.get("default_charts", []),
        "available_charts": suggestion.get("available_charts", []),
        "fallback_message": suggestion.get("fallback_message"),
        "suggestion": suggestion.get("suggestion"),
    }

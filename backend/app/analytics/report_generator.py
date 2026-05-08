"""
Report Generation Engine - Backend Utilities

This module provides utilities for generating comprehensive reports
with multiple sections, visualizations, and insights.
"""

from typing import Any, Optional
from dataclasses import dataclass, asdict
from datetime import datetime
import json


@dataclass
class MetricData:
    """Represents a single metric in a report"""
    label: str
    value: str | float | int
    trend: Optional[str] = None  # 'up', 'down', 'neutral'
    trend_value: Optional[float] = None


@dataclass
class ReportSectionMetadata:
    """Metadata for a report section"""
    id: str
    title: str
    description: str
    section_type: str  # 'metrics', 'chart', 'table', 'summary'
    chart_type: Optional[str] = None  # 'bar', 'line', 'pie', etc.


class ReportGenerator:
    """
    Generates professional reports from query results.
    
    Supports:
    - Multiple section types (metrics, charts, tables, summaries)
    - Automatic data analysis and visualization suggestions
    - Professional formatting and descriptions
    """

    def __init__(self, title: str, report_type: str, database: str):
        self.title = title
        self.report_type = report_type  # sales, attendance, inventory, etc.
        self.database = database
        self.sections = []
        self.created_at = datetime.utcnow().isoformat()

    def add_metrics_section(
        self,
        section_id: str,
        title: str,
        description: str,
        metrics: list[MetricData],
    ) -> None:
        """Add a metrics section to the report"""
        self.sections.append({
            "id": section_id,
            "title": title,
            "description": description,
            "type": "metrics",
            "metrics": [asdict(m) for m in metrics],
            "data": [],
            "columns": []
        })

    def add_chart_section(
        self,
        section_id: str,
        title: str,
        description: str,
        chart_type: str,  # bar, line, pie, area, stacked_bar
        data: list[dict],
        columns: Optional[list[str]] = None,
    ) -> None:
        """Add a chart section to the report"""
        self.sections.append({
            "id": section_id,
            "title": title,
            "description": description,
            "type": "chart",
            "chartType": chart_type,
            "data": data,
            "columns": columns or list(data[0].keys()) if data else [],
        })

    def add_table_section(
        self,
        section_id: str,
        title: str,
        description: str,
        data: list[dict],
        columns: Optional[list[str]] = None,
    ) -> None:
        """Add a table section to the report"""
        self.sections.append({
            "id": section_id,
            "title": title,
            "description": description,
            "type": "table",
            "data": data,
            "columns": columns or list(data[0].keys()) if data else [],
        })

    def add_summary_section(
        self,
        section_id: str,
        title: str,
        description: str,
        summary_text: str,
    ) -> None:
        """Add a summary/insights section to the report"""
        self.sections.append({
            "id": section_id,
            "title": title,
            "description": description,
            "type": "summary",
            "summary": summary_text,
            "data": [],
            "columns": [],
        })

    def to_dict(
        self,
        sql: str = "",
        raw_data: Optional[list[dict]] = None,
        columns: Optional[list[str]] = None,
        row_count: int = 0,
        execution_time: float = 0.0,
    ) -> dict[str, Any]:
        """Convert report to dictionary format"""
        return {
            "id": self._generate_id(),
            "title": self.title,
            "reportType": self.report_type,
            "sections": self.sections,
            "metadata": {
                "generatedAt": self.created_at,
                "database": self.database,
            },
            "sql": sql,
            "rawData": raw_data or [],
            "columns": columns or [],
            "rowCount": row_count,
            "executionTime": execution_time,
            "createdAt": self.created_at,
            "status": "generated",
            "tags": [self.report_type],
        }

    def to_json(self, **kwargs) -> str:
        """Convert report to JSON string"""
        return json.dumps(self.to_dict(**kwargs), indent=2, default=str)

    @staticmethod
    def _generate_id() -> str:
        """Generate a unique report ID"""
        import uuid
        return str(uuid.uuid4())


def analyze_data_for_report(data: list[dict], columns: list[str]) -> dict[str, Any]:
    """
    Analyze query result data to suggest report structure.
    
    Returns suggestions for:
    - Key metrics
    - Visualization types
    - Section organization
    """
    if not data or not columns:
        return {"metrics": [], "suggestions": []}

    analysis = {
        "total_rows": len(data),
        "columns": columns,
        "column_types": {},
        "numeric_columns": [],
        "categorical_columns": [],
        "suggested_metrics": [],
        "suggested_charts": [],
    }

    # Analyze column types
    for col in columns:
        sample_values = [row.get(col) for row in data[:5] if col in row]
        numeric_count = sum(1 for v in sample_values if isinstance(v, (int, float)))

        if numeric_count / len(sample_values) > 0.7 if sample_values else False:
            analysis["numeric_columns"].append(col)
            analysis["column_types"][col] = "numeric"
        else:
            analysis["categorical_columns"].append(col)
            analysis["column_types"][col] = "categorical"

    # Suggest metrics from numeric columns
    for col in analysis["numeric_columns"][:3]:
        values = [row.get(col) for row in data if isinstance(row.get(col), (int, float))]
        if values:
            analysis["suggested_metrics"].append({
                "label": col.replace('_', ' ').title(),
                "value": sum(values) / len(values),
                "type": "average"
            })

    # Suggest chart types based on data
    if analysis["numeric_columns"] and analysis["categorical_columns"]:
        if len(analysis["categorical_columns"]) > 5:
            analysis["suggested_charts"].append("line")
            analysis["suggested_charts"].append("area")
        else:
            analysis["suggested_charts"].append("bar")
            analysis["suggested_charts"].append("pie")

    if len(analysis["numeric_columns"]) >= 2:
        analysis["suggested_charts"].append("scatter")

    return analysis


def generate_report_description(report_type: str, query_context: Optional[str] = None) -> str:
    """Generate an appropriate description for a report type"""
    descriptions = {
        "sales": "Comprehensive sales analysis including revenue trends, top products, and customer insights.",
        "attendance": "Attendance patterns and workforce engagement metrics.",
        "inventory": "Stock levels, material movement, and inventory optimization analysis.",
        "production": "Production output, efficiency metrics, and order fulfillment status.",
        "hr_analytics": "Human resources metrics including workforce composition and performance.",
        "financial": "Financial performance including revenue, expenses, and profitability metrics.",
        "custom": f"Custom analysis report{f' - {query_context}' if query_context else ''}",
    }
    return descriptions.get(report_type, "Detailed analysis report")

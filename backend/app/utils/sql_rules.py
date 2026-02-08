"""
sql_rules.py — Strict SQL generation rules injected into every prompt.

These rules ensure the LLM generates safe, valid, Supabase-compatible SQL.
They are referenced by ``prompt_builder.py`` and included verbatim in the
system prompt.
"""

SQL_RULES_BLOCK: str = """\
=== STRICT SQL RULES (MUST follow ALL of these) ===

1. ONLY generate PostgreSQL-compatible SELECT queries.
2. NEVER generate DROP, ALTER, TRUNCATE, DELETE, INSERT, UPDATE, CREATE,
   GRANT, REVOKE, EXECUTE, or CALL statements.
3. ONLY reference tables and columns listed in the AVAILABLE SCHEMA section
   below.  Do NOT invent or hallucinate any table or column names.
4. Use EXPLICIT JOIN syntax (INNER JOIN, LEFT JOIN, etc.).
   NEVER use implicit comma-joins (e.g. FROM a, b WHERE a.id = b.id).
5. Always qualify column names with table aliases when two or more tables
   are involved (e.g. e.emp_id, d.dept_name).
6. Use standard PostgreSQL functions and date/time handling:
   - CURRENT_DATE, CURRENT_TIMESTAMP, INTERVAL, EXTRACT, DATE_TRUNC
   - NUMERIC aggregates: SUM, COUNT, AVG, MIN, MAX
7. For text comparisons, prefer ILIKE for case-insensitive matching.
8. Limit result sets to a maximum of 500 rows using LIMIT unless the user
   explicitly asks for all rows.
9. Use meaningful column aliases (AS) for computed or aggregated columns.
10. When the user asks for "today", use CURRENT_DATE.
    When the user asks for "this month", use DATE_TRUNC('month', CURRENT_DATE).
    When the user asks for "this year", use DATE_TRUNC('year', CURRENT_DATE).
11. For Supabase compatibility:
    - Do NOT use schema-qualified names (no "public." prefix).
    - Do NOT use RETURNING clause (read-only).
    - Do NOT use advisory locks or NOTIFY/LISTEN.
12. Output ONLY the raw SQL query.  No markdown fences, no backticks,
    no explanations, no leading/trailing whitespace, no semicolons.
13. If the question is ambiguous, make a reasonable assumption and
    generate the most likely intended query.
14. For hierarchical data (manager_id in employees), use self-joins:
    e.g. JOIN employees m ON e.manager_id = m.emp_id

=== END SQL RULES ===
"""

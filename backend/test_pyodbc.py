from sqlalchemy import create_engine, text

server = r"localhost\SQLEXPRESS"
database = "FurnitureFactoryDB"
username = "talk2sql_user"
password = "iamsheeraz07"

connection_url = (
    f"mssql+pyodbc://{username}:{password}@{server}/{database}"
    f"?driver=ODBC+Driver+18+for+SQL+Server&TrustServerCertificate=yes"
)

try:
    engine = create_engine(connection_url)

    with engine.connect() as conn:
        result = conn.execute(text("SELECT DB_NAME()"))
        print("Connected successfully")
        print("Current database:", result.scalar())

except Exception as e:
    print("Connection failed")
    print(e)
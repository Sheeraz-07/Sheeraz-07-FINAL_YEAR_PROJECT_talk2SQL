# # ==========================================
# # FastAPI Backend Dockerfile
# # ==========================================

# FROM python:3.11-slim-bookworm

# # Set working directory
# WORKDIR /app

# # 1. Install System Dependencies for PyODBC / SQL Server
# # This is required because pyodbc needs C++ build tools and ODBC drivers
# RUN apt-get update && apt-get install -y \
#     unixodbc unixodbc-dev g++ curl gnupg apt-transport-https \
#     && curl -fsSL https://packages.microsoft.com/keys/microsoft.asc | tee /etc/apt/trusted.gpg.d/microsoft.asc \
#     && curl https://packages.microsoft.com/config/debian/12/prod.list > /etc/apt/sources.list.d/mssql-release.list \
#     && apt-get update \
#     && ACCEPT_EULA=Y apt-get install -y msodbcsql18 \
#     && apt-get clean \
#     && rm -rf /var/lib/apt/lists/*

# # 2. Install Python Dependencies
# # Copy only the requirements first to cache the pip install step
# COPY requirements.txt .
# RUN pip install --no-cache-dir -r requirements.txt

# # 3. Copy Application Code
# # Note: Ensure .dockerignore is preventing .env and __pycache__ from being copied
# COPY . .

# # 4. Expose the FastAPI Port
# EXPOSE 8000

# # 5. Run the Application
# # Using uvicorn to serve the FastAPI app
# CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

# ==========================================
# FastAPI Backend Dockerfile
# ==========================================

FROM python:3.11-slim-bookworm

# Prevent interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# Set working directory
WORKDIR /app

# ----------------------------------------------------
# Install system dependencies
# ----------------------------------------------------
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        curl \
        gnupg2 \
        ca-certificates \
        unixodbc \
        unixodbc-dev \
        g++ && \
    \
    mkdir -p /etc/apt/keyrings && \
    curl -fsSL https://packages.microsoft.com/keys/microsoft.asc | \
        gpg --dearmor -o /etc/apt/keyrings/microsoft.gpg && \
    \
    echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/microsoft.gpg] https://packages.microsoft.com/debian/12/prod bookworm main" \
        > /etc/apt/sources.list.d/microsoft-prod.list && \
    \
    apt-get update && \
    ACCEPT_EULA=Y apt-get install -y --no-install-recommends \
        msodbcsql18 && \
    \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# ----------------------------------------------------
# Install Python packages
# ----------------------------------------------------
COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ----------------------------------------------------
# Copy application
# ----------------------------------------------------
COPY . .

# ----------------------------------------------------
# Expose FastAPI port
# ----------------------------------------------------
EXPOSE 8000

# ----------------------------------------------------
# Start FastAPI
# ----------------------------------------------------
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]


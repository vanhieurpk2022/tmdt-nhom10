FROM python:3.11-slim

WORKDIR /app

# Cài đặt thư viện hệ thống cơ bản
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Cài đặt dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Chỉ đóng gói ứng dụng; không sao chép .venv, .env hay chỉ mục cũ vào image.
COPY app ./app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]


FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Run migrations and start server
CMD sh -c "python manage.py migrate --run-syncdb && python manage.py runserver 0.0.0.0:5011"

EXPOSE 5011


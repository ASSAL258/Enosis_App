# Departement Service

Departement microservice for managing departments/departments.

## Model

**Departement**
- `id`: UUID (Primary Key)
- `name`: String (max 100 chars, unique)
- `description`: Text (optional)
- `created_at`: DateTime
- `updated_at`: DateTime

## Endpoints

- `GET /departements/` - List all departments
- `POST /departements/` - Create a new department
- `GET /departements/{id}/` - Get a specific department
- `PUT /departements/{id}/` - Update a department
- `DELETE /departements/{id}/` - Delete a department

## Running Locally

```bash
# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start server
python manage.py runserver 0.0.0.0:5005
```

## Docker

```bash
docker build -t departement-service .
docker run -p 5005:5005 departement-service
```

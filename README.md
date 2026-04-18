# Enosis_App

Dockerized Django application scaffold.

## Microservices Folder Structure

This repository now includes a microservices-ready layout under `services/`.

- `services/api-gateway/`
- `services/auth-service/`
- `services/user-service/`
- `infra/`
- `shared/`
- `scripts/`

## Run the app

1. Build and start the container:

	docker compose -f Docker-compose.yaml up --build

2. Open the app:

	http://localhost:8000

3. Stop the app:

	Ctrl + C in terminal, then optionally:

	docker compose -f Docker-compose.yaml down


# Enosis_App

Dockerized Django application scaffold.

## Microservices Folder Structure

This repository now includes a microservices-ready layout under `services/`.

- `services/api-gateway/`
- `services/avance-service/`
- `services/attestation-service/`
- `services/rib-service/`
- `services/conge-service/`
- `services/pret-service/`
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

## Monitoring and Observability

Prometheus and Grafana are now included in Docker Compose.

1. Start monitoring stack only:

	docker compose -f Docker-compose.yaml up -d blackbox-exporter prometheus grafana

2. Open monitoring tools:

	Prometheus: http://localhost:9090
	Grafana: http://localhost:3001

3. Default Grafana credentials:

	Username: admin
	Password: admin

4. Full stack with monitoring:

	docker compose -f Docker-compose.yaml up --build

Notes:
- Prometheus scrapes internal service availability through Blackbox Exporter.
- A default Grafana datasource and dashboard are provisioned automatically.


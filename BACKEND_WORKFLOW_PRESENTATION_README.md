# Enosis App Backend Workflow Presentation

## 0. Conception
The backend conception is based on a modular microservices design with clear domain boundaries.
Each domain owns its service, database, and business logic, while cross-domain communication is handled through:
- API Gateway for synchronous HTTP requests
- RabbitMQ for asynchronous workflow events
- Consul Discovery for service discovery at infrastructure level

Core conception principles used in this project:
- separation of concerns by service domain
- database-per-service ownership model
- standardized internal layering (ViewSet -> Serializer -> Service -> Repository -> Model)
- API-first integration between frontend and backend
- event-driven extension points for process workflows (feedback, solde, delivered-time)

## 1. Purpose
This document is a presentation-ready guide to the backend workflow of Enosis App.
It explains:
- the backend architecture
- each service role
- request and event flows
- how services, databases, and queues interact

Date: 2026-04-20

## 2. Backend At A Glance
Enosis App backend is a microservices platform running with Docker Compose.
The main backend entrypoint is the API Gateway.

Main host ports:
- API Gateway: 8080
- Config Service: 5000
- Auth Service: 5003
- User Service: 5002
- Avance Service: 5004
- Conge Service: 5008
- Pret Service: 5010
- Attestation Service: 5011

Supporting infrastructure:
- RabbitMQ: 5672 (management: 15672)
- Consul Discovery: 8500
- MongoDB attachments: 27017

## 3. Architecture Layers
The backend follows a consistent service pattern:
1. Views (DRF ViewSets)
2. Serializers (validation and mapping)
3. Services (business rules)
4. Repositories (DB access)
5. Models (data entities)

This pattern keeps responsibilities clear and predictable across services.

## 4. Backend Service Catalog

### 4.1 Core Platform Services
- api-gateway
  - Public backend entrypoint for frontend and API clients
  - Routes /api/* paths to internal services

- config-service
  - Central route/config source for service endpoints
  - Stores and serves service configuration to the platform

- discovery-service (Consul)
  - Service discovery agent for infrastructure-level visibility

### 4.2 Identity and User Domain
- auth-service
  - Login, register, refresh token
  - JWT issuance and auth contract for frontend

- user-service
  - User records and profile data
  - Provides user identity data such as first_name, last_name, matricule

### 4.3 HR Process Domain Services
- avance-service
  - Salary advance requests
  - Tracks avance records and RH feedback linkage

- conge-service
  - Leave requests and workflow statuses
  - Consumes feedback and solde events

- pret-service
  - Loan requests and workflow statuses
  - Consumes feedback events

- attestation-service
  - Attestation requests and status handling
  - Consumes feedback events

### 4.4 Operational Domain Services
- departement-service
  - Department domain data and operations

- course-service
  - Course delivery process data
  - Uses Mongo for attachments
  - Consumes delivered_time events

- courier-time-service
  - Courier timing and related image workflow
  - Uses Mongo for image storage
  - Publishes/consumes delivered_time events as configured

- soldes-service
  - Leave balance domain
  - Publishes/consumes solde events

- feedback-user
  - Feedback producer service for RH/manager validation workflows
  - Publishes feedback.created events

## 5. Data Stores And Messaging

### 5.1 Postgres Databases (Database Per Service)
Each major domain service has its own Postgres database container:
- web-db
- config-service-db
- user-service-db
- auth-service-db
- feedback-user-db
- avance-service-db
- departement-service-db
- course-service-db
- courier-time-service-db
- conge-service-db
- soldes-service-db
- pret-service-db
- attestation-service-db

### 5.2 MongoDB
- attachments-mongo
  - Used by attachment/image workflows in course-service and courier-time-service (and related modules)

### 5.3 RabbitMQ Event Bus
Configured event topics in the current backend workflow:
- feedback.created
- solde.created
- delivered_time.created

Consumers in compose:
- avance-feedback-consumer
- conge-feedback-consumer
- conge-solde-consumer
- pret-feedback-consumer
- attestation-feedback-consumer
- course-delivered-time-consumer

## 6. End-To-End Request Workflow

### 6.1 Synchronous API Path
1. Frontend calls API Gateway on /api/*
2. API Gateway routes request to target service
3. Service ViewSet receives request
4. Serializer validates payload
5. Service layer runs business logic
6. Repository persists/loads data from service database
7. Response returns through Gateway to frontend

### 6.2 Asynchronous Event Path
1. Business event is published to RabbitMQ
2. Consumer service receives event
3. Consumer applies domain update in local DB
4. Updated state is exposed via service API

## 7. Key Business Workflows

### 7.1 Authentication Workflow
1. Client posts credentials to /api/auth/login/
2. auth-service validates user and issues JWT
3. Frontend stores access token
4. Next API calls include Authorization Bearer token

### 7.2 Avance Workflow
1. User submits avance request via gateway
2. avance-service validates and creates avance record
3. RH feedback linkage is tracked through feedback-related flow
4. Frontend displays avance list and statuses

### 7.3 Conge Workflow
1. User submits conge request
2. conge-service stores request and status
3. conge-feedback-consumer reacts to feedback.created
4. conge-solde-consumer reacts to solde.created
5. conge state and balances are updated for UI

### 7.4 Pret Workflow
1. User submits pret request
2. pret-service stores request
3. pret-feedback-consumer applies feedback updates

### 7.5 Attestation Workflow
1. User submits attestation request
2. attestation-service stores request
3. attestation-feedback-consumer applies feedback updates

### 7.6 Course And Courier-Time Workflow
1. course-service handles course records and attachments
2. courier-time-service handles time/image records
3. delivered_time.created event coordinates cross-service updates

## 8. API Gateway Routing Concept
Gateway acts as a unified facade for frontend clients.
Typical route families include:
- /api/auth
- /api/users
- /api/avances
- /api/conges
- /api/prets
- /api/attestations
- /api/courses
- /api/delivered-times
- /api/soldes

This avoids direct frontend coupling to internal service hostnames.

## 9. Runtime And Operations

### 9.1 Start Stack
Use Docker Compose at repository root with Docker-compose.yaml.

### 9.2 Rebuild Targeted Service
Rebuild only modified services to speed iteration.

### 9.3 Health Verification
Primary checks:
- docker ps status and health
- service logs for startup/runtime errors
- gateway endpoint smoke calls

### 9.4 Common Diagnostics
- route mismatch between frontend path and gateway path
- stale frontend image or dist bundle
- service startup failure due to syntax/config errors
- message broker not ready for consumers

## 10. Slide Deck Version (Suggested)
1. Context and Goal
2. High-Level Architecture
3. Service Catalog
4. Data Layer and Messaging
5. Request Lifecycle
6. Event Lifecycle
7. Avance/Conge/Pret/Attestation Workflows
8. Gateway and Security Flow
9. Operations and Troubleshooting
10. Current State and Next Hardening Steps

## 11. Next Backend Hardening Steps
- Add contract tests for gateway routes and auth payload shape
- Add CI lint/syntax checks before image build
- Add cross-service integration smoke tests for critical workflows
- Add explicit service-level health endpoints for all domain services
- Add observability (structured logs + trace correlation IDs)

## 12. GitHub Repositories
Current implementation is organized as a mono-repository in this workspace.

Presentation note:
- Main repository (mono-repo): Enosis_App

Optional split repositories if you decide to separate deployment ownership later:
- enosis-api-gateway
- enosis-config-service
- enosis-auth-service
- enosis-user-service
- enosis-avance-service
- enosis-conge-service
- enosis-pret-service
- enosis-attestation-service
- enosis-feedback-user-service
- enosis-course-service
- enosis-courier-time-service
- enosis-soldes-service
- enosis-departement-service
- enosis-frontend
- enosis-infra

# Enosis App Workflow Summary (Presentation Ready)

## 1) Project Context
This workflow covered end-to-end integration and stabilization of a Dockerized microservices platform, with focus on:
- frontend integration into Docker Compose and API gateway
- service discovery updates
- authentication/login fixes
- test user provisioning with role relationships
- avance-service crash debugging and recovery
- regression verification across key demand workflows

Date: 2026-04-20
Workspace: Enosis_App

## 2) Initial Situation
The stack had multiple moving parts (gateway, frontend, auth, user, avance, attestation, and others). Main blockers observed during the workflow:
- frontend not fully integrated for realistic testing
- stale frontend bundle behavior causing login mismatch
- auth contract mismatch in login flow (URL and token field expectations)
- service-level instability in avance-service due to unresolved merge conflict markers

## 3) Architecture and Infrastructure Work
### 3.1 Docker Compose and Frontend
- Frontend service added and wired in compose.
- Frontend served on host port 3000.
- API gateway exposed on host port 8080.
- Frontend configured to use gateway routes.

### 3.2 API Gateway and Routing
- Gateway routes aligned so frontend can call auth and demand APIs through a single entry point.
- Auth login path used by frontend standardized to:
  - /api/auth/login/

### 3.3 Discovery and Cross-Service Reachability
- Discovery-related entries and service references validated so services are discoverable and reachable in the composed environment.

## 4) Frontend/Auth Contract Fixes
### 4.1 Login Path and Response Mapping
Frontend login was updated to:
- call /api/auth/login/
- read access_token from backend response
- map backend role_id UUID values to frontend role labels for UI behavior

### 4.2 Stale Build Artifact Fix
A stale frontend dist caused old behavior to persist despite source changes.
Resolution:
- clean rebuild of frontend image/assets
- redeploy container

## 5) User and Role Provisioning for Demo/Test
Requested users were created with role and assignment relationships for realistic manager/RH/employee flows across Enosis and Parkauto, plus a courier profile.

Created identities:
- manager.one@enosisapp.test
- rh.one@enosisapp.test
- employee.one@enosisapp.test
- manager.parkauto@enosisapp.test
- rh.parkauto@enosisapp.test
- employee.parkauto@enosisapp.test
- courier.one@enosisapp.test

Verified login credential example:
- email: employee.one@enosisapp.test
- password: Test12345!

## 6) Critical Incident: Avance Service Crash
### 6.1 Symptom
Creating an avance failed because avance-service was continuously restarting.

### 6.2 Root Cause
Python syntax failure during startup caused by unresolved merge conflict markers in avance service code:
- conflict markers like <<<<<<< HEAD remained in avance_service.py
- typo branch included invalid function naming (craete_avance)

### 6.3 Resolution
- Rewrote service implementation cleanly (single coherent methods for create/get/update + feedback handling).
- Rebuilt and recreated avance-service image/container so runtime used corrected code.

### 6.4 Outcome
- Container reached healthy running state.
- Django startup completed without syntax tracebacks.

## 7) Validation Strategy Used
Validation was done through:
- docker container status checks
- service logs inspection
- API smoke script execution path (gateway-based)
- targeted auth and avance checks

Typical commands used:
- docker compose -f Docker-compose.yaml up -d --build --force-recreate <service>
- docker ps --filter name=<container>
- docker logs --tail <n> <container>
- powershell smoke script against gateway endpoints

## 8) Key Lessons Learned
- In containerized frontend stacks, source fix does not guarantee runtime fix when old dist assets are still served.
- Login issues are often contract issues (endpoint shape, token field names) rather than only credentials.
- One unresolved merge conflict in a Python module can prevent complete Django boot.
- After code fixes in image-built services, rebuild is mandatory; recreate alone may keep stale image layers.

## 9) Current State Summary
- Frontend available on port 3000.
- API gateway available on port 8080.
- Auth login flow functional with real token issuance.
- Avance service startup crash resolved.
- Test users for employee/manager/RH/courier scenarios available.

## 10) Final Validation and Extra Fixes (Post-Stabilization)
After initial stabilization, targeted demand-route tests identified two additional integration defects and both were fixed.

### 10.1 Defect A: Avance List Endpoint Failure
- Symptom: GET /api/avances/ failed because backend list route raised server error.
- Root cause: DRF ModelViewSet in avance-service did not define queryset/list behavior.
- Fix: Added queryset and explicit list() response serialization in avance viewset.
- Result: GET /api/avances/ returns 200.

### 10.2 Defect B: Attestation Route 404 via Gateway
- Symptom: GET /api/attestations/ returned 404 through gateway.
- Root cause 1: missing gateway location block for /api/attestations/.
- Root cause 2: upstream target path required service-level /api/ prefix.
- Fixes:
  - added gateway location for /api/attestations/
  - corrected proxy target to /api/attestations/ on attestation-service
- Result: GET /api/attestations/ returns 200.

### 10.3 Demand Endpoint Re-Verification
Using a real authenticated user token:
- GET /api/avances/ -> 200
- POST /api/avances/create/ -> 201 (created avance id confirmed)
- GET /api/attestations/ -> 200
- GET /api/conges/ -> 200
- GET /api/prets/ -> 200

### 10.4 Smoke Script Status
The repository smoke script completed successfully with final marker:
- SMOKE_TEST_SUCCESS

## 11) Monitoring and Observability Added (Demo Scope)
To improve operational visibility for manager/demo reporting, a monitoring stack was added and validated.

### 11.1 Stack Added
- Prometheus
- Grafana
- Blackbox Exporter

### 11.2 Access Points
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001

### 11.3 What Is Monitored
- service reachability percentage
- total requests (5m window)
- healthy vs failing services
- average response time (5m)
- p95 response time (5m)
- observed HTTP status distribution
- availability trend by service
- top slow services table

### 11.4 Demo Value For Management
- shows platform health at a glance
- quantifies service quality with latency and availability KPIs
- highlights bottlenecks quickly (slow or failing services)
- demonstrates production-readiness mindset, not only feature delivery

## 12) CI/CD Section (In Progress / Coming Soon)
CI/CD is planned as the next hardening phase and currently considered work in progress.

### 12.1 Planned Pipeline Stages
1. Source checkout and dependency install
2. Static checks (lint + syntax validation)
3. Unit and integration test execution
4. Docker image build for modified services
5. Security scan for images/dependencies
6. Push versioned images to container registry
7. Environment deployment (staging first)
8. Post-deploy smoke tests via API gateway

### 12.2 Planned Quality Gates
- block merge on lint/test failures
- block deploy if smoke tests fail
- block release on critical image vulnerabilities

### 12.3 Current Status
- pipeline design is defined
- observability foundation is already in place to support CI/CD verification
- implementation of automated GitHub Actions/GitLab CI workflow is planned next

## 13) Suggested Slide Deck Structure
1. Problem Statement and Goals
2. Platform Architecture (before/after)
3. Frontend + Gateway Integration
4. Auth/Login Contract Fix
5. User/Role Test Data Strategy
6. Incident Deep Dive: Avance Crash
7. Fix Implementation and Verification
8. End-to-End Validation Results
9. Lessons Learned
10. Next Steps and Hardening Plan

## 14) Next Technical Hardening Steps
- add CI smoke tests for critical gateway routes
- add startup lint/syntax gate to catch merge markers before build
- add contract tests for auth login response fields
- add migration discipline checks for model changes in services

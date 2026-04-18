# Service Layer Pattern

Each service should use this same internal structure:

- models: ORM/database entities.
- serializers: request/response validation and mapping.
- repositories: direct DB queries only.
- services: business rules and orchestration.
- views: DRF ViewSets only (calls services).

Example call flow:

1. View receives request.
2. Serializer validates payload.
3. Service applies business logic.
4. Repository reads/writes database.
5. View serializes and returns response.

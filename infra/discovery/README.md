# Discovery Service

This stack uses Consul as service discovery.

- DNS endpoint: discovery-service:8600
- HTTP API/UI: discovery-service:8500
- Services are registered explicitly in infra/discovery/consul.hcl.

server = true
bootstrap_expect = 1
ui_config {
  enabled = true
}
client_addr = "0.0.0.0"
log_level = "INFO"
data_dir = "/consul/data"

service {
  name = "web"
  id = "web"
  address = "web"
  port = 8000
  check {
    tcp = "web:8000"
    interval = "10s"
    timeout = "2s"
  }
}

service {
  name = "config-service"
  id = "config-service"
  address = "config-service"
  port = 5000
  check {
    http = "http://config-service:5000/health"
    interval = "10s"
    timeout = "3s"
  }
}

service {
  name = "user-service"
  id = "user-service"
  address = "user-service"
  port = 5002
  check {
    tcp = "user-service:5002"
    interval = "10s"
    timeout = "2s"
  }
}

service {
  name = "auth-service"
  id = "auth-service"
  address = "auth-service"
  port = 5003
  check {
    tcp = "auth-service:5003"
    interval = "10s"
    timeout = "2s"
  }
}

service {
  name = "feedback-user"
  id = "feedback-user"
  address = "feedback-user"
  port = 5001
  check {
    tcp = "feedback-user:5001"
    interval = "10s"
    timeout = "2s"
  }
}

service {
  name = "avance-service"
  id = "avance-service"
  address = "avance-service"
  port = 5004
  check {
    http = "http://avance-service:5004/health/"
    interval = "10s"
    timeout = "3s"
  }
}

service {
  name = "departement-service"
  id = "departement-service"
  address = "departement-service"
  port = 5005
  check {
    tcp = "departement-service:5005"
    interval = "10s"
    timeout = "2s"
  }
}

service {
  name = "course-service"
  id = "course-service"
  address = "course-service"
  port = 5006
  check {
    tcp = "course-service:5006"
    interval = "10s"
    timeout = "2s"
  }
}

service {
  name = "courier-time-service"
  id = "courier-time-service"
  address = "courier-time-service"
  port = 5007
  check {
    tcp = "courier-time-service:5007"
    interval = "10s"
    timeout = "2s"
  }
}

service {
  name = "conge-service"
  id = "conge-service"
  address = "conge-service"
  port = 5008
  check {
    tcp = "conge-service:5008"
    interval = "10s"
    timeout = "2s"
  }
}

service {
  name = "soldes-service"
  id = "soldes-service"
  address = "soldes-service"
  port = 5009
  check {
    tcp = "soldes-service:5009"
    interval = "10s"
    timeout = "2s"
  }
}

service {
  name = "pret-service"
  id = "pret-service"
  address = "pret-service"
  port = 5010
  check {
    tcp = "pret-service:5010"
    interval = "10s"
    timeout = "2s"
  }
}

service {
  name = "api-gateway"
  id = "api-gateway"
  address = "api-gateway"
  port = 80
  check {
    http = "http://api-gateway/health"
    interval = "10s"
    timeout = "3s"
  }
}

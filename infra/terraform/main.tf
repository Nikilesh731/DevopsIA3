locals {
  image_prefix = var.image_registry == "" ? "" : "${trim(var.image_registry, "/")}/"

  app_specs = {
    "gateway-service" = {
      image        = "${local.image_prefix}gateway-service:${var.image_tag}"
      port         = 5000
      replicas     = 2
      service_type = "ClusterIP"
      service_port = 5000
    }
    "region-service" = {
      image        = "${local.image_prefix}region-service:${var.image_tag}"
      port         = 5001
      replicas     = 2
      service_type = "ClusterIP"
      service_port = 5001
    }
    "simulation-service" = {
      image        = "${local.image_prefix}simulation-service:${var.image_tag}"
      port         = 5002
      replicas     = 2
      service_type = "ClusterIP"
      service_port = 5002
    }
    "resource-service" = {
      image        = "${local.image_prefix}resource-service:${var.image_tag}"
      port         = 5003
      replicas     = 2
      service_type = "ClusterIP"
      service_port = 5003
    }
    "fault-service" = {
      image        = "${local.image_prefix}fault-service:${var.image_tag}"
      port         = 5004
      replicas     = 2
      service_type = "ClusterIP"
      service_port = 5004
    }
    "event-bus" = {
      image        = "${local.image_prefix}event-bus:${var.image_tag}"
      port         = 5005
      replicas     = 1
      service_type = "ClusterIP"
      service_port = 5005
    }
    "frontend" = {
      image        = "${local.image_prefix}frontend:${var.image_tag}"
      port         = 80
      replicas     = 2
      service_type = "NodePort"
      service_port = 80
      node_port    = 30080
    }
  }

  shared_env = [
    { name = "NODE_ENV", value = "production" },
    { name = "GATEWAY_PORT", value = "5000" },
    { name = "REGION_PORT", value = "5001" },
    { name = "SIMULATION_PORT", value = "5002" },
    { name = "RESOURCE_PORT", value = "5003" },
    { name = "FAULT_PORT", value = "5004" },
    { name = "EVENT_BUS_PORT", value = "5005" },
    { name = "REGION_SERVICE_URL", value = "http://region-service:5001" },
    { name = "SIMULATION_SERVICE_URL", value = "http://simulation-service:5002" },
    { name = "RESOURCE_SERVICE_URL", value = "http://resource-service:5003" },
    { name = "FAULT_SERVICE_URL", value = "http://fault-service:5004" },
    { name = "EVENT_BUS_SERVICE_URL", value = "http://event-bus:5005" },
  ]
}

resource "kubernetes_namespace_v1" "epidemic" {
  metadata {
    name = var.namespace
  }
}

resource "kubernetes_config_map_v1" "epidemic" {
  metadata {
    name      = "epidemic-config"
    namespace = kubernetes_namespace_v1.epidemic.metadata[0].name
  }

  data = {
    for env in local.shared_env : env.name => env.value
  }
}

resource "kubernetes_manifest" "deployments" {
  for_each = local.app_specs

  manifest = {
    apiVersion = "apps/v1"
    kind       = "Deployment"
    metadata = {
      name      = each.key
      namespace = kubernetes_namespace_v1.epidemic.metadata[0].name
      labels = {
        app = each.key
      }
    }
    spec = {
      replicas = each.value.replicas
      selector = {
        matchLabels = {
          app = each.key
        }
      }
      template = {
        metadata = {
          labels = {
            app = each.key
          }
        }
        spec = {
          containers = [
            {
              name  = each.key
              image = each.value.image
              ports = [
                {
                  containerPort = each.value.port
                }
              ]
              envFrom = [
                {
                  configMapRef = {
                    name = kubernetes_config_map_v1.epidemic.metadata[0].name
                  }
                }
              ]
            }
          ]
        }
      }
    }
  }
}

resource "kubernetes_manifest" "services" {
  for_each = local.app_specs

  manifest = {
    apiVersion = "v1"
    kind       = "Service"
    metadata = {
      name      = each.key
      namespace = kubernetes_namespace_v1.epidemic.metadata[0].name
    }
    spec = merge(
      {
        type = each.value.service_type
        selector = {
          app = each.key
        }
        ports = [
          merge(
            {
              port       = each.value.service_port
              targetPort = each.value.port
            },
            each.key == "frontend" ? { nodePort = each.value.node_port } : {}
          )
        ]
      },
      {}
    )
  }
}
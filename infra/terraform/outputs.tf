output "namespace" {
  description = "Kubernetes namespace for the epidemic system"
  value       = kubernetes_namespace_v1.epidemic.metadata[0].name
}

output "service_names" {
  description = "Deployed Kubernetes services"
  value       = keys(local.app_specs)
}
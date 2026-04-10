variable "kubeconfig_path" {
  description = "Path to the kubeconfig file used by the Kubernetes provider"
  type        = string
  default     = "~/.kube/config"
}

variable "namespace" {
  description = "Kubernetes namespace for the epidemic system"
  type        = string
  default     = "epidemic-system"
}

variable "image_registry" {
  description = "Optional registry prefix for container images"
  type        = string
  default     = ""
}

variable "image_tag" {
  description = "Container image tag to deploy"
  type        = string
  default     = "latest"
}
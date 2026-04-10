# Deployment Guide

This system supports three deployment paths:

## Local Development

Use Docker Compose from the repository root:

```bash
docker compose up --build
```

This starts the gateway, region, simulation, resource, fault, event bus, and frontend services on the default local ports.

## Kubernetes

The Kubernetes manifests are stored in `infra/kubernetes/`.

Apply them in order:

```bash
kubectl apply -f infra/kubernetes/namespace.yaml
kubectl apply -f infra/kubernetes/configmap.yaml
kubectl apply -f infra/kubernetes/deployments.yaml
kubectl apply -f infra/kubernetes/services.yaml
```

## Terraform

The Terraform configuration is stored in `infra/terraform/` and defines the cluster-facing Kubernetes objects.

```bash
cd infra/terraform
terraform init
terraform fmt -check
terraform validate
```

## Ansible

The Ansible playbook in `infra/ansible/` copies the compose stack to a target host and starts it with Docker Compose.

```bash
ansible-playbook -i infra/ansible/inventory.example infra/ansible/site.yml
```
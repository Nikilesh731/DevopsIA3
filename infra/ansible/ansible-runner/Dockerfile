FROM python:3.11-slim

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       ssh-client \
       sshpass \
       git \
       build-essential \
       libffi-dev \
       libssl-dev \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir ansible-core ansible-lint docker paramiko

# Install commonly-used Ansible collections (community.docker used by playbooks)
RUN ansible-galaxy collection install community.docker

WORKDIR /work

CMD ["/bin/bash"]

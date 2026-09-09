#!/usr/bin/env bash
# Generate production secret key for Docker
# Usage: bash generate-secret.sh > secret.txt

openssl rand -hex 32

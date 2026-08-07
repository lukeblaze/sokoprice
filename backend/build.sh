#!/usr/bin/env bash
# Render build command — installs deps, collects static files, applies
# migrations, and seeds demo data (idempotent, safe to re-run on every deploy).
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate
python manage.py seed_demo_data

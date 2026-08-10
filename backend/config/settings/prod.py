"""Production (Render) — Postgres via DATABASE_URL, strict hosts/CORS."""

import dj_database_url

from .base import *  # noqa: F401,F403

DEBUG = env.bool('DEBUG', default=False)

SECRET_KEY = env('SECRET_KEY')  # fail fast if missing — no insecure fallback in prod

ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=['.onrender.com'])

DATABASES = {
    'default': dj_database_url.config(
        env='DATABASE_URL',
        conn_max_age=600,
        conn_health_checks=True,
    )
}

CORS_ALLOWED_ORIGINS = env.list('CORS_ALLOWED_ORIGINS', default=[])
CORS_ALLOW_CREDENTIALS = True

SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# Resend's SMTP relay — no extra Python package needed, Django's built-in
# SMTP backend works directly against it.
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.resend.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'resend'
EMAIL_HOST_PASSWORD = env('RESEND_API_KEY', default='')

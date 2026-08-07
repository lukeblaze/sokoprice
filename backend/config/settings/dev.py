"""Local development — SQLite, permissive CORS for the Expo dev server."""

from .base import *  # noqa: F401,F403

DEBUG = True
ALLOWED_HOSTS = ['*']

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Expo web dev server ports vary (8081 for `expo start --web`, 19006 for
# older CLI versions) — allow both, plus the Vercel preview once deployed.
CORS_ALLOWED_ORIGINS = [
    'http://localhost:8081',
    'http://localhost:19006',
    'http://127.0.0.1:8081',
]
CORS_ALLOW_CREDENTIALS = True

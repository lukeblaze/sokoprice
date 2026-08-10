from rest_framework.throttling import AnonRateThrottle


class AuthRateThrottle(AnonRateThrottle):
    """Applied to register/login — the two unauthenticated endpoints
    most exposed to brute-force/credential-stuffing and signup spam."""

    scope = 'auth'

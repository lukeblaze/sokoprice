from rest_framework import permissions


class IsAdminRole(permissions.BasePermission):
    """Real, server-side admin gating — replaces the frontend's old
    self-service 'Admin access' toggle. Role is set via Django admin
    (or the seed command for the demo account), never by the user."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == 'admin'
        )

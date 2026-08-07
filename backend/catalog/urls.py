from rest_framework.routers import DefaultRouter

from .views import ProductViewSet

router = DefaultRouter(trailing_slash=True)
router.register('products', ProductViewSet, basename='product')

urlpatterns = router.urls

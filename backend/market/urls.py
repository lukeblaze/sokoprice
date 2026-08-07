from django.urls import path

from .views import MarketSummaryView, MarketTickerView

urlpatterns = [
    path('summary/', MarketSummaryView.as_view(), name='market-summary'),
    path('ticker/', MarketTickerView.as_view(), name='market-ticker'),
]

from datetime import timedelta

from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APITestCase

from catalog.models import PricePoint, Product
from vendors.models import Vendor, VendorListing


class MarketApiTests(APITestCase):
    def setUp(self):
        self.vendor = Vendor.objects.create(id='v1', name='Vendor One', initials='V1', category='IT')
        baseline_date = timezone.now().date() - timedelta(days=2)

        # Dropping price: baseline 100 -> current 80 (-20%)
        self.dropper = Product.objects.create(
            id='dropper', name='A Product That Is Dropping In Price', category='IT & Computers',
        )
        VendorListing.objects.create(vendor=self.vendor, product=self.dropper, price=80)
        PricePoint.objects.create(product=self.dropper, date=baseline_date, avg_price=100, min_price=95)

        # Rising price: baseline 100 -> current 120 (+20%)
        self.riser = Product.objects.create(id='riser', name='Riser', category='Networking')
        VendorListing.objects.create(vendor=self.vendor, product=self.riser, price=120)
        PricePoint.objects.create(product=self.riser, date=baseline_date, avg_price=100, min_price=95)

    def test_summary_shape_and_counts(self):
        response = self.client.get('/api/v1/market/summary/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(set(response.data.keys()), {
            'totalProducts', 'activeVendors', 'avgPriceMovement', 'topDrops', 'topGains', 'recentUpdates',
        })
        self.assertEqual(response.data['totalProducts'], 2)
        self.assertEqual(response.data['activeVendors'], 1)

    def test_summary_sorts_drops_and_gains_correctly(self):
        response = self.client.get('/api/v1/market/summary/')
        self.assertEqual(response.data['topDrops'][0]['id'], 'dropper')
        self.assertEqual(response.data['topGains'][0]['id'], 'riser')

    def test_ticker_truncates_long_names(self):
        response = self.client.get('/api/v1/market/ticker/')
        self.assertEqual(response.status_code, 200)
        dropper_entry = next(item for item in response.data if item['productId'] == 'dropper')
        self.assertTrue(dropper_entry['name'].endswith('…'))
        self.assertLessEqual(len(dropper_entry['name']), 23)  # 22 chars + ellipsis

    def test_ticker_isUp_matches_change_sign(self):
        response = self.client.get('/api/v1/market/ticker/')
        for item in response.data:
            expected_up = item['change'] >= 0
            self.assertEqual(item['isUp'], expected_up)

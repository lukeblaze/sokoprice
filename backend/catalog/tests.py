from datetime import timedelta

from django.core.exceptions import ValidationError
from django.core.management import call_command
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APITestCase

from catalog.models import PricePoint, Product
from engagement.models import Notification, PriceAlert
from vendors.models import Vendor, VendorListing


class ProductModelTests(TestCase):
    def test_category_must_be_one_of_the_fixed_choices(self):
        product = Product(
            id='test-product', name='Test Product',
            category='Not A Real Category', subcategory='x',
        )
        with self.assertRaises(ValidationError):
            product.full_clean()

    def test_valid_category_passes_validation(self):
        product = Product(
            id='test-product-2', name='Test Product 2',
            category='IT & Computers', subcategory='x',
        )
        product.full_clean()  # should not raise


class SeedDemoDataTests(TestCase):
    def test_seed_command_is_idempotent(self):
        call_command('seed_demo_data')
        counts_first = (
            Vendor.objects.count(), Product.objects.count(),
            VendorListing.objects.count(), PricePoint.objects.count(),
            PriceAlert.objects.count(), Notification.objects.count(),
        )

        call_command('seed_demo_data')
        counts_second = (
            Vendor.objects.count(), Product.objects.count(),
            VendorListing.objects.count(), PricePoint.objects.count(),
            PriceAlert.objects.count(), Notification.objects.count(),
        )

        self.assertEqual(counts_first, counts_second)
        self.assertEqual(counts_first, (6, 10, 14, 310, 2, 3))


EXPECTED_PRODUCT_FIELDS = {
    'id', 'name', 'category', 'subcategory', 'description', 'imageUrl', 'tags',
    'vendorCount', 'bestPrice', 'avgPrice', 'worstPrice', 'priceChange24h',
    'priceChangePct', 'lastUpdated', 'isFavorited', 'hasAlert', 'alertPrice', 'unit',
}


class ProductApiTests(APITestCase):
    """Asserts response shape matches src/types/index.ts's Product
    interface field-for-field, and that the derived price aggregates
    are computed correctly from VendorListing rows — the highest-value
    tests in the plan, since shape drift is exactly what would break
    the frontend's "zero changes needed" assumption."""

    def setUp(self):
        self.vendor_a = Vendor.objects.create(id='vendor-a', name='Vendor A', initials='VA', category='IT')
        self.vendor_b = Vendor.objects.create(id='vendor-b', name='Vendor B', initials='VB', category='IT')
        self.product = Product.objects.create(
            id='widget', name='Widget', category='IT & Computers', subcategory='Widgets',
            description='A widget.', tags=['a', 'b'], unit='per unit',
        )
        self.other_product = Product.objects.create(
            id='gadget', name='Gadget', category='Networking', subcategory='Gadgets',
        )
        # in_stock listing at 100, out-of-stock at 200 -> vendorCount=1, best=100, worst=200
        VendorListing.objects.create(vendor=self.vendor_a, product=self.product, price=100, in_stock=True)
        VendorListing.objects.create(vendor=self.vendor_b, product=self.product, price=200, in_stock=False)

    def test_list_returns_expected_shape(self):
        response = self.client.get('/api/v1/products/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(set(response.data[0].keys()), EXPECTED_PRODUCT_FIELDS)

    def test_category_filter(self):
        response = self.client.get('/api/v1/products/', {'category': 'Networking'})
        ids = [p['id'] for p in response.data]
        self.assertEqual(ids, ['gadget'])

    def test_category_all_returns_everything(self):
        response = self.client.get('/api/v1/products/', {'category': 'All'})
        self.assertEqual(len(response.data), 2)

    def test_retrieve_computes_price_aggregates(self):
        response = self.client.get('/api/v1/products/widget/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(float(response.data['bestPrice']), 100)
        self.assertEqual(float(response.data['worstPrice']), 200)
        self.assertEqual(float(response.data['avgPrice']), 150)
        self.assertEqual(response.data['vendorCount'], 1)  # only the in-stock listing counts

    def test_retrieve_product_with_no_listings_defaults_to_zero(self):
        response = self.client.get('/api/v1/products/gadget/')
        self.assertEqual(response.data['bestPrice'], 0)
        self.assertEqual(response.data['vendorCount'], 0)

    def test_no_current_listings_does_not_report_misleading_100pct_drop(self):
        # A product with real price history but zero current listings
        # shouldn't compare "no price" (0) against the historical
        # baseline and report a fake -100% drop.
        PricePoint.objects.create(
            product=self.other_product, date=timezone.now().date() - timedelta(days=2),
            avg_price=500, min_price=480,
        )
        response = self.client.get('/api/v1/products/gadget/')
        self.assertEqual(response.data['priceChange24h'], 0)

    def test_search_matches_name(self):
        response = self.client.get('/api/v1/products/search/', {'q': 'widg'})
        self.assertEqual([p['id'] for p in response.data], ['widget'])

    def test_search_matches_tag(self):
        response = self.client.get('/api/v1/products/search/', {'q': 'a'})
        ids = [p['id'] for p in response.data]
        self.assertIn('widget', ids)  # matches tag 'a'

    def test_trend_endpoint_shape(self):
        PricePoint.objects.create(product=self.product, date=timezone.now().date(), avg_price=150, min_price=145)
        response = self.client.get('/api/v1/products/widget/trend/', {'period': '30d'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['productId'], 'widget')
        self.assertEqual(response.data['period'], '30d')
        self.assertEqual(set(response.data['dataPoints'][0].keys()), {'date', 'avgPrice', 'minPrice'})

    def test_price_change_24h_compares_against_prior_day(self):
        yesterday = timezone.now().date() - timedelta(days=2)
        PricePoint.objects.create(product=self.product, date=yesterday, avg_price=100, min_price=95)
        response = self.client.get('/api/v1/products/widget/')
        # current avg 150 vs baseline 100 -> +50%
        self.assertEqual(response.data['priceChange24h'], 50.0)
        self.assertEqual(response.data['priceChangePct'], response.data['priceChange24h'])

    def test_vendor_listings_endpoint_denormalizes_vendor_fields(self):
        response = self.client.get('/api/v1/products/widget/vendors/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)
        expected_keys = {
            'vendorId', 'vendorName', 'vendorLocation', 'vendorBadge', 'price',
            'inStock', 'minOrderQty', 'updatedAt', 'contactPhone', 'contactEmail', 'notes',
        }
        self.assertEqual(set(response.data[0].keys()), expected_keys)
        vendor_names = {row['vendorName'] for row in response.data}
        self.assertEqual(vendor_names, {'Vendor A', 'Vendor B'})

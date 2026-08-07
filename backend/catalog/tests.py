from django.core.exceptions import ValidationError
from django.core.management import call_command
from django.test import TestCase

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

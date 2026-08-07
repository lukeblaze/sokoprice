from django.db import IntegrityError, transaction
from django.test import TestCase

from catalog.models import Product
from vendors.models import Vendor, VendorListing


class VendorListingConstraintTests(TestCase):
    def setUp(self):
        self.vendor = Vendor.objects.create(id='v1', name='Vendor One', initials='VO', category='IT')
        self.product = Product.objects.create(id='p1', name='Product One', category='IT & Computers')

    def test_duplicate_vendor_product_listing_rejected(self):
        VendorListing.objects.create(vendor=self.vendor, product=self.product, price=100)
        with self.assertRaises(IntegrityError), transaction.atomic():
            VendorListing.objects.create(vendor=self.vendor, product=self.product, price=200)

    def test_same_vendor_different_product_allowed(self):
        product2 = Product.objects.create(id='p2', name='Product Two', category='Networking')
        VendorListing.objects.create(vendor=self.vendor, product=self.product, price=100)
        VendorListing.objects.create(vendor=self.vendor, product=product2, price=150)
        self.assertEqual(VendorListing.objects.count(), 2)

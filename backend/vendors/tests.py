from django.db import IntegrityError, transaction
from django.test import TestCase
from rest_framework.test import APITestCase

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


EXPECTED_VENDOR_FIELDS = {
    'id', 'name', 'initials', 'category', 'description', 'location', 'area',
    'rating', 'reviewCount', 'badge', 'productCount', 'phone', 'email',
    'whatsapp', 'website', 'openingHours', 'isVerified', 'isFavorited',
    'colorHex', 'logoUrl', 'joinedDate',
}


class VendorApiTests(APITestCase):
    def setUp(self):
        self.vendor = Vendor.objects.create(
            id='acme', name='Acme Traders', initials='AT', category='IT hardware',
            location='Nairobi CBD', area='CBD',
        )
        self.other_vendor = Vendor.objects.create(
            id='beta', name='Beta Supplies', initials='BS', category='Stationery', area='Westlands',
        )
        p1 = Product.objects.create(id='p1', name='Product One', category='IT & Computers')
        p2 = Product.objects.create(id='p2', name='Product Two', category='Networking')
        VendorListing.objects.create(vendor=self.vendor, product=p1, price=100)
        VendorListing.objects.create(vendor=self.vendor, product=p2, price=200)

    def test_list_returns_expected_shape(self):
        response = self.client.get('/api/v1/vendors/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(set(response.data[0].keys()), EXPECTED_VENDOR_FIELDS)

    def test_product_count_counts_distinct_products(self):
        response = self.client.get('/api/v1/vendors/acme/')
        self.assertEqual(response.data['productCount'], 2)

    def test_search_by_area(self):
        response = self.client.get('/api/v1/vendors/search/', {'q': 'Westlands'})
        self.assertEqual([v['id'] for v in response.data], ['beta'])

    def test_search_by_name(self):
        response = self.client.get('/api/v1/vendors/search/', {'q': 'acme'})
        self.assertEqual([v['id'] for v in response.data], ['acme'])

from django.core.cache import cache
from django.db import IntegrityError, transaction
from django.test import TestCase
from rest_framework.test import APITestCase

from accounts.models import User
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


class VendorAdminCrudTests(APITestCase):
    def setUp(self):
        cache.clear()
        self.admin = User.objects.create_user(
            username='admin1', email='admin@example.com', password='a-strong-passw0rd', role='admin',
        )
        self.regular_user = User.objects.create_user(
            username='user1', email='user@example.com', password='a-strong-passw0rd', role='user',
        )
        self.vendor = Vendor.objects.create(id='acme', name='Acme Traders', initials='AT', category='IT hardware')

    def auth_as(self, user):
        login = self.client.post('/api/v1/auth/login/', {'email': user.email, 'password': 'a-strong-passw0rd'})
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {login.data["access"]}')

    def test_create_requires_authentication(self):
        response = self.client.post('/api/v1/vendors/', {'name': 'New Vendor', 'category': 'IT'})
        self.assertEqual(response.status_code, 401)

    def test_create_requires_admin_role(self):
        self.auth_as(self.regular_user)
        response = self.client.post('/api/v1/vendors/', {'name': 'New Vendor', 'category': 'IT'})
        self.assertEqual(response.status_code, 403)
        self.assertFalse(Vendor.objects.filter(name='New Vendor').exists())

    def test_admin_create_generates_slug_and_initials(self):
        self.auth_as(self.admin)
        response = self.client.post('/api/v1/vendors/', {'name': 'Nairobi Tech Traders', 'category': 'IT'})
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['id'], 'nairobi-tech-traders')
        self.assertEqual(response.data['initials'], 'NT')
        self.assertEqual(response.data['rating'], 0)
        self.assertEqual(response.data['productCount'], 0)

    def test_admin_create_dedupes_slug_collision(self):
        self.auth_as(self.admin)
        first = self.client.post('/api/v1/vendors/', {'name': 'Acme Traders', 'category': 'IT'})
        self.assertEqual(first.data['id'], 'acme-traders')

    def test_admin_update_persists(self):
        self.auth_as(self.admin)
        response = self.client.patch(f'/api/v1/vendors/{self.vendor.id}/', {'description': 'Updated description'})
        self.assertEqual(response.status_code, 200)
        self.vendor.refresh_from_db()
        self.assertEqual(self.vendor.description, 'Updated description')

    def test_non_admin_cannot_update(self):
        self.auth_as(self.regular_user)
        response = self.client.patch(f'/api/v1/vendors/{self.vendor.id}/', {'description': 'Hacked'})
        self.assertEqual(response.status_code, 403)
        self.vendor.refresh_from_db()
        self.assertNotEqual(self.vendor.description, 'Hacked')

    def test_admin_delete_persists(self):
        self.auth_as(self.admin)
        response = self.client.delete(f'/api/v1/vendors/{self.vendor.id}/')
        self.assertEqual(response.status_code, 204)
        self.assertFalse(Vendor.objects.filter(id='acme').exists())

    def test_non_admin_cannot_delete(self):
        self.auth_as(self.regular_user)
        response = self.client.delete(f'/api/v1/vendors/{self.vendor.id}/')
        self.assertEqual(response.status_code, 403)
        self.assertTrue(Vendor.objects.filter(id='acme').exists())

    def test_read_endpoints_remain_public(self):
        response = self.client.get('/api/v1/vendors/')
        self.assertEqual(response.status_code, 200)

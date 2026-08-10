from django.core.cache import cache
from rest_framework.test import APITestCase

from accounts.models import User
from catalog.models import Product
from engagement.models import Notification, PriceAlert, SavedVendor, Watchlist
from vendors.models import Vendor, VendorListing


class EngagementTestBase(APITestCase):
    def setUp(self):
        cache.clear()
        self.user_a = User.objects.create_user(username='usera', email='a@example.com', password='a-strong-passw0rd')
        self.user_b = User.objects.create_user(username='userb', email='b@example.com', password='a-strong-passw0rd')
        self.product = Product.objects.create(id='widget', name='Widget', category='IT & Computers')
        self.other_product = Product.objects.create(id='gadget', name='Gadget', category='Networking')
        self.vendor = Vendor.objects.create(id='vendor-a', name='Vendor A', initials='VA', category='IT')
        self.other_vendor = Vendor.objects.create(id='vendor-b', name='Vendor B', initials='VB', category='IT')
        VendorListing.objects.create(vendor=self.vendor, product=self.product, price=100)

    def auth_as(self, user):
        login = self.client.post('/api/v1/auth/login/', {'email': user.email, 'password': 'a-strong-passw0rd'})
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {login.data["access"]}')


class WatchlistTests(EngagementTestBase):
    def test_requires_authentication(self):
        response = self.client.get('/api/v1/watchlist/')
        self.assertEqual(response.status_code, 401)

    def test_add_and_list(self):
        self.auth_as(self.user_a)
        add = self.client.post('/api/v1/watchlist/', {'productId': 'widget'})
        self.assertEqual(add.status_code, 201)
        response = self.client.get('/api/v1/watchlist/')
        self.assertEqual(response.data, ['widget'])

    def test_add_is_idempotent(self):
        self.auth_as(self.user_a)
        self.client.post('/api/v1/watchlist/', {'productId': 'widget'})
        self.client.post('/api/v1/watchlist/', {'productId': 'widget'})
        self.assertEqual(Watchlist.objects.filter(user=self.user_a).count(), 1)

    def test_remove(self):
        self.auth_as(self.user_a)
        self.client.post('/api/v1/watchlist/', {'productId': 'widget'})
        response = self.client.delete('/api/v1/watchlist/widget/')
        self.assertEqual(response.status_code, 204)
        self.assertEqual(Watchlist.objects.filter(user=self.user_a).count(), 0)

    def test_remove_nonexistent_entry_404s(self):
        self.auth_as(self.user_a)
        response = self.client.delete('/api/v1/watchlist/widget/')
        self.assertEqual(response.status_code, 404)

    def test_isolation_user_cannot_see_or_remove_other_users_entry(self):
        Watchlist.objects.create(user=self.user_b, product=self.product)
        self.auth_as(self.user_a)
        response = self.client.get('/api/v1/watchlist/')
        self.assertEqual(response.data, [])
        delete_response = self.client.delete('/api/v1/watchlist/widget/')
        self.assertEqual(delete_response.status_code, 404)
        self.assertEqual(Watchlist.objects.filter(user=self.user_b).count(), 1)

    def test_isFavorited_reflects_watchlist_after_toggle(self):
        self.auth_as(self.user_a)
        self.client.post('/api/v1/watchlist/', {'productId': 'widget'})
        response = self.client.get('/api/v1/products/widget/')
        self.assertTrue(response.data['isFavorited'])


class SavedVendorTests(EngagementTestBase):
    def test_add_list_remove(self):
        self.auth_as(self.user_a)
        self.client.post('/api/v1/saved-vendors/', {'vendorId': 'vendor-a'})
        response = self.client.get('/api/v1/saved-vendors/')
        self.assertEqual(response.data, ['vendor-a'])
        delete_response = self.client.delete('/api/v1/saved-vendors/vendor-a/')
        self.assertEqual(delete_response.status_code, 204)

    def test_isolation(self):
        SavedVendor.objects.create(user=self.user_b, vendor=self.vendor)
        self.auth_as(self.user_a)
        response = self.client.get('/api/v1/saved-vendors/')
        self.assertEqual(response.data, [])


class PriceAlertTests(EngagementTestBase):
    def test_create_and_list(self):
        self.auth_as(self.user_a)
        response = self.client.post('/api/v1/alerts/', {
            'productId': 'widget', 'targetPrice': 90, 'direction': 'below',
        })
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['productName'], 'Widget')
        self.assertEqual(float(response.data['currentPrice']), 100)
        self.assertTrue(response.data['isActive'])

        list_response = self.client.get('/api/v1/alerts/')
        self.assertEqual(len(list_response.data), 1)

    def test_update_and_delete(self):
        self.auth_as(self.user_a)
        alert = PriceAlert.objects.create(
            user=self.user_a, product=self.product, target_price=90, direction='below',
        )
        patch = self.client.patch(f'/api/v1/alerts/{alert.id}/', {'isActive': False})
        self.assertEqual(patch.status_code, 200)
        self.assertFalse(patch.data['isActive'])

        delete = self.client.delete(f'/api/v1/alerts/{alert.id}/')
        self.assertEqual(delete.status_code, 204)
        self.assertEqual(PriceAlert.objects.count(), 0)

    def test_isolation_cannot_see_or_modify_other_users_alert(self):
        alert = PriceAlert.objects.create(
            user=self.user_b, product=self.product, target_price=90, direction='below',
        )
        self.auth_as(self.user_a)
        list_response = self.client.get('/api/v1/alerts/')
        self.assertEqual(len(list_response.data), 0)

        detail_response = self.client.get(f'/api/v1/alerts/{alert.id}/')
        self.assertEqual(detail_response.status_code, 404)

        delete_response = self.client.delete(f'/api/v1/alerts/{alert.id}/')
        self.assertEqual(delete_response.status_code, 404)
        self.assertEqual(PriceAlert.objects.filter(user=self.user_b).count(), 1)

    def test_hasAlert_reflects_alert_after_create(self):
        self.auth_as(self.user_a)
        self.client.post('/api/v1/alerts/', {'productId': 'widget', 'targetPrice': 90, 'direction': 'below'})
        response = self.client.get('/api/v1/products/widget/')
        self.assertTrue(response.data['hasAlert'])
        self.assertEqual(float(response.data['alertPrice']), 90)


class NotificationTests(EngagementTestBase):
    def setUp(self):
        super().setUp()
        self.notif_a = Notification.objects.create(
            user=self.user_a, type='price_drop', title='Price dropped', body='...', product=self.product,
        )
        self.notif_b = Notification.objects.create(
            user=self.user_b, type='system', title='Welcome', body='...',
        )

    def test_list_returns_only_own_notifications_with_unread_count(self):
        self.auth_as(self.user_a)
        response = self.client.get('/api/v1/notifications/')
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['unreadCount'], 1)

    def test_mark_read(self):
        self.auth_as(self.user_a)
        response = self.client.post(f'/api/v1/notifications/{self.notif_a.id}/read/')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['isRead'])
        list_response = self.client.get('/api/v1/notifications/')
        self.assertEqual(list_response.data['unreadCount'], 0)

    def test_cannot_mark_other_users_notification_read(self):
        self.auth_as(self.user_a)
        response = self.client.post(f'/api/v1/notifications/{self.notif_b.id}/read/')
        self.assertEqual(response.status_code, 404)
        self.notif_b.refresh_from_db()
        self.assertFalse(self.notif_b.is_read)

    def test_mark_all_read_only_affects_own_notifications(self):
        Notification.objects.create(user=self.user_a, type='system', title='Second', body='...')
        self.auth_as(self.user_a)
        response = self.client.post('/api/v1/notifications/read-all/')
        self.assertEqual(response.status_code, 204)
        self.assertEqual(Notification.objects.filter(user=self.user_a, is_read=False).count(), 0)
        self.notif_b.refresh_from_db()
        self.assertFalse(self.notif_b.is_read)

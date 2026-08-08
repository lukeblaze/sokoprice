from rest_framework.test import APITestCase

from accounts.models import User
from catalog.models import Product
from engagement.models import PriceAlert, Watchlist


class RegisterTests(APITestCase):
    def valid_payload(self, **overrides):
        payload = {
            'name': 'Blaze Murimi',
            'businessName': 'Blaze Solutions Ltd',
            'phone': '+254700000000',
            'email': 'blaze@example.com',
            'password': 'a-strong-passw0rd',
        }
        payload.update(overrides)
        return payload

    def test_register_creates_user_and_returns_tokens(self):
        response = self.client.post('/api/v1/auth/register/', self.valid_payload())
        self.assertEqual(response.status_code, 201)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['email'], 'blaze@example.com')
        self.assertEqual(response.data['user']['name'], 'Blaze Murimi')
        self.assertEqual(response.data['user']['businessName'], 'Blaze Solutions Ltd')
        user = User.objects.get(email='blaze@example.com')
        self.assertTrue(user.check_password('a-strong-passw0rd'))
        self.assertEqual(user.first_name, 'Blaze')
        self.assertEqual(user.last_name, 'Murimi')

    def test_register_rejects_duplicate_email(self):
        User.objects.create_user(username='existing', email='blaze@example.com', password='whatever123')
        response = self.client.post('/api/v1/auth/register/', self.valid_payload())
        self.assertEqual(response.status_code, 400)
        self.assertIn('email', response.data)

    def test_register_rejects_weak_password(self):
        response = self.client.post('/api/v1/auth/register/', self.valid_payload(password='short'))
        self.assertEqual(response.status_code, 400)
        self.assertIn('password', response.data)

    def test_register_generates_unique_usernames_for_colliding_email_prefixes(self):
        self.client.post('/api/v1/auth/register/', self.valid_payload(email='blaze@example.com'))
        response = self.client.post('/api/v1/auth/register/', self.valid_payload(email='blaze@other.com'))
        self.assertEqual(response.status_code, 201)
        usernames = set(User.objects.values_list('username', flat=True))
        self.assertEqual(len(usernames), 2)


class LoginTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='blaze', email='blaze@example.com', password='a-strong-passw0rd',
            first_name='Blaze', last_name='Murimi',
        )

    def test_login_with_valid_credentials_returns_tokens_and_user(self):
        response = self.client.post('/api/v1/auth/login/', {
            'email': 'blaze@example.com', 'password': 'a-strong-passw0rd',
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['email'], 'blaze@example.com')

    def test_login_with_wrong_password_fails(self):
        response = self.client.post('/api/v1/auth/login/', {
            'email': 'blaze@example.com', 'password': 'wrong-password',
        })
        self.assertEqual(response.status_code, 401)

    def test_login_with_nonexistent_email_fails(self):
        response = self.client.post('/api/v1/auth/login/', {
            'email': 'nobody@example.com', 'password': 'whatever123',
        })
        self.assertEqual(response.status_code, 401)

    def test_refresh_returns_new_access_token(self):
        login = self.client.post('/api/v1/auth/login/', {
            'email': 'blaze@example.com', 'password': 'a-strong-passw0rd',
        })
        response = self.client.post('/api/v1/auth/refresh/', {'refresh': login.data['refresh']})
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)


class MeTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='blaze', email='blaze@example.com', password='a-strong-passw0rd',
            first_name='Blaze', last_name='Murimi', business_name='Blaze Solutions Ltd',
        )
        login = self.client.post('/api/v1/auth/login/', {
            'email': 'blaze@example.com', 'password': 'a-strong-passw0rd',
        })
        self.access = login.data['access']
        self.refresh = login.data['refresh']

    def auth(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access}')

    def test_me_requires_authentication(self):
        response = self.client.get('/api/v1/auth/me/')
        self.assertEqual(response.status_code, 401)

    def test_me_returns_profile_when_authenticated(self):
        self.auth()
        response = self.client.get('/api/v1/auth/me/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['email'], 'blaze@example.com')
        self.assertEqual(response.data['businessName'], 'Blaze Solutions Ltd')
        self.assertEqual(response.data['role'], 'user')

    def test_me_patch_updates_allowed_fields(self):
        self.auth()
        response = self.client.patch('/api/v1/auth/me/', {'location': 'Mombasa', 'phone': '+254711111111'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['location'], 'Mombasa')
        self.user.refresh_from_db()
        self.assertEqual(self.user.location, 'Mombasa')

    def test_me_patch_cannot_change_email_or_role(self):
        self.auth()
        response = self.client.patch('/api/v1/auth/me/', {'email': 'new@example.com', 'role': 'admin'})
        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertEqual(self.user.email, 'blaze@example.com')
        self.assertEqual(self.user.role, 'user')

    def test_me_derived_counts_reflect_real_rows(self):
        product = Product.objects.create(id='widget', name='Widget', category='IT & Computers')
        Watchlist.objects.create(user=self.user, product=product)
        PriceAlert.objects.create(user=self.user, product=product, target_price=100, direction='below')
        self.auth()
        response = self.client.get('/api/v1/auth/me/')
        self.assertEqual(response.data['watchlistCount'], 1)
        self.assertEqual(response.data['alertCount'], 1)
        self.assertEqual(response.data['savedVendorCount'], 0)

    def test_logout_blacklists_refresh_token(self):
        self.auth()
        logout = self.client.post('/api/v1/auth/logout/', {'refresh': self.refresh})
        self.assertEqual(logout.status_code, 204)
        retry = self.client.post('/api/v1/auth/refresh/', {'refresh': self.refresh})
        self.assertEqual(retry.status_code, 401)

    def test_logout_requires_authentication(self):
        response = self.client.post('/api/v1/auth/logout/', {'refresh': self.refresh})
        self.assertEqual(response.status_code, 401)

from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User


def _generate_unique_username(email):
    base = email.split('@')[0][:25] or 'user'
    username = base
    suffix = 1
    while User.objects.filter(username=username).exists():
        suffix += 1
        username = f'{base}{suffix}'
    return username


class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    businessName = serializers.CharField(source='business_name', required=False, allow_blank=True)
    plan = serializers.CharField(read_only=True)
    role = serializers.CharField(read_only=True)
    watchlistCount = serializers.SerializerMethodField()
    alertCount = serializers.SerializerMethodField()
    savedVendorCount = serializers.SerializerMethodField()
    createdAt = serializers.DateTimeField(source='date_joined', read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'name', 'businessName', 'email', 'phone', 'location',
            'currency', 'plan', 'role', 'watchlistCount', 'alertCount',
            'savedVendorCount', 'createdAt',
        ]
        read_only_fields = ['id', 'email']

    def get_name(self, user):
        return user.get_full_name() or user.username

    def get_watchlistCount(self, user):
        return user.watchlist.count()

    def get_alertCount(self, user):
        return user.alerts.count()

    def get_savedVendorCount(self, user):
        return user.saved_vendors.count()


class RegisterSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150)
    businessName = serializers.CharField(max_length=150, required=False, allow_blank=True)
    phone = serializers.CharField(max_length=32, required=False, allow_blank=True)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('An account with this email already exists.')
        return value

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        name = validated_data['name'].strip()
        first_name, _, last_name = name.partition(' ')
        user = User.objects.create_user(
            username=_generate_unique_username(validated_data['email']),
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=first_name,
            last_name=last_name,
            business_name=validated_data.get('businessName', ''),
            phone=validated_data.get('phone', ''),
        )
        return user


class LoginSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data

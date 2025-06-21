from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import UserProfile

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    specialization = serializers.CharField(write_only=True)
    license_number = serializers.CharField(write_only=True, required=True, max_length=50)


    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'specialization', 'license_number', 'username', 'email', 'password', 'password2']
        extra_kwargs = {
            'email': {'required': True},
        }

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Passwords do not match")
        return data

    def create(self, validated_data):
        specialization = validated_data.pop('specialization')
        license_number = validated_data.pop('license_number')
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        UserProfile.objects.create(user=user, specialization=specialization, license_number=license_number)
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    user = RegisterSerializer()

    class Meta:
        model = UserProfile
        fields = ['user', 'specialization', 'license_number']
from rest_framework import serializers
from .models import Prescription, PrescriptionItem
from django.contrib.auth import get_user_model
from patients.models import Patient

User = get_user_model()

class PrescriptionItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrescriptionItem
        fields = ['medicine', 'dosage', 'instructions']

class PrescriptionSerializer(serializers.ModelSerializer):
    prescription_items = PrescriptionItemSerializer(many=True)
    doctor = serializers.HiddenField(default=serializers.CurrentUserDefault())
    patient = serializers.PrimaryKeyRelatedField(queryset=Patient.objects.all())

    class Meta:
        model = Prescription
        fields = [
            'id', 'prescription_date', 'doctor', 'patient',
            'symptoms', 'diagnosis', 'notes', 'prescription_items'
        ]
        read_only_fields = ['id', 'prescription_date', 'doctor']

    def create(self, validated_data):
        items_data = validated_data.pop('prescription_items')
        prescription = Prescription.objects.create(**validated_data)
        for item in items_data:
            PrescriptionItem.objects.create(prescription=prescription, **item)
        return prescription

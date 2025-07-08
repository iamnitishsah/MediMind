from django.db import models


class Prescription(models.Model):
    prescription_date = models.DateField(auto_now_add=True, verbose_name='prescription.date')

    #doctor information
    doctor = models.ForeignKey('users.UserProfile', on_delete=models.CASCADE, related_name='prescriptions', verbose_name='doctor')

    #patient information
    patient = models.ForeignKey('patients.Patient', on_delete=models.CASCADE, related_name='prescriptions', verbose_name='patient')

    #clinical information
    symptoms = models.TextField(verbose_name='clinical.symptoms')
    diagnosis = models.TextField(verbose_name='clinical.diagnosis')
    notes = models.TextField(blank=True, null=True, verbose_name='clinical.notes')

    def __str__(self):
        return f"Prescription for {self.patient.name} by Dr. {self.doctor.user.username} on {self.prescription_date}."

    @property
    def patient_name(self):
        return self.patient.name


class PrescriptionItem(models.Model):
    prescription = models.ForeignKey(Prescription, on_delete=models.CASCADE, related_name='prescription_items')
    medicine = models.CharField(max_length=100)
    dosage = models.CharField(max_length=100)
    instructions = models.TextField()

    def __str__(self):
        return f"{self.medicine} - {self.dosage} ({self.prescription.patient_name})"
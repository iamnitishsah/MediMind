from django.db import models


class Patient(models.Model):
    name = models.CharField(max_length=100)
    age = models.IntegerField()
    gender = models.CharField(max_length=10, choices=[('Male', 'Male'), ('Female', 'Female'), ('Other', 'Other')])
    allergies = models.TextField(blank=True, null=True)
    medical_history = models.TextField(blank=True, null=True)
    doctor = models.ForeignKey('users.UserProfile', on_delete=models.CASCADE, related_name='patient', verbose_name='doctor')

    def __str__(self):
        return self.name

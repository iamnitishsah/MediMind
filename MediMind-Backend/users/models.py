from django.db import models
from django.contrib.auth.models import User

SPECIALIZATIONS = [
    ('General Medicine', 'General Medicine'),
    ('Cardiology', 'Cardiology'),
    ('Endocrinology', 'Endocrinology'),
    ('Gastroenterology', 'Gastroenterology'),
    ('Nephrology', 'Nephrology'),
    ('Pulmonology', 'Pulmonology'),
    ('Rheumatology', 'Rheumatology'),
    ('Infectious Disease', 'Infectious Disease'),
    ('Hematology', 'Hematology'),
    ('Oncology', 'Oncology'),
    ('Geriatrics', 'Geriatrics'),
    ('Neurology', 'Neurology'),
    ('Psychiatry', 'Psychiatry'),
    ('Pediatrics', 'Pediatrics'),
    ('Obstetrics and Gynecology', 'Obstetrics and Gynecology'),
    ('Dermatology', 'Dermatology'),
    ('Orthopedics', 'Orthopedics'),
    ('Urology', 'Urology'),
    ('Ophthalmology', 'Ophthalmology'),
    ('Otolaryngology (ENT)', 'Otolaryngology (ENT)'),
    ('Family Medicine', 'Family Medicine'),
    ('Emergency Medicine', 'Emergency Medicine'),
]

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    specialization = models.CharField(max_length=100, choices=SPECIALIZATIONS, default='General Medicine')
    license_number = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"
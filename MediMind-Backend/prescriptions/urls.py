from django.urls import path
from .views import PrescriptionListCreateView

app_name = 'prescriptions'

urlpatterns = [
    path('', PrescriptionListCreateView.as_view(), name='prescription-create'),
]
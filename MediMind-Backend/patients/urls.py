from django.urls import path
from .views import PatientListCreateView, PatientDetailView, PatientListByDoctorView

app_name = 'patients'

urlpatterns = [
    path('', PatientListCreateView.as_view(), name='patient-list-create'),
    path('doc<int:doctor>/', PatientListByDoctorView.as_view(), name='patient-list-by-doctor'),
    path('<int:id>/', PatientDetailView.as_view(), name='patient-detail'),
]
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('nitish/', admin.site.urls),
    path('users/', include('users.urls')),
    path('patients/', include('patients.urls')),
    path('prescriptions/', include('prescriptions.urls')),
]
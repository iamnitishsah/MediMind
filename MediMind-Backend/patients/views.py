from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.db.models import Q
from .models import Patient
from .serializers import PatientSerializer, PatientListSerializer


class PatientListCreateView(generics.ListCreateAPIView):
    """
    GET: List all patients
    POST: Create a new patient
    """
    queryset = Patient.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return PatientListSerializer
        return PatientSerializer

    def get_queryset(self):
        queryset = Patient.objects.all()
        search = self.request.query_params.get('search', None)

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(gender__icontains=search)
            )

        return queryset.order_by('name')

    def perform_create(self, serializer):
        serializer.save(doctor=self.request.user.profile)

    # def create(self, request, *args, **kwargs):
    #     serializer = self.get_serializer(data=request.data)
    #     if serializer.is_valid():
    #         patient = serializer.save()
    #         return Response(
    #             {
    #                 'message': 'Patient created successfully',
    #                 'patient': PatientSerializer(patient).data
    #             },
    #             status=status.HTTP_201_CREATED
    #         )
    #     return Response(
    #         {
    #             'error': 'Validation failed',
    #             'details': serializer.errors
    #         },
    #         status=status.HTTP_400_BAD_REQUEST
    #     )


class PatientDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET: Retrieve a specific patient
    PUT/PATCH: Update a patient
    DELETE: Delete a patient
    """
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)

        if serializer.is_valid():
            patient = serializer.save()
            return Response(
                {
                    'message': 'Patient updated successfully',
                    'patient': serializer.data
                }
            )
        return Response(
            {
                'error': 'Validation failed',
                'details': serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        patient_name = instance.name
        self.perform_destroy(instance)
        return Response(
            {
                'message': f'Patient "{patient_name}" deleted successfully'
            },
            status=status.HTTP_200_OK
        )

class PatientListByDoctorView(generics.ListAPIView):
    serializer_class = PatientListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        doctor_id = self.kwargs['doctor']
        return Patient.objects.filter(doctor=doctor_id)

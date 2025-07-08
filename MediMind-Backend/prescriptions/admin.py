from django.contrib import admin
from .models import Prescription, PrescriptionItem


class PrescriptionItemInline(admin.TabularInline):
    model = PrescriptionItem
    extra = 1  # Number of empty forms to display
    fields = ['medicine', 'dosage', 'instructions']
    verbose_name = "Prescribed Medicine"
    verbose_name_plural = "Prescribed Medicines"


@admin.register(Prescription)
class PrescriptionAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient', 'doctor', 'prescription_date', 'diagnosis_short')
    list_filter = ('prescription_date', 'doctor')
    search_fields = ('patient__name', 'doctor__user__username', 'diagnosis')
    date_hierarchy = 'prescription_date'
    inlines = [PrescriptionItemInline]

    fieldsets = (
        ('Prescription Information', {
            'fields': ('doctor', 'patient')
        }),
        ('Clinical Information', {
            'fields': ('symptoms', 'diagnosis', 'notes'),
            'classes': ('wide',)
        }),
    )

    readonly_fields = ('prescription_date',)

    def diagnosis_short(self, obj):
        return f"{obj.diagnosis[:50]}..." if len(obj.diagnosis) > 50 else obj.diagnosis

    diagnosis_short.short_description = 'Diagnosis'
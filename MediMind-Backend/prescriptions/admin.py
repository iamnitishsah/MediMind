from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import Prescription, PrescriptionItem


class PrescriptionItemInline(admin.TabularInline):
    model = PrescriptionItem
    extra = 1
    fields = ('medicine', 'dosage', 'instructions')
    classes = ('wide',)


@admin.register(Prescription)
class PrescriptionAdmin(admin.ModelAdmin):
    list_display = ('prescription_id', 'patient_name', 'doctor_name', 'prescription_date', 'diagnosis_short',
                    'medicine_count', 'view_details')
    list_filter = ('prescription_date', 'doctor__specialization', 'doctor__user__first_name')
    search_fields = ('patient__name', 'doctor__user__first_name', 'doctor__user__last_name', 'diagnosis', 'symptoms')
    ordering = ('-prescription_date',)
    date_hierarchy = 'prescription_date'

    inlines = [PrescriptionItemInline]

    fieldsets = (
        ('Prescription Information', {
            'fields': ('prescription_date', 'doctor', 'patient'),
            'classes': ('wide',),
        }),
        ('Clinical Information', {
            'fields': ('symptoms', 'diagnosis', 'notes'),
            'classes': ('wide',),
            'description': 'Clinical findings and diagnosis'
        }),
    )

    readonly_fields = ('prescription_date',)

    def prescription_id(self, obj):
        return f"RX-{obj.id:05d}"

    prescription_id.short_description = 'Prescription ID'
    prescription_id.admin_order_field = 'id'

    def patient_name(self, obj):
        url = reverse('admin:patients_patient_change', args=[obj.patient.id])
        return format_html('<a href="{}">{}</a>', url, obj.patient.name)

    patient_name.short_description = 'Patient'
    patient_name.admin_order_field = 'patient__name'

    def doctor_name(self, obj):
        full_name = f"{obj.doctor.user.first_name} {obj.doctor.user.last_name}".strip()
        name = full_name or obj.doctor.user.username
        specialization = obj.doctor.specialization
        return format_html('Dr. {} <br><small style="color: gray;">{}</small>', name, specialization)

    doctor_name.short_description = 'Doctor'
    doctor_name.admin_order_field = 'doctor__user__first_name'

    def diagnosis_short(self, obj):
        if len(obj.diagnosis) > 50:
            return format_html('{}... <span style="color: gray;">(click to view full)</span>', obj.diagnosis[:50])
        return obj.diagnosis

    diagnosis_short.short_description = 'Diagnosis'
    diagnosis_short.admin_order_field = 'diagnosis'

    def medicine_count(self, obj):
        count = obj.prescription_items.count()
        if count > 0:
            return format_html('<span style="color: blue;">💊 {} medicine(s)</span>', count)
        return format_html('<span style="color: red;">⚠️ No medicines</span>')

    medicine_count.short_description = 'Medicines'

    def view_details(self, obj):
        return format_html('<a href="{}">View</a>', reverse('admin:prescriptions_prescription_change', args=[obj.id]))

    view_details.short_description = 'Action'

    # Custom filters
    def get_list_filter(self, request):
        return super().get_list_filter(request) + (MedicineCountFilter, RecentPrescriptionsFilter)

    # Custom actions
    actions = ['export_prescriptions', 'mark_as_dispensed']

    def export_prescriptions(self, request, queryset):
        count = queryset.count()
        self.message_user(request, f'{count} prescription(s) exported successfully.')

    export_prescriptions.short_description = 'Export selected prescriptions'

    def mark_as_dispensed(self, request, queryset):
        count = queryset.count()
        self.message_user(request, f'{count} prescription(s) marked as dispensed.')

    mark_as_dispensed.short_description = 'Mark as dispensed'


@admin.register(PrescriptionItem)
class PrescriptionItemAdmin(admin.ModelAdmin):
    list_display = ('prescription_info', 'medicine', 'dosage', 'patient_name', 'prescription_date')
    list_filter = ('medicine', 'prescription__prescription_date')
    search_fields = ('medicine', 'prescription__patient__name', 'dosage', 'instructions')
    ordering = ('-prescription__prescription_date', 'medicine')

    def prescription_info(self, obj):
        return format_html('RX-{:05d}', obj.prescription.id)

    prescription_info.short_description = 'Prescription'
    prescription_info.admin_order_field = 'prescription__id'

    def patient_name(self, obj):
        return obj.prescription.patient.name

    patient_name.short_description = 'Patient'
    patient_name.admin_order_field = 'prescription__patient__name'

    def prescription_date(self, obj):
        return obj.prescription.prescription_date

    prescription_date.short_description = 'Date'
    prescription_date.admin_order_field = 'prescription__prescription_date'


# Custom filters
class MedicineCountFilter(admin.SimpleListFilter):
    title = 'medicine count'
    parameter_name = 'medicine_count'

    def lookups(self, request, model_admin):
        return (
            ('none', 'No medicines'),
            ('single', '1 medicine'),
            ('multiple', '2+ medicines'),
        )

    def queryset(self, request, queryset):
        if self.value() == 'none':
            return queryset.filter(prescription_items__isnull=True)
        elif self.value() == 'single':
            return queryset.annotate(
                medicine_count=admin.Count('prescription_items')
            ).filter(medicine_count=1)
        elif self.value() == 'multiple':
            return queryset.annotate(
                medicine_count=admin.Count('prescription_items')
            ).filter(medicine_count__gte=2)
        return queryset


class RecentPrescriptionsFilter(admin.SimpleListFilter):
    title = 'recent prescriptions'
    parameter_name = 'recent'

    def lookups(self, request, model_admin):
        return (
            ('today', 'Today'),
            ('week', 'This week'),
            ('month', 'This month'),
        )

    def queryset(self, request, queryset):
        from datetime import date, timedelta

        if self.value() == 'today':
            return queryset.filter(prescription_date=date.today())
        elif self.value() == 'week':
            week_ago = date.today() - timedelta(days=7)
            return queryset.filter(prescription_date__gte=week_ago)
        elif self.value() == 'month':
            month_ago = date.today() - timedelta(days=30)
            return queryset.filter(prescription_date__gte=month_ago)
        return queryset
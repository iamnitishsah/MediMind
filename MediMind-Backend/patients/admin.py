from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import Patient


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ('name', 'age', 'gender', 'has_allergies', 'has_medical_history', 'prescription_count',
                    'created_info')
    list_filter = ('gender', 'age')
    search_fields = ('name', 'allergies', 'medical_history')
    ordering = ('name',)

    fieldsets = (
        ('Personal Information', {
            'fields': ('name', 'age', 'gender'),
            'classes': ('wide',),
        }),
        ('Medical Information', {
            'fields': ('allergies', 'medical_history'),
            'classes': ('wide',),
            'description': 'Patient medical history and known allergies'
        }),
    )

    readonly_fields = ('prescription_count', 'created_info')

    def has_allergies(self, obj):
        if obj.allergies and obj.allergies.strip():
            return format_html('<span style="color: red;">⚠️ Yes</span>')
        return format_html('<span style="color: green;">✓ No</span>')

    has_allergies.short_description = 'Allergies'
    has_allergies.admin_order_field = 'allergies'

    def has_medical_history(self, obj):
        if obj.medical_history and obj.medical_history.strip():
            return format_html('<span style="color: orange;">📋 Yes</span>')
        return format_html('<span style="color: gray;">- No</span>')

    has_medical_history.short_description = 'Medical History'
    has_medical_history.admin_order_field = 'medical_history'

    def prescription_count(self, obj):
        count = obj.prescriptions.count()
        if count > 0:
            url = reverse('admin:prescriptions_prescription_changelist') + f'?patient__id={obj.id}'
            return format_html('<a href="{}">{} prescription(s)</a>', url, count)
        return '0 prescriptions'

    prescription_count.short_description = 'Prescriptions'

    def created_info(self, obj):
        # This would show creation date if you had a created_at field
        return format_html('<span style="color: gray;">Patient ID: {}</span>', obj.id)

    created_info.short_description = 'Info'

    # Custom actions
    actions = ['mark_as_reviewed']

    def mark_as_reviewed(self, request, queryset):
        # Example custom action - you could add a 'reviewed' field to the model
        count = queryset.count()
        self.message_user(request, f'{count} patient(s) marked as reviewed.')

    mark_as_reviewed.short_description = 'Mark selected patients as reviewed'

    # Age range filter
    def get_list_filter(self, request):
        return super().get_list_filter(request) + (AgeRangeFilter,)


class AgeRangeFilter(admin.SimpleListFilter):
    title = 'age range'
    parameter_name = 'age_range'

    def lookups(self, request, model_admin):
        return (
            ('child', 'Child (0-12)'),
            ('teen', 'Teen (13-19)'),
            ('adult', 'Adult (20-64)'),
            ('senior', 'Senior (65+)'),
        )

    def queryset(self, request, queryset):
        if self.value() == 'child':
            return queryset.filter(age__lte=12)
        elif self.value() == 'teen':
            return queryset.filter(age__gte=13, age__lte=19)
        elif self.value() == 'adult':
            return queryset.filter(age__gte=20, age__lte=64)
        elif self.value() == 'senior':
            return queryset.filter(age__gte=65)
        return queryset
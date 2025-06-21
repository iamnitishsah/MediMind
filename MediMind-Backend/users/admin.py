from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import UserProfile


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Doctor Profile'
    fields = ('specialization', 'license_number')
    readonly_fields = ()


class UserAdmin(BaseUserAdmin):
    inlines = (UserProfileInline,)
    list_display = ('username', 'email', 'first_name', 'last_name', 'get_specialization', 'get_license_number',
                    'is_staff', 'date_joined')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'date_joined', 'profile__specialization')
    search_fields = ('username', 'first_name', 'last_name', 'email', 'profile__license_number')
    ordering = ('-date_joined',)

    def get_specialization(self, obj):
        try:
            return obj.profile.specialization
        except UserProfile.DoesNotExist:
            return '-'

    get_specialization.short_description = 'Specialization'
    get_specialization.admin_order_field = 'profile__specialization'

    def get_license_number(self, obj):
        try:
            return obj.profile.license_number
        except UserProfile.DoesNotExist:
            return '-'

    get_license_number.short_description = 'License Number'
    get_license_number.admin_order_field = 'profile__license_number'


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'get_doctor_name', 'specialization', 'license_number', 'get_date_joined')
    list_filter = ('specialization',)
    search_fields = ('user__username', 'user__first_name', 'user__last_name', 'license_number', 'specialization')
    ordering = ('-user__date_joined',)
    readonly_fields = ('user',)

    fieldsets = (
        ('Doctor Information', {
            'fields': ('user',)
        }),
        ('Professional Details', {
            'fields': ('specialization', 'license_number'),
            'classes': ('wide',),
        }),
    )

    def get_doctor_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.username

    get_doctor_name.short_description = 'Doctor Name'
    get_doctor_name.admin_order_field = 'user__first_name'

    def get_date_joined(self, obj):
        return obj.user.date_joined

    get_date_joined.short_description = 'Date Joined'
    get_date_joined.admin_order_field = 'user__date_joined'

    def has_add_permission(self, request):
        # Prevent adding UserProfile directly - should be created via User registration
        return False


# Re-register UserAdmin
admin.site.unregister(User)
admin.site.register(User, UserAdmin)
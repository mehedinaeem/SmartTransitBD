from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class TransitUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (("Transit", {"fields": ("role",)}),)
    add_fieldsets = UserAdmin.add_fieldsets + (("Transit", {"fields": ("role",)}),)

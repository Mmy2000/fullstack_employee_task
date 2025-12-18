from django.contrib import admin
from .models import Company, Department, Employee


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    """Admin for Company model"""

    list_display = [
        "company_name",
        "number_of_departments",
        "number_of_employees",
        "created_at",
    ]
    search_fields = ["company_name"]
    readonly_fields = [
        "created_at",
        "updated_at",
        "number_of_departments",
        "number_of_employees",
    ]
    ordering = ["company_name"]

    def number_of_departments(self, obj):
        return obj.number_of_departments

    number_of_departments.short_description = "Departments"

    def number_of_employees(self, obj):
        return obj.number_of_employees

    number_of_employees.short_description = "Employees"


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    """Admin for Department model"""

    list_display = ["department_name", "company", "number_of_employees", "created_at"]
    list_filter = ["company"]
    search_fields = ["department_name", "company__company_name"]
    readonly_fields = ["created_at", "updated_at", "number_of_employees"]
    ordering = ["company", "department_name"]

    def number_of_employees(self, obj):
        return obj.number_of_employees

    number_of_employees.short_description = "Employees"


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    """Admin for Employee model"""

    list_display = [
        "employee_name",
        "email_address",
        "company",
        "department",
        "employee_status",
        "designation",
        "hired_on",
        "days_employed",
    ]
    list_filter = ["employee_status", "company", "department", "hired_on"]
    search_fields = [
        "employee_name",
        "email_address",
        "mobile_number",
        "designation",
        "company__company_name",
        "department__department_name",
    ]
    readonly_fields = ["created_at", "updated_at", "days_employed"]
    ordering = ["-created_at"]

    fieldsets = (
        ("Company Information", {"fields": ("company", "department")}),
        (
            "Personal Information",
            {"fields": ("employee_name", "email_address", "mobile_number", "address")},
        ),
        (
            "Employment Information",
            {"fields": ("designation", "employee_status", "hired_on")},
        ),
        (
            "Metadata",
            {
                "fields": ("days_employed", "created_at", "updated_at"),
                "classes": ("collapse",),
            },
        ),
    )

    def days_employed(self, obj):
        return obj.days_employed

    days_employed.short_description = "Days Employed"

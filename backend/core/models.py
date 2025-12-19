from django.db import models
from django.core.validators import RegexValidator
from django.core.exceptions import ValidationError
from datetime import date


class Company(models.Model):
    """Company model with auto-calculated fields"""

    company_name = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "companies"
        verbose_name_plural = "Companies"
        ordering = ["company_name"]

    def __str__(self):
        return self.company_name

    @property
    def number_of_departments(self):
        """Auto-calculate number of departments"""
        return self.departments.count()

    @property
    def number_of_employees(self):
        """Auto-calculate number of employees"""
        return self.employees.count()


class Department(models.Model):
    """Department model linked to Company"""

    company = models.ForeignKey(
        Company, on_delete=models.CASCADE, related_name="departments"
    )
    department_name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def delete(self, *args, **kwargs):
        """Prevent deletion if department has employees"""
        if self.number_of_employees > 0:
            raise ValidationError(
                f"Cannot delete department '{self.department_name}' because it has {self.number_of_employees} employee(s)."
            )
        super().delete(*args, **kwargs)

    class Meta:
        db_table = "departments"
        unique_together = ["company", "department_name"]
        ordering = ["company", "department_name"]

    def __str__(self):
        return f"{self.department_name} - {self.company.company_name}"

    @property
    def number_of_employees(self):
        """Auto-calculate number of employees in department"""
        return self.employees.count()


class Employee(models.Model):
    """Employee model with workflow status"""

    STATUS_CHOICES = [
        ("application_received", "Application Received"),
        ("interview_scheduled", "Interview Scheduled"),
        ("hired", "Hired"),
        ("not_accepted", "Not Accepted"),
    ]

    phone_regex = RegexValidator(
        regex=r"^\+?1?\d{9,15}$",
        message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed.",
    )

    company = models.ForeignKey(
        Company, on_delete=models.CASCADE, related_name="employees"
    )
    department = models.ForeignKey(
        Department,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="employees",
    )
    employee_status = models.CharField(
        max_length=30, choices=STATUS_CHOICES, default="application_received"
    )
    employee_name = models.CharField(max_length=255)
    email_address = models.EmailField()
    mobile_number = models.CharField(validators=[phone_regex], max_length=17)
    address = models.TextField()
    designation = models.CharField(max_length=255)
    hired_on = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "employees"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.employee_name} - {self.company.company_name}"


    @property
    def days_employed(self):
        """Auto-calculate days employed"""
        if self.employee_status == "hired" and self.hired_on:
            delta = date.today() - self.hired_on
            return delta.days
        return None

    def save(self, *args, **kwargs):
        """Override save to call full_clean"""
        self.full_clean()
        super().save(*args, **kwargs)

from rest_framework import serializers
from .models import Company, Department, Employee


class SampleDataEmployeeSerializer(serializers.ModelSerializer):
    """Serializer for Employee model with all validations"""

    days_employed = serializers.IntegerField(read_only=True)
    company_name = serializers.CharField(source="company.company_name", read_only=True)

    class Meta:
        model = Employee
        fields = [
            "id",
            "company_name",
            "employee_status",
            "employee_name",
            "email_address",
            "mobile_number",
            "address",
            "designation",
            "hired_on",
            "days_employed",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class DepartmentSerializer(serializers.ModelSerializer):
    """Serializer for Department model"""

    number_of_employees = serializers.IntegerField(read_only=True)
    company_name = serializers.CharField(source="company.company_name", read_only=True)

    class Meta:
        model = Department
        fields = [
            "id",
            "company",
            "company_name",
            "department_name",
            "number_of_employees",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class DepartmentDetailsSerializer(serializers.ModelSerializer):
    """Serializer for Department model"""

    number_of_employees = serializers.IntegerField(read_only=True)
    company_name = serializers.CharField(source="company.company_name", read_only=True)
    employees = SampleDataEmployeeSerializer(many=True, read_only=True)

    class Meta:
        model = Department
        fields = [
            "id",
            "company",
            "company_name",
            "department_name",
            "number_of_employees",
            "employees",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class CompanySerializer(serializers.ModelSerializer):
    """Serializer for Company model with auto-calculated fields"""

    number_of_departments = serializers.IntegerField(read_only=True)
    number_of_employees = serializers.IntegerField(read_only=True)

    class Meta:
        model = Company
        fields = [
            "id",
            "company_name",
            "number_of_departments",
            "number_of_employees",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

class CompanyDetailsSerializer(serializers.ModelSerializer):
    """Serializer for Company model with auto-calculated fields"""

    number_of_departments = serializers.IntegerField(read_only=True)
    number_of_employees = serializers.IntegerField(read_only=True)
    departments = DepartmentDetailsSerializer(many=True, read_only=True)

    class Meta:
        model = Company
        fields = [
            "id",
            "company_name",
            "number_of_departments",
            "departments",
            "number_of_employees",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class EmployeeSerializer(serializers.ModelSerializer):
    """Serializer for Employee model with all validations"""

    days_employed = serializers.IntegerField(read_only=True)
    company_name = serializers.CharField(source="company.company_name", read_only=True)
    department_name = serializers.CharField(
        source="department.department_name", read_only=True, allow_null=True
    )

    class Meta:
        model = Employee
        fields = [
            "id",
            "company",
            "company_name",
            "department",
            "department_name",
            "employee_status",
            "employee_name",
            "email_address",
            "mobile_number",
            "address",
            "designation",
            "hired_on",
            "days_employed",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate(self, data):
        """Custom validation for employee"""
        # Validate department belongs to company
        if "department" in data and data["department"]:
            company = data.get(
                "company", self.instance.company if self.instance else None
            )
            if company and data["department"].company != company:
                raise serializers.ValidationError(
                    {"department": "Department must belong to the selected company."}
                )

        # Validate hired_on for hired status
        employee_status = data.get(
            "employee_status", self.instance.employee_status if self.instance else None
        )
        hired_on = data.get(
            "hired_on", self.instance.hired_on if self.instance else None
        )

        if employee_status == "hired" and not hired_on:
            raise serializers.ValidationError(
                {"hired_on": "Hired date is required for hired employees."}
            )

        if self.instance:
            old_status = self.instance.employee_status
            new_status = data.get("employee_status", old_status)

            # Only check transitions if status is actually changing
            if new_status != old_status:
                valid_transitions = {
                    "application_received": ["interview_scheduled", "not_accepted"],
                    "interview_scheduled": ["hired", "not_accepted"],
                    "hired": [],
                    "not_accepted": [],
                }

                if new_status not in valid_transitions.get(old_status, []):
                    raise serializers.ValidationError(
                        {
                            "employee_status": f"Invalid transition from {old_status} to {new_status}"
                        }
                    )


        return data


class EmployeeReportSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source="company.company_name")
    department_name = serializers.SerializerMethodField()
    days_employed = serializers.IntegerField()
    position = serializers.CharField(source="designation")

    class Meta:
        model = Employee
        fields = [
            "employee_name",
            "email_address",
            "mobile_number",
            "position",
            "hired_on",
            "days_employed",
            "company_name",
            "department_name",
        ]

    def get_department_name(self, obj):
        return obj.department.department_name if obj.department else None

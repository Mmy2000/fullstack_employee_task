from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from .models import Company, Department, Employee
from datetime import date, timedelta
import json

User = get_user_model()


class UserModelTest(TestCase):
    """Unit tests for User model"""

    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpass123",
            role="admin",
        )

    def test_user_creation(self):
        """Test user is created correctly"""
        self.assertEqual(self.user.username, "testuser")
        self.assertEqual(self.user.email, "test@example.com")
        self.assertEqual(self.user.role, "admin")
        self.assertTrue(self.user.check_password("testpass123"))

    def test_user_string_representation(self):
        """Test user string representation"""
        self.assertEqual(str(self.user), "testuser (admin)")


class CompanyModelTest(TestCase):
    """Unit tests for Company model"""

    def setUp(self):
        self.company = Company.objects.create(company_name="Test Company")

    def test_company_creation(self):
        """Test company is created correctly"""
        self.assertEqual(self.company.company_name, "Test Company")
        self.assertEqual(str(self.company), "Test Company")

    def test_number_of_departments_property(self):
        """Test auto-calculation of number of departments"""
        Department.objects.create(company=self.company, department_name="HR")
        Department.objects.create(company=self.company, department_name="IT")
        self.assertEqual(self.company.number_of_departments, 2)

    def test_number_of_employees_property(self):
        """Test auto-calculation of number of employees"""
        Employee.objects.create(
            company=self.company,
            employee_name="John Doe",
            email_address="john@example.com",
            mobile_number="+1234567890",
            address="123 Main St",
            designation="Developer",
        )
        self.assertEqual(self.company.number_of_employees, 1)


class DepartmentModelTest(TestCase):
    """Unit tests for Department model"""

    def setUp(self):
        self.company = Company.objects.create(company_name="Test Company")
        self.department = Department.objects.create(
            company=self.company, department_name="IT Department"
        )

    def test_department_creation(self):
        """Test department is created correctly"""
        self.assertEqual(self.department.department_name, "IT Department")
        self.assertEqual(self.department.company, self.company)

    def test_number_of_employees_in_department(self):
        """Test auto-calculation of employees in department"""
        Employee.objects.create(
            company=self.company,
            department=self.department,
            employee_name="Jane Smith",
            email_address="jane@example.com",
            mobile_number="+1234567891",
            address="456 Oak St",
            designation="Manager",
        )
        self.assertEqual(self.department.number_of_employees, 1)


class EmployeeModelTest(TestCase):
    """Unit tests for Employee model"""

    def setUp(self):
        self.company = Company.objects.create(company_name="Test Company")
        self.department = Department.objects.create(
            company=self.company, department_name="IT"
        )
        self.employee = Employee.objects.create(
            company=self.company,
            department=self.department,
            employee_name="Test Employee",
            email_address="employee@example.com",
            mobile_number="+1234567890",
            address="789 Pine St",
            designation="Developer",
            employee_status="application_received",
        )

    def test_employee_creation(self):
        """Test employee is created correctly"""
        self.assertEqual(self.employee.employee_name, "Test Employee")
        self.assertEqual(self.employee.company, self.company)
        self.assertEqual(self.employee.department, self.department)

    def test_days_employed_calculation(self):
        """Test days employed calculation for hired employees"""
        hire_date = date.today() - timedelta(days=30)

        # Step 1: valid transition
        self.employee.employee_status = "interview_scheduled"
        self.employee.save()

        # Step 2: valid transition to hired
        self.employee.employee_status = "hired"
        self.employee.hired_on = hire_date
        self.employee.save()

        self.assertEqual(self.employee.days_employed, 30)

    def test_days_employed_none_for_non_hired(self):
        """Test days employed is None for non-hired employees"""
        self.assertIsNone(self.employee.days_employed)

    def test_department_company_validation(self):
        """Test validation that department belongs to company"""
        other_company = Company.objects.create(company_name="Other Company")
        other_department = Department.objects.create(
            company=other_company, department_name="Other Dept"
        )

        employee = Employee(
            company=self.company,
            department=other_department,
            employee_name="Invalid Employee",
            email_address="invalid@example.com",
            mobile_number="+1234567892",
            address="123 Test St",
            designation="Tester",
        )

        # Should raise ValidationError when clean() is called
        from django.core.exceptions import ValidationError

        with self.assertRaises(ValidationError):
            employee.full_clean()


class AuthenticationAPITest(APITestCase):
    """Integration tests for authentication endpoints"""

    def test_user_registration(self):
        """Test user registration endpoint"""
        data = {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "newpass123",
            "role": "employee",
        }
        response = self.client.post("/accounts/api/register/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # Check for data in custom response format
        self.assertIn("data", response.data)
        self.assertIn("user", response.data["data"])

    def test_user_login(self):
        """Test user login endpoint"""
        # Create user
        user = User.objects.create_user(
            username="loginuser", email="login@example.com", password="loginpass123"
        )

        # Login
        data = {"email": "login@example.com", "password": "loginpass123"}
        response = self.client.post("/accounts/api/login/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check custom response format
        self.assertIn("data", response.data)
        self.assertIn("tokens", response.data["data"])
        self.assertIn("access", response.data["data"]["tokens"])

    def test_login_with_invalid_credentials(self):
        """Test login with invalid credentials"""
        data = {"email": "wrong@example.com", "password": "wrongpass"}
        response = self.client.post("/accounts/api/login/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class CompanyAPITest(APITestCase):
    """Integration tests for Company API endpoints"""

    def setUp(self):
        self.admin_user = User.objects.create_user(
            username="admin",
            email="admin@example.com",
            password="admin123",
            role="admin",
        )
        self.employee_user = User.objects.create_user(
            username="employee",
            email="employee@example.com",
            password="employee123",
            role="employee",
        )
        self.company = Company.objects.create(company_name="Test Company")

    def test_list_companies_authenticated(self):
        """Test listing companies as authenticated user"""
        self.client.force_authenticate(user=self.employee_user)
        response = self.client.get("/api/companies/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check custom response format
        self.assertIn("data", response.data)
        self.assertTrue(len(response.data["data"]) > 0)

    def test_list_companies_unauthenticated(self):
        """Test listing companies without authentication"""
        response = self.client.get("/api/companies/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_company_as_admin(self):
        """Test creating company as admin"""
        self.client.force_authenticate(user=self.admin_user)
        data = {"company_name": "New Company"}
        response = self.client.post("/api/companies/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # Check custom response format
        self.assertIn("data", response.data)
        self.assertEqual(response.data["data"]["company_name"], "New Company")

    def test_create_company_as_employee_forbidden(self):
        """Test creating company as employee is forbidden"""
        self.client.force_authenticate(user=self.employee_user)
        data = {"company_name": "Unauthorized Company"}
        response = self.client.post("/api/companies/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_retrieve_single_company(self):
        """Test retrieving single company"""
        self.client.force_authenticate(user=self.employee_user)
        response = self.client.get(f"/api/companies/{self.company.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check custom response format
        self.assertIn("data", response.data)
        self.assertEqual(response.data["data"]["company_name"], "Test Company")

    def test_update_company_as_admin(self):
        """Test updating company as admin"""
        self.client.force_authenticate(user=self.admin_user)
        data = {"company_name": "Updated Company"}
        response = self.client.patch(
            f"/api/companies/{self.company.id}/", data, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check custom response format
        self.assertIn("data", response.data)
        self.assertEqual(response.data["data"]["company_name"], "Updated Company")

    def test_delete_company_as_admin(self):
        """Test deleting company as admin"""
        self.client.force_authenticate(user=self.admin_user)
        company = Company.objects.create(company_name="To Delete")
        response = self.client.delete(f"/api/companies/{company.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)


class EmployeeAPITest(APITestCase):
    """Integration tests for Employee API endpoints"""

    def setUp(self):
        self.manager_user = User.objects.create_user(
            username="manager",
            email="manager@example.com",
            password="manager123",
            role="manager",
        )
        self.company = Company.objects.create(company_name="Test Company")
        self.department = Department.objects.create(
            company=self.company, department_name="IT"
        )

    def test_create_employee(self):
        """Test creating employee"""
        self.client.force_authenticate(user=self.manager_user)
        data = {
            "company": self.company.id,
            "department": self.department.id,
            "employee_name": "New Employee",
            "email_address": "newemp@example.com",
            "mobile_number": "+1234567890",
            "address": "123 Main St",
            "designation": "Developer",
            "employee_status": "application_received",
        }
        response = self.client.post("/api/employees/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_workflow_transition_valid(self):
        """Test valid workflow transition"""
        self.client.force_authenticate(user=self.manager_user)

        # Create employee
        employee = Employee.objects.create(
            company=self.company,
            department=self.department,
            employee_name="Test Employee",
            email_address="test@example.com",
            mobile_number="+1234567890",
            address="123 Test St",
            designation="Developer",
            employee_status="application_received",
        )

        # Valid transition: application_received -> interview_scheduled
        data = {"employee_status": "interview_scheduled"}
        response = self.client.patch(
            f"/api/employees/{employee.id}/", data, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_workflow_transition_invalid(self):
        """Test invalid workflow transition"""
        self.client.force_authenticate(user=self.manager_user)

        # Create employee
        employee = Employee.objects.create(
            company=self.company,
            department=self.department,
            employee_name="Test Employee",
            email_address="test@example.com",
            mobile_number="+1234567890",
            address="123 Test St",
            designation="Developer",
            employee_status="application_received",
        )

        # Invalid transition: application_received -> hired (must go through interview)
        data = {"employee_status": "hired", "hired_on": date.today().isoformat()}
        response = self.client.patch(
            f"/api/employees/{employee.id}/", data, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_employee_report(self):
        """Test employee report endpoint"""
        self.client.force_authenticate(user=self.manager_user)

        # Create hired employee
        Employee.objects.create(
            company=self.company,
            department=self.department,
            employee_name="Hired Employee",
            email_address="hired@example.com",
            mobile_number="+1234567890",
            address="123 Test St",
            designation="Developer",
            employee_status="hired",
            hired_on=date.today(),
        )

        response = self.client.get("/api/employees/report/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check custom response format
        self.assertIn("data", response.data)
        self.assertTrue(len(response.data["data"]) > 0)


class DashboardAPITest(APITestCase):
    """Integration tests for Dashboard endpoint"""

    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="test123",
            role="employee",
        )

    def test_dashboard_summary(self):
        """Test dashboard summary endpoint"""
        self.client.force_authenticate(user=self.user)

        # Create test data
        Company.objects.create(company_name="Company 1")
        Company.objects.create(company_name="Company 2")

        response = self.client.get("/api/dashboard/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check custom response format
        self.assertIn("data", response.data)
        self.assertIn("total_companies", response.data["data"])
        self.assertEqual(response.data["data"]["total_companies"], 2)

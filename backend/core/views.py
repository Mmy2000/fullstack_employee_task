from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.db.models import ProtectedError

from core.services.dashboard_service import DashboardService
from .models import Company, Department, Employee
from .serializers import (
    CompanySerializer,
    DepartmentSerializer,
    EmployeeSerializer,
    EmployeeReportSerializer,
    DepartmentDetailsSerializer,
    CompanyDetailsSerializer,
)
from config.permissions import CompanyPermission, DepartmentPermission, EmployeePermission
from config.response import CustomResponse
import logging

logger = logging.getLogger(__name__)


# Company ViewSet
class CompanyViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Company CRUD operations
    GET: All authenticated users
    POST, PATCH, DELETE: Admin only
    """

    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [CompanyPermission]

    def list(self, request):
        """List all companies"""
        try:
            companies = self.get_queryset()
            serializer = self.get_serializer(companies, many=True)
            logger.info(f"Companies listed by user: {request.user.email}")
            return CustomResponse(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error listing companies: {str(e)}")
            return CustomResponse(
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                message=str(e),
            )

    def retrieve(self, request, pk=None):
        """Retrieve a single company"""
        try:
            company = self.get_object()
            serializer = CompanyDetailsSerializer(company)
            return CustomResponse(serializer.data, status=status.HTTP_200_OK)
        except Company.DoesNotExist:
            return CustomResponse(
                status=status.HTTP_404_NOT_FOUND,
                message="Company not found",
            )
        except Exception as e:
            logger.error(f"Error retrieving company: {str(e)}")
            return CustomResponse(
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                message=str(e),
            )

    def create(self, request):
        """Create a new company"""
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            logger.info(
                f"Company created by {request.user.email}: {serializer.data['company_name']}"
            )
            return CustomResponse(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Error creating company: {str(e)}")
            return CustomResponse(message=str(e), status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        """Update a company (full update)"""
        try:
            company = self.get_object()
            serializer = self.get_serializer(company, data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            logger.info(
                f"Company updated by {request.user.email}: {company.company_name}"
            )
            return CustomResponse(serializer.data, status=status.HTTP_200_OK)
        except Company.DoesNotExist:
            return CustomResponse(
                message="Company not found", status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error updating company: {str(e)}")
            return CustomResponse(message=str(e), status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, pk=None):
        """Partially update a company"""
        try:
            company = self.get_object()
            serializer = self.get_serializer(company, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            logger.info(
                f"Company partially updated by {request.user.email}: {company.company_name}"
            )
            return CustomResponse(serializer.data, status=status.HTTP_200_OK)
        except Company.DoesNotExist:
            return CustomResponse(
                message="Company not found", status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error updating company: {str(e)}")
            return CustomResponse( message=str(e), status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        """Delete a company"""
        try:
            company = self.get_object()
            company_name = company.company_name
            company.delete()
            logger.info(f"Company deleted by {request.user.email}: {company_name}")
            return CustomResponse(
                status=status.HTTP_204_NO_CONTENT,
                message="Company deleted successfully",
            )
        except Company.DoesNotExist:
            return CustomResponse(
                status=status.HTTP_404_NOT_FOUND,
                message="Company not found",
            )
        except ProtectedError:
            return CustomResponse(
                status=status.HTTP_400_BAD_REQUEST,
                message="Cannot delete company with associated departments or employees",
            )
        except Exception as e:
            logger.error(f"Error deleting company: {str(e)}")
            return CustomResponse(
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                message=str(e),
            )


# Department ViewSet
class DepartmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Department CRUD operations
    GET: All authenticated users
    POST, PATCH, DELETE: Admin and Manager
    """

    queryset = Department.objects.select_related("company").all()
    serializer_class = DepartmentSerializer
    permission_classes = [DepartmentPermission]

    def list(self, request):
        """List all departments with optional company filter"""
        try:
            departments = self.get_queryset()
            company_id = request.query_params.get("company", None)
            if company_id:
                departments = departments.filter(company_id=company_id)

            serializer = self.get_serializer(departments, many=True)
            return CustomResponse(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error listing departments: {str(e)}")
            return CustomResponse(
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                message=str(e),
            )

    def retrieve(self, request, pk=None):
        """Retrieve a single department"""
        try:
            department = self.get_object()
            serializer = DepartmentDetailsSerializer(department)
            return CustomResponse(serializer.data, status=status.HTTP_200_OK)
        except Department.DoesNotExist:
            return CustomResponse(
                message="Department not found", status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error retrieving department: {str(e)}")
            return CustomResponse(
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                message=str(e)
            )

    def create(self, request):
        """Create a new department"""
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            logger.info(f"Department created by {request.user.email}")
            return CustomResponse(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Error creating department: {str(e)}")
            return CustomResponse(message=str(e), status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        """Update a department"""
        try:
            department = self.get_object()
            serializer = self.get_serializer(department, data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            logger.info(f"Department updated by {request.user.email}")
            return CustomResponse(serializer.data, status=status.HTTP_200_OK)
        except Department.DoesNotExist:
            return CustomResponse(
                message="Department not found", status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error updating department: {str(e)}")
            return CustomResponse(message=str(e), status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, pk=None):
        """Partially update a department"""
        try:
            department = self.get_object()
            serializer = self.get_serializer(
                department, data=request.data, partial=True
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            logger.info(f"Department partially updated by {request.user.email}")
            return CustomResponse(serializer.data, status=status.HTTP_200_OK)
        except Department.DoesNotExist:
            return CustomResponse(
                message="Department not found", status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error updating department: {str(e)}")
            return CustomResponse(message=str(e), status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        """Delete a department"""
        try:
            department = self.get_object()
            department_name = department.department_name

            department.delete()

            logger.info(f"Department deleted by {request.user.email}: {department_name}")
            return CustomResponse(
                message="Department deleted successfully",
                status=status.HTTP_204_NO_CONTENT,
            )
        except ProtectedError:
            return CustomResponse(
                message=f"Cannot delete department because it has employees. Please reassign or remove employees first.",
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Department.DoesNotExist:
            return CustomResponse(
                message="Department not found", status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error deleting department: {str(e)}")
            return CustomResponse(
                status=status.HTTP_500_INTERNAL_SERVER_ERROR, message=str(e)
            )


# Employee ViewSet
class EmployeeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Employee CRUD operations
    GET: All authenticated users
    POST, PATCH, DELETE: Admin and Manager
    """

    queryset = Employee.objects.select_related("company", "department").all()
    serializer_class = EmployeeSerializer
    permission_classes = [EmployeePermission]

    def list(self, request):
        """List all employees with optional filters"""
        try:
            employees = self.get_queryset()

            # Filter by company
            company_id = request.query_params.get("company", None)
            if company_id:
                employees = employees.filter(company_id=company_id)

            # Filter by department
            department_id = request.query_params.get("department", None)
            if department_id:
                employees = employees.filter(department_id=department_id)

            # Filter by status
            status_filter = request.query_params.get("status", None)
            if status_filter:
                employees = employees.filter(employee_status=status_filter)

            serializer = self.get_serializer(employees, many=True)
            return CustomResponse(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error listing employees: {str(e)}")
            return CustomResponse(
                message="Failed to retrieve employees",
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def retrieve(self, request, pk=None):
        """Retrieve a single employee"""
        try:
            employee = self.get_object()
            serializer = self.get_serializer(employee)
            return CustomResponse(serializer.data, status=status.HTTP_200_OK)
        except Employee.DoesNotExist:
            return CustomResponse(
                message="Employee not found", status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error retrieving employee: {str(e)}")
            return CustomResponse(
                message=str(e),
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def create(self, request):
        """Create a new employee"""
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            logger.info(f"Employee created by {request.user.email}")
            return CustomResponse(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Error creating employee: {str(e)}")
            return CustomResponse(message=str(e), status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        """Update an employee"""
        try:
            employee = self.get_object()
            serializer = self.get_serializer(employee, data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            logger.info(f"Employee updated by {request.user.email}")
            return CustomResponse(serializer.data, status=status.HTTP_200_OK)
        except Employee.DoesNotExist:
            return CustomResponse(
                message="Employee not found", status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error updating employee: {str(e)}")
            return CustomResponse(message=str(e), status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, pk=None):
        """Partially update an employee"""
        try:
            employee = self.get_object()
            serializer = self.get_serializer(employee, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            logger.info(f"Employee partially updated by {request.user.email}")
            return CustomResponse(serializer.data, status=status.HTTP_200_OK)
        except Employee.DoesNotExist:
            return CustomResponse(
                message="Employee not found", status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error updating employee: {str(e)}")
            return CustomResponse(message= str(e), status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        """Delete an employee"""
        try:
            employee = self.get_object()
            employee_name = employee.employee_name
            employee.delete()
            logger.info(f"Employee deleted by {request.user.email}: {employee_name}")
            return CustomResponse(
                message="Employee deleted successfully",
                status=status.HTTP_204_NO_CONTENT,
            )
        except Employee.DoesNotExist:
            return CustomResponse(
                message="Employee not found", status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error deleting employee: {str(e)}")
            return CustomResponse(
                message=str(e),
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(detail=False, methods=["get"])
    def report(self, request):
        """Get report of all hired employees"""
        try:
            hired_employees = self.get_queryset().filter(employee_status="hired")
            serializer = EmployeeReportSerializer(hired_employees, many=True)
            logger.info(f"Employee report generated by {request.user.email}")
            return CustomResponse(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error generating employee report: {str(e)}")
            return CustomResponse(
                message=str(e),
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# Dashboard View (Bonus)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_summary(request):
    """Get summary statistics for dashboard"""
    try:
        data = DashboardService.get_summary()
        logger.info(f"Dashboard accessed by {request.user.email}")
        return CustomResponse(data, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error generating dashboard: {str(e)}")
        return CustomResponse(
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            message=str(e)
        )

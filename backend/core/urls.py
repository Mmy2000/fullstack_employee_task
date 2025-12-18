from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CompanyViewSet,
    DepartmentViewSet,
    EmployeeViewSet,
    dashboard_summary,
)

# Create router for viewsets
router = DefaultRouter()
router.register(r"companies", CompanyViewSet, basename="company")
router.register(r"departments", DepartmentViewSet, basename="department")
router.register(r"employees", EmployeeViewSet, basename="employee")

urlpatterns = [
    # Dashboard endpoint
    path("dashboard/", dashboard_summary, name="dashboard"),
    # Include router URLs
    path("", include(router.urls)),
]

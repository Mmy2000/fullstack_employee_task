from django.contrib import admin
from django.urls import path,include
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("accounts/", include("accounts.urls")),
    path("api/", include("core.urls")),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
]


"""
API Endpoints Documentation:

Authentication:
- POST   accounts/api/register/          - Register new user
- POST   accounts/api/login/             - Login user (returns JWT tokens)
- GET    accounts/api/user/              - Get current authenticated user

Companies:
- GET    /api/companies/              - List all companies
- POST   /api/companies/              - Create new company (Admin only)
- GET    /api/companies/{id}/         - Retrieve single company
- PUT    /api/companies/{id}/         - Update company (Admin only)
- PATCH  /api/companies/{id}/         - Partial update company (Admin only)
- DELETE /api/companies/{id}/         - Delete company (Admin only)

Departments:
- GET    /api/departments/            - List all departments (supports ?company={id} filter)
- POST   /api/departments/            - Create new department (Admin/Manager)
- GET    /api/departments/{id}/       - Retrieve single department
- PUT    /api/departments/{id}/       - Update department (Admin/Manager)
- PATCH  /api/departments/{id}/       - Partial update department (Admin/Manager)
- DELETE /api/departments/{id}/       - Delete department (Admin/Manager)

Employees:
- GET    /api/employees/              - List all employees (supports filters: ?company={id}, ?department={id}, ?status={status})
- POST   /api/employees/              - Create new employee (Admin/Manager)
- GET    /api/employees/{id}/         - Retrieve single employee
- PUT    /api/employees/{id}/         - Update employee (Admin/Manager)
- PATCH  /api/employees/{id}/         - Partial update employee (Admin/Manager)
- DELETE /api/employees/{id}/         - Delete employee (Admin/Manager)
- GET    /api/employees/report/       - Get report of hired employees

Dashboard:
- GET    /api/dashboard/              - Get summary statistics
"""

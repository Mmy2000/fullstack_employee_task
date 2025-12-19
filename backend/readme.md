# Employee Management System - Django Backend

A comprehensive REST API backend for managing companies, departments, and employees with role-based access control and workflow management.

## 🚀 Features

### ✅ Implemented (Mandatory Requirements)

#### Models
- [x] **User Accounts** - Custom user model with role-based access (Admin, Manager, Employee)
- [x] **Company** - Manage companies with auto-calculated department and employee counts
- [x] **Department** - Manage departments linked to companies with employee counts
- [x] **Employee** - Complete employee management with workflow status

#### Business Logic & Validations
- [x] All required field validations
- [x] Email and phone number format validation
- [x] Auto-calculation of department and employee counts
- [x] Auto-calculation of days employed based on hire date
- [x] Department filtering by selected company
- [x] Cascade deletion handling
- [x] Comprehensive error handling with appropriate status codes

#### Workflow (Bonus - Implemented)
- [x] Employee onboarding workflow with 4 stages:
  - Application Received
  - Interview Scheduled
  - Hired
  - Not Accepted
- [x] Validated state transitions
- [x] Workflow validation in models and serializers

#### Security & Permissions
- [x] JWT-based authentication
- [x] Role-based access control:
  - **Admin**: Full access to all operations
  - **Manager**: Can manage departments and employees, read-only for companies
  - **Employee**: Read-only access to all data
- [x] Protected API endpoints
- [x] Secure password hashing

#### RESTful APIs
- [x] **Authentication APIs**
  - POST `/accounts/api/register/` - User registration
  - POST `/accounts/api/login/` - User login with JWT token
  - GET `/accounts/api/user/` - Get current user
  - PATCH `/accounts/api/user/change_password/` - Get current user
  - PATCH `/accounts/api/user/update/` - Get current user
  
- [x] **Company APIs**
  - GET `/api/companies/` - List all companies
  - POST `/api/companies/` - Create company (Admin only)
  - GET `/api/companies/{id}/` - Get single company
  - PATCH `/api/companies/{id}/` - Update company (Admin only)
  - DELETE `/api/companies/{id}/` - Delete company (Admin only)
  
- [x] **Department APIs**
  - GET `/api/departments/` - List all departments (supports `?company={id}` filter)
  - POST `/api/departments/` - Create department (Admin/Manager)
  - GET `/api/departments/{id}/` - Get single department
  - PATCH `/api/departments/{id}/` - Update department (Admin/Manager)
  - DELETE `/api/departments/{id}/` - Delete department (Admin/Manager)
  
- [x] **Employee APIs**
  - GET `/api/employees/` - List all employees (supports filters)
  - POST `/api/employees/` - Create employee (Admin/Manager)
  - GET `/api/employees/{id}/` - Get single employee
  - PATCH `/api/employees/{id}/` - Update employee (Admin/Manager)
  - DELETE `/api/employees/{id}/` - Delete employee (Admin/Manager)
  - GET `/api/employees/report/` - Get hired employees report

#### Testing (Bonus - Implemented)
- [x] Unit tests for all models
- [x] Integration tests for all API endpoints
- [x] Authentication and authorization tests
- [x] Workflow transition tests
- [x] 30+ test cases covering critical functionality

#### Logging (Bonus - Implemented)
- [x] Comprehensive logging system
- [x] File and console logging
- [x] Request/response logging
- [x] Error tracking
- [x] User action logging

#### Dashboard (Bonus - Implemented)
- [x] GET `/api/dashboard/` - Summary statistics endpoint
  - Total companies, departments, employees
  - Hired employees count
  - Pending applications
  - Scheduled interviews

## 📋 Prerequisites

- Python 3.10 or higher
- pip (Python package manager)
- Virtual environment (recommended)
- PostgreSQL (optional, SQLite used by default)

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Mmy2000/fullstack_employee_task.git
cd backend
```

### 2. Create Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```env
BASE_URL="http://localhost:8000"
DEBUG=True
SECRET_KEY=""
ALLOWED_HOSTS=*

DB_HOST=localhost
DB_NAME=name
DB_USER=postgres
DB_PASSWORD=secret

EMAIL_BACKEND=""
EMAIL_HOST=""
EMAIL_PORT=""
EMAIL_USE_TLS=""
EMAIL_HOST_USER=""
EMAIL_HOST_PASSWORD=""
DEFAULT_FROM_EMAIL=""

ALLOW_ALL_ORIGINS=True
```

### 5. Apply Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Create Superuser (Admin)

```bash
python manage.py createsuperuser
```

Follow the prompts to create an admin account.

### 7. Create Sample Data (Optional)

```bash
python manage.py shell
```

Then run:

```python
from api.models import User, Company, Department, Employee
from datetime import date, timedelta

# Create users
admin = User.objects.create_user(
    username='admin',
    email='admin@example.com',
    password='admin123',
    role='admin'
)

manager = User.objects.create_user(
    username='manager',
    email='manager@example.com',
    password='manager123',
    role='manager'
)

# Create companies
company1 = Company.objects.create(company_name='Tech Corp')
company2 = Company.objects.create(company_name='Finance Inc')

# Create departments
it_dept = Department.objects.create(
    company=company1,
    department_name='IT Department'
)

hr_dept = Department.objects.create(
    company=company1,
    department_name='HR Department'
)

# Create employees
Employee.objects.create(
    company=company1,
    department=it_dept,
    employee_name='John Doe',
    email_address='john@example.com',
    mobile_number='+1234567890',
    address='123 Main St',
    designation='Senior Developer',
    employee_status='hired',
    hired_on=date.today() - timedelta(days=365)
)

Employee.objects.create(
    company=company1,
    department=hr_dept,
    employee_name='Jane Smith',
    email_address='jane@example.com',
    mobile_number='+1234567891',
    address='456 Oak Ave',
    designation='HR Manager',
    employee_status='hired',
    hired_on=date.today() - timedelta(days=180)
)

print("Sample data created successfully!")
```

### 8. Run Development Server

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/`

### 9. Access Admin Panel

Visit `http://localhost:8000/admin/` and login with your superuser credentials.

## 🧪 Running Tests

```bash
# Run all tests
python manage.py test

# Run specific test file
python manage.py test api.tests

# Run with coverage
pip install coverage
coverage run --source='.' manage.py test
coverage report
```

## 📚 API Documentation

| Item                     | Details                                           |
|---------------------------|--------------------------------------------------|
| **Documentation Link**    | [API Docs](http://127.0.0.1:8000/api/docs/)    |
| **Live Demo (Front-end)** | [Front Demo](https://fullstack-employee-task.vercel.app/) |
| **Live Demo (Back-end)**  | [Back Demo](https://aicontrol.pythonanywhere.com/) |
| **Email**                 | my552915@gmail.com                               |
| **Password**              | Mahmoud@123                                     |


### Authentication

All endpoints except registration and login require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-access-token>
```

### Example API Requests

#### 1. Register User
```bash
curl -X POST http://localhost:8000/accounts/api/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "user@example.com",
    "password": "securepass123",
    "role": "employee"
  }'
```

#### 2. Login
```bash
curl -X POST http://localhost:8000/accounts/api/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepass123"
  }'
```

#### 3. List Companies
```bash
curl -X GET http://localhost:8000/api/companies/ \
  -H "Authorization: Bearer <your-token>"
```

#### 4. Create Employee
```bash
curl -X POST http://localhost:8000/api/employees/ \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "company": 1,
    "department": 1,
    "employee_name": "New Employee",
    "email_address": "newemp@example.com",
    "mobile_number": "+1234567890",
    "address": "123 Street",
    "designation": "Developer",
    "employee_status": "application_received"
  }'
```

#### 5. Get Employee Report
```bash
curl -X GET http://localhost:8000/api/employees/report/ \
  -H "Authorization: Bearer <your-token>"
```

## 🔐 Role-Based Access Control

| Role     | Companies | Departments | Employees | Dashboard |
|----------|-----------|-------------|-----------|-----------|
| Admin    | Full CRUD | Full CRUD   | Full CRUD | Read      |
| Manager  | Read      | Full CRUD   | Full CRUD | Read      |
| Employee | Read      | Read        | Read      | Read      |

## 🔄 Employee Workflow

Valid status transitions:
- `Application Received` → `Interview Scheduled` or `Not Accepted`
- `Interview Scheduled` → `Hired` or `Not Accepted`
- `Hired` → `Hired` (no change)
- `Not Accepted` → `Not Accepted` (terminal state)

## 📁 Project Structure

```
backend/
├── api/
│   ├── migrations/
│   ├── __init__.py
│   ├── admin.py          # Admin panel configuration
│   ├── models.py         # Database models
│   ├── serializers.py    # DRF serializers
│   ├── views.py          # API views
│   ├── urls.py           # URL routing
│   ├── permissions.py    # Custom permissions
│   └── tests.py          # Unit & integration tests
├── project/
│   ├── __init__.py
│   ├── settings.py       # Django settings
│   ├── urls.py           # Main URL configuration
│   └── wsgi.py
├── logs/                 # Application logs
├── manage.py
├── requirements.txt
├── .env
└── README.md
```

## 🚨 Error Handling

The API returns standardized error responses:

```json
{
  "error": "Detailed error message"
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `204` - No Content (successful deletion)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## 🔧 Configuration Notes

### Database
- Default: SQLite (for development)
- Production: PostgreSQL (recommended)

To switch to PostgreSQL, update `settings.py`:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'employee_management',
        'USER': 'postgres',
        'PASSWORD': 'your-password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

### CORS Configuration

Update `CORS_ALLOWED_ORIGINS` in `settings.py` for your frontend URL:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # React default
    "http://localhost:5173",  # Vite default
]
```

## 📝 Assumptions & Design Decisions

1. **JWT Authentication**: Chose JWT over session-based auth for better scalability and frontend flexibility
2. **Cascade Deletion**: Company deletion cascades to departments and employees
3. **Workflow Enforcement**: Status transitions are strictly validated
4. **Phone Number Format**: Supports international format with + prefix
5. **Days Employed**: Calculated dynamically, not stored in database
6. **Read Permissions**: All authenticated users can read data, promoting transparency


## 📄 License

This project is part of a technical assessment.

---

**Note**: This is a backend API server. You need to develop a separate frontend application to interact with these endpoints.
from ..models import Company, Department, Employee


class DashboardService:

    @staticmethod
    def get_summary():
        return {
            "total_companies": Company.objects.count(),
            "total_departments": Department.objects.count(),
            "total_employees": Employee.objects.count(),
            "hired_employees": Employee.objects.filter(employee_status="hired").count(),
            "pending_applications": Employee.objects.filter(
                employee_status="application_received"
            ).count(),
            "scheduled_interviews": Employee.objects.filter(
                employee_status="interview_scheduled"
            ).count(),
            "not_selected_employees": Employee.objects.filter(
                employee_status="not_accepted"
            ).count(),
        }

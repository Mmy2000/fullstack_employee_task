"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Employee, EmployeeFilters } from "@/types";
import {
  employeeAPI,
  handleAPIError,
  companyAPI,
  departmentAPI,
} from "@/lib/api";

import { useAuthStore } from "@/store/authStore";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { EmployeesTable } from "@/components/EmployeesTable";
import { EmployeeModal } from "@/components/modals/EmployeeModal";
import { Pagination } from "@/components/Pagination";

import { Plus, Search, Users } from "lucide-react";
import { toast } from "sonner";
import { usePagination } from "@/app/hooks/usePagination";

export default function EmployeesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const canEdit = user?.role === "admin" || user?.role === "manager";

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);

  const [companies, setCompanies] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  const [filters, setFilters] = useState<EmployeeFilters>({});
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );

  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const loadStaticData = async () => {
      try {
        const [companiesData, departmentsData] = await Promise.all([
          companyAPI.getAll(),
          departmentAPI.getAll(),
        ]);
        setCompanies(companiesData);
        setDepartments(departmentsData);
      } catch (error) {
        toast.error(handleAPIError(error));
      }
    };
    loadStaticData();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const data = await employeeAPI.getAll(filters);
      setEmployees(data);
      setFilteredEmployees(data);
    } catch (error) {
      toast.error(handleAPIError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [filters]);

  useEffect(() => {
    if (!search) {
      setFilteredEmployees(employees);
      return;
    }

    const filtered = employees.filter(
      (emp) =>
        emp.employee_name.toLowerCase().includes(search.toLowerCase()) ||
        emp.email_address.toLowerCase().includes(search.toLowerCase()) ||
        emp.designation.toLowerCase().includes(search.toLowerCase())
    );

    setFilteredEmployees(filtered);
  }, [search, employees]);

  useEffect(() => {
    setPage(1);
  }, [search, filters]);

  const { paginatedData, totalItems } = usePagination(
    filteredEmployees,
    page,
    pageSize
  );

  const clearFilters = () => {
    setFilters({});
    setSearch("");
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setDeleting(true);
    try {
      await employeeAPI.delete(deleteId);
      toast.success("Employee deleted successfully");
      fetchEmployees();
      setPage(1);
    } catch (error) {
      toast.error(handleAPIError(error));
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const openCreateModal = () => {
    setSelectedEmployee(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const openEditModal = (employee: Employee) => {
    setSelectedEmployee(employee);
    setModalMode("edit");
    setModalOpen(true);
  };

  const onModalSuccess = () => {
    fetchEmployees();
    toast.success(
      modalMode === "create"
        ? "Employee created successfully"
        : "Employee updated successfully"
    );
  };

  if (loading) {
    return (
      <div>
        <Skeleton className="h-8 w-48 mb-8" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
          <p className="text-muted-foreground">
            Manage employee records and hiring status
          </p>
        </div>
        {canEdit && (
          <Button onClick={openCreateModal}>
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Company */}
            <Select
              value={filters.company?.toString() ?? "all"}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  company: value === "all" ? undefined : Number(value),
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Companies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>
                    {c.company_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Department */}
            <Select
              value={filters.department?.toString() ?? "all"}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  department: value === "all" ? undefined : Number(value),
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments
                  .filter(
                    (d) => !filters.company || d.company === filters.company
                  )
                  .map((d) => (
                    <SelectItem key={d.id} value={d.id.toString()}>
                      {d.department_name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            {/* Status */}
            <Select
              value={filters.status ?? "all"}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  status: value === "all" ? undefined : (value as any),
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="application_received">
                  Application Received
                </SelectItem>
                <SelectItem value="interview_scheduled">
                  Interview Scheduled
                </SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
                <SelectItem value="not_accepted">Not Accepted</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={clearFilters}>
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {paginatedData.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16">
            <Users className="h-14 w-14 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No employees found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or search
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="p-0">
          <CardContent className="p-0">
            <EmployeesTable
              employees={paginatedData}
              canEdit={canEdit}
              onView={(emp) => router.push(`/employees/${emp.id}`)}
              onEdit={openEditModal}
              onDelete={(emp) => setDeleteId(emp.id)}
            />
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      <Pagination
        page={page}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={setPage}
        className="mt-2"
      />

      {/* Modals */}
      <EmployeeModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        employee={selectedEmployee}
        mode={modalMode}
        onSuccess={onModalSuccess}
      />

      {/* Delete Dialog */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the employee record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

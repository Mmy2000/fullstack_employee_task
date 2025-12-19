"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Employee,
  EmployeeFilters,
  STATUS_COLORS,
  STATUS_LABELS,
} from "@/types";
import {
  employeeAPI,
  handleAPIError,
  companyAPI,
  departmentAPI,
} from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Eye, Pencil, Trash2, Search, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
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
import { toast } from "sonner";
import { EmployeeModal } from "@/components/modals/EmployeeModal";

export default function EmployeesPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<EmployeeFilters>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );

  const canEdit = user?.role === "admin" || user?.role === "manager";

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [employees, searchTerm, filters]);

  const fetchData = async () => {
    try {
      const [employeesData, companiesData, departmentsData] = await Promise.all(
        [employeeAPI.getAll(), companyAPI.getAll(), departmentAPI.getAll()]
      );

      setEmployees(employeesData);
      setCompanies(companiesData);
      setDepartments(departmentsData);
    } catch (error) {
      toast.error(handleAPIError(error));
    } finally {
      setLoading(false);
    }
  };

  const filterEmployees = () => {
    let filtered = [...employees];

    if (searchTerm) {
      filtered = filtered.filter(
        (emp) =>
          emp.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.email_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.designation.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.company) {
      filtered = filtered.filter((emp) => emp.company === filters.company);
    }

    if (filters.department) {
      filtered = filtered.filter(
        (emp) => emp.department === filters.department
      );
    }

    if (filters.status) {
      filtered = filtered.filter(
        (emp) => emp.employee_status === filters.status
      );
    }

    setFilteredEmployees(filtered);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setDeleting(true);
    try {
      await employeeAPI.delete(deleteId);
      toast.success("Employee deleted successfully");
      fetchData();
    } catch (error) {
      toast.error(handleAPIError(error));
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm("");
  };

  const handleOpenCreateModal = () => {
    setSelectedEmployee(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const handleOpenEditModal = (employee: Employee) => {
    setSelectedEmployee(employee);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleModalSuccess = () => {
    fetchData();
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
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
          <p className="text-muted-foreground">
            Manage employee records and track their status
          </p>
        </div>
        {canEdit && (
          <Button onClick={handleOpenCreateModal}>
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Company */}
            <Select
              value={filters.company?.toString() ?? "all"}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  company: value === "all" ? undefined : parseInt(value),
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Companies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id.toString()}>
                    {company.company_name}
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
                  department: value === "all" ? undefined : parseInt(value),
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
                    (dept) =>
                      !filters.company || dept.company === filters.company
                  )
                  .map((dept) => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.department_name}
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
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table / Empty */}
      {filteredEmployees.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No employees found</h3>
            <p className="text-muted-foreground text-center mb-4">
              Try adjusting your search or filters
            </p>
            {canEdit && (
              <Button onClick={handleOpenCreateModal}>
                <Plus className="mr-2 h-4 w-4" />
                Add Employee
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Hired On</TableHead>
                  <TableHead>Days Employed</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">
                      {employee.employee_name}
                    </TableCell>
                    <TableCell>{employee.email_address}</TableCell>
                    <TableCell>{employee.company_name}</TableCell>
                    <TableCell>{employee.department_name || "N/A"}</TableCell>
                    <TableCell>{employee.designation}</TableCell>
                    <TableCell>
                      <Badge
                        className={STATUS_COLORS[employee.employee_status]}
                      >
                        {STATUS_LABELS[employee.employee_status]}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(employee.hired_on)}</TableCell>
                    <TableCell>{employee.days_employed != null && employee.days_employed > 0 ? employee.days_employed : formatDate(employee.hired_on)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            router.push(`/employees/${employee.id}`)
                          }
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {canEdit && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEditModal(employee)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteId(employee.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <EmployeeModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuccess={handleModalSuccess}
        employee={selectedEmployee}
        mode={modalMode}
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
              This action cannot be undone. This will permanently delete the
              employee record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

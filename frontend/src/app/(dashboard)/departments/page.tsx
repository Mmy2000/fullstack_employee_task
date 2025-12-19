"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Department, Company } from "@/types";
import { departmentAPI, companyAPI, handleAPIError } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  Briefcase,
  Users,
  Building2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
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
import { DepartmentModal } from "@/components/modals/DepartmentModal";

export default function DepartmentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [companyFilter, setCompanyFilter] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);

  const canEdit = user?.role === "admin" || user?.role === "manager";

  useEffect(() => {
    const companyId = searchParams.get("company");
    if (companyId) {
      setCompanyFilter(companyId);
    }
    fetchData();
  }, [searchParams]);

  const fetchData = async () => {
    try {
      const companyId = searchParams.get("company");
      const filters = companyId ? { company: parseInt(companyId) } : undefined;

      const [deptData, compData] = await Promise.all([
        departmentAPI.getAll(filters),
        companyAPI.getAll(),
      ]);
      setDepartments(deptData);
      setCompanies(compData);
    } catch (error) {
      toast.error(handleAPIError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setDeleting(true);
    try {
      await departmentAPI.delete(deleteId);
      toast.success("Department deleted successfully");
      fetchData();
    } catch (error) {
      toast.error(handleAPIError(error));
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const handleCompanyFilter = (value: string) => {
    setCompanyFilter(value);
    if (value) {
      router.push(`/departments?company=${value}`);
    } else {
      router.push("/departments");
    }
  };

  const handleOpenCreateModal = () => {
    setSelectedDepartment(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const handleOpenEditModal = (department: Department) => {
    setSelectedDepartment(department);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleModalSuccess = () => {
    fetchData();
    toast.success(
      modalMode === "create"
        ? "Department created successfully"
        : "Department updated successfully"
    );
  };

  if (loading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-20 mb-6" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
          <p className="text-muted-foreground">
            Manage your organization's departments
          </p>
        </div>
        {canEdit && (
          <Button onClick={handleOpenCreateModal}>
            <Plus className="mr-2 h-4 w-4" />
            Add Department
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <Select value={companyFilter} onValueChange={handleCompanyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Company" />
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
            </div>
            {companyFilter && (
              <Button variant="outline" onClick={() => handleCompanyFilter("")}>
                Clear Filter
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {departments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Briefcase className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No departments found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {companyFilter
                ? "No departments in this company yet"
                : "Get started by creating your first department"}
            </p>
            {canEdit && !companyFilter && (
              <Button onClick={handleOpenCreateModal}>
                <Plus className="mr-2 h-4 w-4" />
                Add Department
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {departments.map((dept) => (
            <Card key={dept.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">
                        {dept.department_name}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <Building2 className="h-3 w-3" />
                        <span className="truncate">{dept.company_name}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4 pb-4 border-b">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Employees</span>
                  </div>
                  <span className="font-semibold">
                    {dept.number_of_employees}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => router.push(`/departments/${dept.id}`)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Button>
                  {canEdit && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEditModal(dept)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteId(dept.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <DepartmentModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuccess={handleModalSuccess}
        department={selectedDepartment}
        mode={modalMode}
        preselectedCompanyId={
          companyFilter ? parseInt(companyFilter) : undefined
        }
      />

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              department.
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

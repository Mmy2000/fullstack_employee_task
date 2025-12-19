"use client";

import { useState, useEffect } from "react";
import { Employee, EmployeeFormData, Company, Department } from "@/types";
import {
  employeeAPI,
  companyAPI,
  departmentAPI,
  handleAPIError,
} from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";


interface EmployeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  employee?: Employee | null;
  mode: "create" | "edit";
}

export function EmployeeModal({
  open,
  onOpenChange,
  onSuccess,
  employee,
  mode,
}: EmployeeModalProps) {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [allDepartments, setAllDepartments] = useState<Department[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>(
    []
  );

  const [formData, setFormData] = useState<EmployeeFormData>({
    company: 0,
    department: null,
    employee_status: "application_received",
    employee_name: "",
    email_address: "",
    mobile_number: "",
    address: "",
    designation: "",
    hired_on: null,
  });

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  useEffect(() => {
    if (open && employee && mode === "edit") {
      setFormData({
        company: employee.company,
        department: employee.department,
        employee_status: employee.employee_status,
        employee_name: employee.employee_name,
        email_address: employee.email_address,
        mobile_number: employee.mobile_number,
        address: employee.address,
        designation: employee.designation,
        hired_on: employee.hired_on,
      });
    } else if (open && mode === "create") {
      setFormData({
        company: 0,
        department: null,
        employee_status: "application_received",
        employee_name: "",
        email_address: "",
        mobile_number: "",
        address: "",
        designation: "",
        hired_on: null,
      });
    }
    setError("");
  }, [open, employee, mode]);

  useEffect(() => {
    // Filter departments when company changes
    if (formData.company) {
      const filtered = allDepartments.filter(
        (dept) => dept.company === formData.company
      );
      setFilteredDepartments(filtered);

      // Reset department if it doesn't belong to selected company
      if (formData.department) {
        const deptExists = filtered.some((d) => d.id === formData.department);
        if (!deptExists) {
          setFormData((prev) => ({ ...prev, department: null }));
        }
      }
    } else {
      setFilteredDepartments([]);
      setFormData((prev) => ({ ...prev, department: null }));
    }
  }, [formData.company, allDepartments]);

  const fetchData = async () => {
    try {
      const [companiesData, departmentsData] = await Promise.all([
        companyAPI.getAll(),
        departmentAPI.getAll(),
      ]);
      setCompanies(companiesData);
      setAllDepartments(departmentsData);
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "create") {
        await employeeAPI.create(formData);
      } else if (employee) {
        await employeeAPI.update(employee.id, formData);
      }
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Create New Employee" : "Edit Employee"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Add a new employee to your organization"
                : "Update employee information"}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4 h-96">
            <div className="space-y-4 py-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Company & Department */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company">
                    Company <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={
                      formData.company ? formData.company.toString() : undefined
                    }
                    onValueChange={(value) =>
                      handleChange("company", parseInt(value))
                    }
                    disabled={loading || loadingData}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem
                          key={company.id}
                          value={company.id.toString()}
                        >
                          {company.company_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={formData.department?.toString() || ""}
                    onValueChange={(value) =>
                      handleChange("department", value ? parseInt(value) : null)
                    }
                    disabled={loading || loadingData || !formData.company}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          formData.company
                            ? "Select department"
                            : "Select company first"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No Department</SelectItem>
                      {filteredDepartments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.department_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Personal Info */}
              <div className="space-y-2">
                <Label htmlFor="employee_name">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="employee_name"
                  value={formData.employee_name}
                  onChange={(e) =>
                    handleChange("employee_name", e.target.value)
                  }
                  placeholder="John Doe"
                  required
                  disabled={loading}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email_address">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email_address"
                    type="email"
                    value={formData.email_address}
                    onChange={(e) =>
                      handleChange("email_address", e.target.value)
                    }
                    placeholder="john@example.com"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile_number">
                    Mobile Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="mobile_number"
                    value={formData.mobile_number}
                    onChange={(e) =>
                      handleChange("mobile_number", e.target.value)
                    }
                    placeholder="+1234567890"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">
                  Address <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="123 Main Street, City, State, ZIP"
                  required
                  disabled={loading}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="designation">
                  Designation <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="designation"
                  value={formData.designation}
                  onChange={(e) => handleChange("designation", e.target.value)}
                  placeholder="Software Engineer"
                  required
                  disabled={loading}
                />
              </div>

              {/* Employment Status */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="employee_status">
                    Status <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.employee_status}
                    onValueChange={(value: any) =>
                      handleChange("employee_status", value)
                    }
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
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
                </div>

                {formData.employee_status === "hired" && (
                  <div className="space-y-2">
                    <Label htmlFor="hired_on">
                      Hired Date <span className="text-destructive">*</span>
                    </Label>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-full justify-start text-left font-normal ${
                            !formData.hired_on && "text-muted-foreground"
                          }`}
                          disabled={loading}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.hired_on
                            ? format(new Date(formData.hired_on), "PPP")
                            : "Pick a date"}
                        </Button>
                      </PopoverTrigger>

                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            formData.hired_on
                              ? new Date(formData.hired_on)
                              : undefined
                          }
                          onSelect={(date) =>
                            handleChange(
                              "hired_on",
                              date ? format(date, "yyyy-MM-dd") : null
                            )
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="my-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || loadingData || !formData.company}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === "create" ? "Creating..." : "Saving..."}
                </>
              ) : (
                <>{mode === "create" ? "Create Employee" : "Save Changes"}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

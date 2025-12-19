"use client";

import { useState, useEffect } from "react";
import { Company, Department, DepartmentFormData } from "@/types";
import { companyAPI, departmentAPI, handleAPIError } from "@/lib/api";

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

interface DepartmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  department?: Department | null;
  mode: "create" | "edit";
  preselectedCompanyId?: number;
}

export function DepartmentModal({
  open,
  onOpenChange,
  onSuccess,
  department,
  mode,
  preselectedCompanyId,
}: DepartmentModalProps) {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);

  const [formData, setFormData] = useState<DepartmentFormData>({
    company: preselectedCompanyId ?? 0,
    department_name: "",
  });

  /* ================= Fetch Companies ================= */
  useEffect(() => {
    if (open) fetchCompanies();
  }, [open]);

  const fetchCompanies = async () => {
    try {
      const data = await companyAPI.getAll();
      setCompanies(data);
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setLoadingData(false);
    }
  };

  /* ================= Hydrate Form ================= */
  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && department) {
      setFormData({
        company: department.company,
        department_name: department.department_name,
      });
    }

    if (mode === "create") {
      setFormData({
        company: preselectedCompanyId ?? 0,
        department_name: "",
      });
    }

    setError("");
  }, [open, department, mode, preselectedCompanyId]);

  /* ================= Submit ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "create") {
        await departmentAPI.create(formData);
      } else if (department) {
        await departmentAPI.update(department.id, formData);
      }

      onSuccess();
      onOpenChange(false);
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof DepartmentFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  /* ================= UI ================= */
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Create Department" : "Edit Department"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Add a new department"
                : "Update department information"}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4 py-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Company */}
              <div className="space-y-2">
                <Label>
                  Company <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.company?.toString() || ""}
                  onValueChange={(value) =>
                    handleChange("company", parseInt(value))
                  }
                  disabled={loading || loadingData || !!preselectedCompanyId}
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

              {/* Department Name */}
              <div className="space-y-2">
                <Label>
                  Department Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={formData.department_name}
                  onChange={(e) =>
                    handleChange("department_name", e.target.value)
                  }
                  required
                  disabled={loading}
                  placeholder="HR, IT, Finance..."
                />
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="mt-4">
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
              ) : mode === "create" ? (
                "Create Department"
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

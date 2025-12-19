"use client";

import { Employee, STATUS_COLORS, STATUS_LABELS } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface EmployeesTableProps {
  employees: Employee[];
  canEdit?: boolean;
  onView?: (employee: Employee) => void;
  onEdit?: (employee: Employee) => void;
  onDelete?: (employee: Employee) => void;
}

export function EmployeesTable({
  employees,
  canEdit = false,
  onView,
  onEdit,
  onDelete,
}: EmployeesTableProps) {
  return (
    <Table className="">
      <TableHeader className="">
        <TableRow className="">
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
        {employees.map((employee) => (
          <TableRow key={employee.id}>
            <TableCell className="font-medium">
              {employee.employee_name}
            </TableCell>
            <TableCell>{employee.email_address}</TableCell>
            <TableCell>{employee.company_name}</TableCell>
            <TableCell>{employee.department_name || "N/A"}</TableCell>
            <TableCell>{employee.designation}</TableCell>

            <TableCell>
              <Badge className={STATUS_COLORS[employee.employee_status]}>
                {STATUS_LABELS[employee.employee_status]}
              </Badge>
            </TableCell>

            <TableCell>{formatDate(employee.hired_on)}</TableCell>
            <TableCell>
              {employee.days_employed && employee.days_employed > 0
                ? employee.days_employed
                : formatDate(employee.hired_on)}
            </TableCell>

            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                {onView && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(employee)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}

                {canEdit && onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(employee)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}

                {canEdit && onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(employee)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

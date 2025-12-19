"use client";

import { useEffect, useState } from "react";
import { employeeAPI, handleAPIError } from "@/lib/api";
import { EmployeeReportData } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import { FileText, Search, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ReportPage() {
  const [employees, setEmployees] = useState<EmployeeReportData[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<
    EmployeeReportData[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchReport();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [employees, searchTerm]);

  const fetchReport = async () => {
    try {
      const data = await employeeAPI.getReport();
      setEmployees(data);
    } catch (error) {
      toast.error("Error", {
        description: handleAPIError(error),
      });
    } finally {
      setLoading(false);
    }
  };

  const filterEmployees = () => {
    if (!searchTerm) {
      setFilteredEmployees(employees);
      return;
    }

    const term = searchTerm.toLowerCase();

    const filtered = employees.filter(
      (emp) =>
        emp.employee_name?.toLowerCase().includes(term) ||
        emp.email_address?.toLowerCase().includes(term) ||
        emp.company_name?.toLowerCase().includes(term) ||
        emp.department_name?.toLowerCase().includes(term) ||
        emp.position?.toLowerCase().includes(term)
    );

    setFilteredEmployees(filtered);
  };


  const exportToCSV = () => {
    const headers = [
      "Employee Name",
      "Email",
      "Mobile Number",
      "Position",
      "Hired On",
      "Days Employed",
      "Company",
      "Department",
    ];

    const csvData = filteredEmployees.map((emp) => [
      emp.employee_name,
      emp.email_address,
      emp.mobile_number,
      emp.position,
      emp.hired_on,
      emp.days_employed.toString(),
      emp.company_name,
      emp.department_name,
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `employee-report-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success( "Report exported successfully");
  };

  if (loading) {
    return (
      <div>
        <Skeleton className="h-8 w-64 mb-8" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-96" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Hired Employees Report
        </h1>
        <p className="text-muted-foreground">
          Comprehensive report of all hired employees
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Employee Report
              </CardTitle>
              <CardDescription>
                Showing {filteredEmployees.length} of {employees.length} hired
                employees
              </CardDescription>
            </div>
            <Button
              onClick={exportToCSV}
              disabled={filteredEmployees.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, company, department, or position..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {filteredEmployees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No employees found</h3>
              <p className="text-muted-foreground">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "No hired employees to display"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Hired On</TableHead>
                    <TableHead className="text-right">Days Employed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {employee.employee_name}
                      </TableCell>
                      <TableCell>{employee.email_address}</TableCell>
                      <TableCell>{employee.mobile_number}</TableCell>
                      <TableCell>{employee.position}</TableCell>
                      <TableCell>{employee.company_name}</TableCell>
                      <TableCell>{employee.department_name}</TableCell>
                      <TableCell>{formatDate(employee.hired_on)}</TableCell>
                      <TableCell className="text-right">
                        {employee.days_employed && employee.days_employed > 0
                          ? employee.days_employed
                          : formatDate(employee.hired_on)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

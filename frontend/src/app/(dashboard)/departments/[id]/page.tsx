"use client";

import { departmentAPI } from "@/lib/api";
import { DepartmentDetails } from "@/types";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Briefcase, Building2, Timer, Users } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { EmployeesTable } from "@/components/EmployeesTable";
import { Stat } from "@/components/Stats";
import { Button } from "@/components/ui/button";

const Page = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<DepartmentDetails | null>(null);

  useEffect(() => {
    if (!id) return;

    departmentAPI.getById(Number(id)).then((response) => {
      setData(response as DepartmentDetails);
    });
  }, [id]);

  if (!data)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );

  return (
    <>
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Title */}
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold leading-none">
                  {data.department_name}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Department Overview
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Stat
                icon={<Building2 className="h-4 w-4" />}
                label="Company"
                value={data.company_name}
              />
              <Stat
                icon={<Users className="h-4 w-4" />}
                label="Employees"
                value={data.number_of_employees}
              />
              <Stat
                icon={<Timer className="h-4 w-4" />}
                label="Created At"
                value={formatDate(data.created_at)}
              />
            </div>
          </CardContent>
        </Card>
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Employees</h2>
            <p className="text-sm text-muted-foreground">
              Browse employees by department
            </p>
          </div>
          <Card className="p-0">
            <CardContent className="p-0">
              {data.employees.length > 0 ? (
                <EmployeesTable
                  employees={data.employees}
                  onView={(emp) => router.push(`/employees/${emp.id}`)}
                />
              ) : (
                <div className="py-20 text-center text-muted-foreground">
                  No employees in this department
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Page;

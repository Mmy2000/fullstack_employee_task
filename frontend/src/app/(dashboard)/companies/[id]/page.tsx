"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { companyAPI } from "@/lib/api";
import { CompanyDetails } from "@/types";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { EmployeesTable } from "@/components/EmployeesTable";
import { Pagination } from "@/components/Pagination";
import { Stat } from "@/components/Stats";
import { Button } from "@/components/ui/button";

import { Building2, Users, Layers, Timer, ArrowLeft } from "lucide-react";

import { formatDate } from "@/lib/utils";
import { usePagination } from "@/app/hooks/usePagination";

const PAGE_SIZE = 10;

const Page = () => {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [data, setData] = useState<CompanyDetails | null>(null);
  const [activeDeptId, setActiveDeptId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!id) return;

    companyAPI.getById(Number(id)).then((res) => {
      setData(res);
      setActiveDeptId(res.departments[0]?.id.toString() ?? null);
      setPage(1);
    });
  }, [id]);

  const activeDepartment =
    data?.departments.find((d) => d.id.toString() === activeDeptId) ?? null;

  const employees = activeDepartment?.employees ?? [];

  const { paginatedData, totalItems } = usePagination(
    employees,
    page,
    PAGE_SIZE
  );

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* ================= Header ================= */}
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
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold leading-none">
                {data.company_name}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Company Overview
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Stat
              icon={<Layers className="h-4 w-4" />}
              label="Departments"
              value={data.number_of_departments}
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

      {/* ================= Departments ================= */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Departments</h2>
          <p className="text-sm text-muted-foreground">
            Browse employees by department
          </p>
        </div>

        <Tabs
          value={activeDeptId ?? ""}
          onValueChange={(value) => {
            setActiveDeptId(value);
            setPage(1); // reset pagination on tab change
          }}
          className="w-full"
        >
          {/* Tabs Header */}
          <TabsList className="flex justify-start gap-2 bg-muted/50 p-4 rounded-xl">
            {data.departments.map((dept) => (
              <TabsTrigger
                key={dept.id}
                value={dept.id.toString()}
                className="px-4 py-3 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                {dept.department_name}
                <span className="ml-2 text-xs text-muted-foreground">
                  ({dept.number_of_employees})
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Tabs Content */}
          {data.departments.map((dept) => (
            <TabsContent
              key={dept.id}
              value={dept.id.toString()}
              className="mt-6"
            >
              <Card className="p-0">
                <CardContent className="p-0">
                  {dept.employees.length > 0 ? (
                    <>
                      <EmployeesTable
                        employees={paginatedData}
                        onView={(emp) => router.push(`/employees/${emp.id}`)}
                      />

                      <Pagination
                        page={page}
                        pageSize={PAGE_SIZE}
                        totalItems={totalItems}
                        onPageChange={setPage}
                        className="p-4"
                      />
                    </>
                  ) : (
                    <div className="py-20 text-center text-muted-foreground">
                      No employees in this department
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default Page;

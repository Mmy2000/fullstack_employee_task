"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { employeeAPI } from "@/lib/api";
import { Employee, STATUS_COLORS, STATUS_LABELS } from "@/types";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  ArrowLeft,
  Building2,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Calendar,
} from "lucide-react";
import { Stat } from "@/components/Stats";

const Page = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<Employee | null>(null);

  useEffect(() => {
    if (!id) return;
    employeeAPI.getById(Number(id)).then(setData);
  }, [id]);

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
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
          {/* Top */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold">{data.employee_name}</h1>
              <p className="text-muted-foreground">{data.designation}</p>
            </div>

            <Badge className={STATUS_COLORS[data.employee_status]}>
              {STATUS_LABELS[data.employee_status]}
            </Badge>
          </div>

          {/* Grid Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Info */}
            <Stat
              icon={<Mail />}
              label="Email"
              value={data.email_address}
            />
            <Stat
              icon={<Phone />}
              label="Mobile"
              value={data.mobile_number}
            />
            <Stat icon={<MapPin />} label="Address" value={data.address} />

            {/* Job Info */}
            <Stat
              icon={<Building2 />}
              label="Company"
              value={data.company_name}
            />
            <Stat
              icon={<Briefcase />}
              label="Department"
              value={data.department_name ?? "Not assigned"}
            />
            <Stat
              icon={<Calendar />}
              label="Hired On"
              value={
                data.hired_on
                  ? new Date(data.hired_on).toLocaleDateString()
                  : "Not hired yet"
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* ================= Meta ================= */}
      <Card>
        <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetaItem label="Employee ID" value={data.id} />
          <MetaItem label="Days Employed" value={data.days_employed ?? "—"} />
          <MetaItem
            label="Created At"
            value={new Date(data.created_at).toLocaleDateString()}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;


function MetaItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

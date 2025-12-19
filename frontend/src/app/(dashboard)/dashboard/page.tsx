"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardAPI } from "@/lib/api";
import { DashboardSummary } from "@/types";
import {
  Building2,
  Users,
  Briefcase,
  UserCheck,
  Clock,
  UserX,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await dashboardAPI.getSummary();
        setSummary(data);
      } catch (error) {
        console.error("Failed to fetch dashboard summary:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const stats = [
    {
      title: "Total Companies",
      value: summary?.total_companies || 0,
      icon: Building2,
      color: "bg-blue-500",
    },
    {
      title: "Total Departments",
      value: summary?.total_departments || 0,
      icon: Briefcase,
      color: "bg-purple-500",
    },
    {
      title: "Total Employees",
      value: summary?.total_employees || 0,
      icon: Users,
      color: "bg-indigo-500",
    },
    {
      title: "Hired Employees",
      value: summary?.hired_employees || 0,
      icon: UserCheck,
      color: "bg-green-500",
    },
    {
      title: "Pending Applications",
      value: summary?.pending_applications || 0,
      icon: Clock,
      color: "bg-yellow-500",
    },
    {
      title: "Scheduled Interviews",
      value: summary?.scheduled_interviews || 0,
      icon: Users,
      color: "bg-orange-500",
    },
  ];

  if (loading) {
    return (
      <div>
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your organization's key metrics
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`${stat.color} p-2 rounded-lg`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/employees">
              <div className="flex items-center gap-2 p-3 hover:bg-accent rounded-lg cursor-pointer transition-colors">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">View All Employees</span>
              </div>
            </Link>
            <Link href="/companies">
              <div className="flex items-center gap-2 p-3 hover:bg-accent rounded-lg cursor-pointer transition-colors">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">Manage Companies</span>
              </div>
            </Link>
            <Link href="/departments">
              <div className="flex items-center gap-2 p-3 hover:bg-accent rounded-lg cursor-pointer transition-colors">
                <Briefcase className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">View Departments</span>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {summary?.pending_applications || 0} new applications pending
              review
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {summary?.scheduled_interviews || 0} interviews scheduled
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

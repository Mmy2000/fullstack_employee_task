"use client";

import {  employeeAPI } from "@/lib/api";
import {  Employee } from "@/types";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const Page = () => {
  const { id } = useParams<{ id: string }>();

  const [data, setData] = useState<Employee | null>(null);

  useEffect(() => {
    if (!id) return;

    employeeAPI.getById(Number(id)).then(setData);
  }, [id]);

  if (!data)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );

  return <div>{data.employee_name}</div>;
};

export default Page;

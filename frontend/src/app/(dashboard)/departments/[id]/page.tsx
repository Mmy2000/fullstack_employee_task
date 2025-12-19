"use client";

import {  departmentAPI } from "@/lib/api";
import {  DepartmentDetails } from "@/types";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const Page = () => {
  const { id } = useParams<{ id: string }>();

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

  return <div>{data.department_name}</div>;
};

export default Page;

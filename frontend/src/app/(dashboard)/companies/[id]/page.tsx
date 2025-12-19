"use client";

import { companyAPI } from "@/lib/api";
import {  CompanyDetails } from "@/types";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const Page = () => {
  const { id } = useParams<{ id: string }>();

  const [data, setData] = useState<CompanyDetails | null>(null);

  useEffect(() => {
    if (!id) return;

    companyAPI.getById(Number(id)).then(setData);
  }, [id]);
  

  if (!data) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );;

  return <div>{data.company_name}</div>;
};

export default Page;

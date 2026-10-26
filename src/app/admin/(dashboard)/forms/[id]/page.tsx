import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FormBuilder } from "@/components/admin/FormBuilder";
import { formDTO } from "@/lib/forms";
import { getFormById } from "@/lib/services/forms-service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Edit form" };

export default async function EditFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const form = await getFormById(id);
  if (!form) notFound();

  return <FormBuilder form={formDTO(form)} />;
}

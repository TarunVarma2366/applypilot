"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createApplication(formData: FormData) {
  const company = String(formData.get("company") || "").trim();
  const role = String(formData.get("role") || "").trim();
  const location = String(formData.get("location") || "").trim();

  if (!company || !role) {
    throw new Error("Company and Role are required.");
  }

  await prisma.application.create({
    data: {
      company,
      role,
      location: location || null,
    },
  });

  revalidatePath("/applications");
}

export async function deleteApplication(id: string) {
  await prisma.application.delete({ where: { id } });
  revalidatePath("/applications");
}

export async function updateStage(id: string, stage: string) {
  await prisma.application.update({
    where: { id },
    data: { stage: stage as any },
  });
  revalidatePath("/applications");
}



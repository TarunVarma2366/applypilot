"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function createApplication(formData: FormData) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) redirect("/login");

  const company = getString(formData, "company");
  const role = getString(formData, "role");
  const location = getString(formData, "location");
  const url = getString(formData, "url");
  const salary = getString(formData, "salary");
  const notes = getString(formData, "notes");

  if (!company || !role) return;

  await prisma.application.create({
    data: {
      company,
      role,
      location: location || null,
      url: url || null,
      salary: salary || null,
      notes: notes || null,
      userId: data.user.id,
      // stage defaults to SAVED
    },
  });

  redirect("/applications");
}

export async function updateStage(appId: string, stage: string) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) redirect("/login");

  await prisma.application.updateMany({
    where: { id: appId, userId: data.user.id },
    data: { stage: stage as any },
  });

  redirect("/applications");
}

export async function deleteApplication(appId: string) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) redirect("/login");

  await prisma.application.deleteMany({
    where: { id: appId, userId: data.user.id },
  });

  redirect("/applications");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

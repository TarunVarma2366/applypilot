"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function createTask(applicationId: string, formData: FormData) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) redirect("/login");

  // ✅ ensure the application belongs to this user
  const app = await prisma.application.findFirst({
    where: { id: applicationId, userId: data.user.id },
    select: { id: true },
  });

  if (!app) redirect("/applications");

  const title = getString(formData, "title");
  if (!title) return;

  await prisma.task.create({
    data: {
      applicationId,
      title,
    },
  });

  redirect("/applications");
}

export async function toggleTask(taskId: string, completed: boolean) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) redirect("/login");

  // ✅ update only if task belongs to an app owned by this user
  await prisma.task.updateMany({
    where: {
      id: taskId,
      application: { userId: data.user.id },
    },
    data: { completed },
  });

  redirect("/applications");
}

export async function deleteTask(taskId: string) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) redirect("/login");

  await prisma.task.deleteMany({
    where: {
      id: taskId,
      application: { userId: data.user.id },
    },
  });

  redirect("/applications");
}

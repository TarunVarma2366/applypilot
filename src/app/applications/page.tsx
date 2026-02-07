import { prisma } from "@/lib/prisma";
import { createApplication, deleteApplication, updateStage, logout } from "./actions";
import StatusBadge from "@/components/StatusBadge";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createTask, toggleTask, deleteTask } from "./taskActions";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login");
  }

  const applications = await prisma.application.findMany({
    where: { userId: data.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      tasks: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* ---------------- Header ---------------- */}
        <header className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">Applications</h1>
            <p className="text-sm text-neutral-500">
              Your saved job applications (from Supabase).
            </p>
          </div>

          <form action={logout}>
            <button
              type="submit"
              className="text-sm rounded-md border px-3 py-2 transition hover:bg-neutral-50"
            >
              Logout
            </button>
          </form>
        </header>

        {/* ---------------- Create ---------------- */}
        <section className="rounded-xl border p-4">
          <h2 className="font-semibold mb-3">Add an application</h2>

          <form action={createApplication} className="grid gap-3">
            <input
              name="company"
              placeholder="Company (required)"
              className="w-full rounded-md border px-3 py-2"
              required
            />
            <input
              name="role"
              placeholder="Role (required)"
              className="w-full rounded-md border px-3 py-2"
              required
            />
            <input
              name="location"
              placeholder="Location (optional)"
              className="w-full rounded-md border px-3 py-2"
            />

            <button
              type="submit"
              className="rounded-md bg-black text-white px-4 py-2 w-fit"
            >
              Save
            </button>
          </form>
        </section>

        {/* ---------------- Read + Update + Delete ---------------- */}
        <section className="rounded-xl border p-4">
          {applications.length === 0 ? (
            <div className="rounded-2xl border bg-white/5 p-10 text-center text-neutral-300">
              <h3 className="text-lg font-semibold text-white">
                No applications yet
              </h3>
              <p className="mt-1 text-sm text-neutral-400">
                Add your first application to start tracking your pipeline.
              </p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {applications.map((a) => (
                <li
                  key={a.id}
                  className="rounded-2xl border bg-white/5 p-5 shadow-sm transition hover:bg-white/10 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 space-y-2">
                      <div className="font-semibold text-base truncate">
                        {a.company} — {a.role}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-500">
                        <form
                          action={async (formData) => {
                            "use server";
                            const stage = String(formData.get("stage") || "SAVED");
                            await updateStage(a.id, stage);
                          }}
                          className="flex items-center gap-2"
                        >
                          <span>Stage:</span>

                          <StatusBadge stage={a.stage} />

                          <select
                            name="stage"
                            defaultValue={a.stage}
                            className="rounded-md border px-2 py-1 text-sm"
                          >
                            <option value="SAVED">Saved</option>
                            <option value="APPLIED">Applied</option>
                            <option value="OA">OA</option>
                            <option value="INTERVIEW">Interview</option>
                            <option value="OFFER">Offer</option>
                            <option value="REJECTED">Rejected</option>
                          </select>

                          <button
                            type="submit"
                            className="text-xs rounded-md border px-2 py-1 transition hover:bg-neutral-50"
                          >
                            Update
                          </button>
                        </form>

                        {a.location ? <span>• {a.location}</span> : null}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      <div className="text-xs text-neutral-500">
                        {new Date(a.createdAt).toLocaleDateString()}
                      </div>

                      <form
                        action={async () => {
                          "use server";
                          await deleteApplication(a.id);
                        }}
                      >
                        <button
                          type="submit"
                          className="text-xs rounded-md border px-2 py-1 transition hover:bg-neutral-50"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* ---------------- Tasks ---------------- */}
                  <div className="mt-4 border-t pt-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-neutral-700">
                        Tasks
                      </h3>
                      <span className="text-xs text-neutral-400">
                        {a.tasks.filter((t) => !t.completed).length} open
                      </span>
                    </div>

                    {/* Add task */}
                    <form
                      action={async (formData) => {
                        "use server";
                        await createTask(a.id, formData);
                      }}
                      className="mt-2 flex gap-2"
                    >
                      <input
                        name="title"
                        placeholder="Add a task (e.g., follow up, schedule interview)"
                        className="w-full rounded-md border px-3 py-2 text-sm"
                      />
                      <button
                        type="submit"
                        className="text-sm rounded-md bg-black text-white px-3 py-2"
                      >
                        Add
                      </button>
                    </form>

                    {/* Task list */}
                    <ul className="mt-3 space-y-2">
                      {a.tasks.length ? (
                        a.tasks.map((t) => (
                          <li
                            key={t.id}
                            className="flex items-center justify-between gap-3"
                          >
                            <form
                              action={async () => {
                                "use server";
                                await toggleTask(t.id, !t.completed);
                              }}
                              className="flex items-center gap-2 min-w-0"
                            >
                              <button
                                type="submit"
                                className={`h-4 w-4 rounded border ${
                                  t.completed ? "bg-black" : "bg-white"
                                }`}
                                aria-label="Toggle task"
                              />
                              <span
                                className={`text-sm truncate ${
                                  t.completed
                                    ? "line-through text-neutral-400"
                                    : "text-neutral-700"
                                }`}
                                title={t.title}
                              >
                                {t.title}
                              </span>
                            </form>

                            <form
                              action={async () => {
                                "use server";
                                await deleteTask(t.id);
                              }}
                            >
                              <button
                                type="submit"
                                className="text-xs rounded-md border px-2 py-1 hover:bg-neutral-50 transition"
                              >
                                Delete
                              </button>
                            </form>
                          </li>
                        ))
                      ) : (
                        <li className="text-sm text-neutral-400">
                          No tasks yet.
                        </li>
                      )}
                    </ul>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

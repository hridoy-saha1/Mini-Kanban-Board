"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#0b1020] text-white">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-indigo-600/15 blur-3xl" />
        <div className="absolute -right-40 top-20 h-[450px] w-[450px] rounded-full bg-purple-600/10 blur-3xl" />
        <div className="absolute bottom-[-250px] left-1/3 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-3xl" />
      </div>

      {/* Navbar */}
      <header className="relative z-10 border-b border-white/5">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 font-bold shadow-lg shadow-indigo-600/25">
              K
            </div>

            <div>
              <h1 className="font-bold tracking-tight">
                Mini Kanban
              </h1>

              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-600">
                Workspace
              </p>
            </div>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-400 transition hover:text-white"
            >
              Sign in
            </Link>

            <Link
              href="/register"
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10">
        <div className="mx-auto max-w-7xl px-5 pb-20 pt-20 lg:px-8 lg:pb-28 lg:pt-28">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-2 text-xs font-medium text-indigo-300">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
              Simple project management
            </div>

            {/* Heading */}
            <h2 className="text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Turn your ideas into
              <span className="block bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                organized work.
              </span>
            </h2>

            {/* Description */}
            <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
              A simple and powerful Kanban workspace to
              organize projects, manage tasks, collaborate
              with your team, and keep everything moving.
            </p>

            {/* CTA */}
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="w-full rounded-xl bg-indigo-600 px-7 py-3.5 text-sm font-semibold text-white shadow-xl shadow-indigo-600/20 transition hover:-translate-y-0.5 hover:bg-indigo-500 sm:w-auto"
              >
                Create Free Workspace
                <span className="ml-2">→</span>
              </Link>

              <Link
                href="/login"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white sm:w-auto"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Kanban Preview */}
          <div className="relative mx-auto mt-16 max-w-6xl">
            <div className="absolute inset-0 rounded-3xl bg-indigo-600/10 blur-3xl" />

            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#111827] shadow-2xl shadow-black/50">
              {/* Fake browser bar */}
              <div className="flex items-center gap-2 border-b border-white/10 bg-[#0f172a] px-5 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />

                <div className="ml-4 flex-1 rounded-md bg-white/5 px-4 py-1.5 text-center text-[10px] text-slate-600">
                  app.minikanban.local / board
                </div>
              </div>

              {/* Preview content */}
              <div className="p-5 sm:p-7">
                {/* Preview header */}
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <div className="mb-2 h-2 w-16 rounded bg-indigo-500/60" />
                    <div className="h-6 w-44 rounded bg-white/10" />
                  </div>

                  <div className="hidden h-8 w-20 rounded-lg bg-indigo-500/20 sm:block" />
                </div>

                {/* Columns */}
                <div className="grid gap-4 md:grid-cols-3">
                  {/* To Do */}
                  <PreviewColumn
                    title="To Do"
                    count="3"
                    tasks={[
                      "Design landing page",
                      "Create API endpoints",
                      "Write documentation",
                    ]}
                  />

                  {/* Progress */}
                  <PreviewColumn
                    title="In Progress"
                    count="2"
                    tasks={[
                      "Build dashboard",
                      "Implement authentication",
                    ]}
                  />

                  {/* Done */}
                  <PreviewColumn
                    title="Done"
                    count="4"
                    tasks={[
                      "Setup database",
                      "Create project",
                      "Configure backend",
                      "Setup deployment",
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mx-auto mt-20 max-w-5xl">
            <div className="grid gap-4 md:grid-cols-3">
              <FeatureCard
                icon="✓"
                title="Organize"
                description="Create boards and columns that match the way your team works."
              />

              <FeatureCard
                icon="↔"
                title="Move & Prioritize"
                description="Drag tasks between columns and keep your workflow in order."
              />

              <FeatureCard
                icon="♧"
                title="Collaborate"
                description="Share boards with registered team members and work together."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative z-10 border-t border-white/5">
        <div className="mx-auto max-w-4xl px-5 py-20 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-400">
            Get started
          </p>

          <h3 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to get organized?
          </h3>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-500">
            Create your workspace and start turning your
            projects into clear, actionable tasks.
          </p>

          <Link
            href="/register"
            className="mt-7 inline-flex items-center rounded-xl bg-indigo-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500"
          >
            Create Your Account
            <span className="ml-2">→</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-6 text-xs text-slate-700 sm:flex-row lg:px-8">
          <p>© 2026 Mini Kanban</p>

          <p>Built for productive teams.</p>
        </div>
      </footer>
    </main>
  );
}

/* =========================================================
   Preview Column
========================================================= */

function PreviewColumn({
  title,
  count,
  tasks,
}: {
  title: string;
  count: string;
  tasks: string[];
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0f172a] p-3">
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-indigo-400" />

          <span className="text-xs font-semibold text-slate-300">
            {title}
          </span>
        </div>

        <span className="rounded bg-white/5 px-1.5 py-0.5 text-[9px] text-slate-600">
          {count}
        </span>
      </div>

      <div className="space-y-2">
        {tasks.map((task, index) => (
          <div
            key={task}
            className="rounded-lg border border-white/5 bg-[#1a2233] p-3"
          >
            <div className="mb-2 h-2 w-3/4 rounded bg-white/10" />

            <p className="truncate text-[10px] text-slate-500">
              {task}
            </p>

            {index === 0 && (
              <div className="mt-3 h-1 w-1/3 rounded bg-indigo-500/50" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   Feature Card
========================================================= */

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-indigo-500/20 hover:bg-white/[0.05]">
      <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-lg text-indigo-400">
        {icon}
      </div>

      <h3 className="font-semibold text-slate-200">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {description}
      </p>
    </div>
  );
}
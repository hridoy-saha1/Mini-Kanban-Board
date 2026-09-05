"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type LoginResponse = {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

type ApiError = {
  message?: string | string[];
};

const apiBaseUrl = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

function getErrorMessage(payload: unknown) {
  if (typeof payload !== "object" || payload === null) {
    return "Unable to sign in. Please try again.";
  }

  const { message } = payload as ApiError;

  if (Array.isArray(message)) {
    return message.join(" ");
  }

  return message ?? "Unable to sign in. Please try again.";
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setError("Enter your email address and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiBaseUrl}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: trimmedEmail, password }),
      });

      const payload: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        setError(getErrorMessage(payload));
        return;
      }

      const login = payload as Partial<LoginResponse>;

      if (!login.accessToken || !login.user) {
        setError("The server returned an invalid login response. Please try again.");
        return;
      }

      localStorage.setItem("kanban_access_token", login.accessToken);
      localStorage.setItem("kanban_user", JSON.stringify(login.user));
      router.replace("/board");
    } catch {
      setError("We couldn't reach the server. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10 text-slate-950 sm:px-6">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
        <div className="mb-8">
          <p className="mb-3 text-sm font-semibold tracking-[0.2em] text-indigo-600">
            MINI KANBAN
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Welcome back
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Sign in to manage your boards and keep work moving.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <div>
            <label
              className="mb-2 block text-sm font-medium text-slate-800"
              htmlFor="email"
            >
              Email address
            </label>
            <input
              autoComplete="email"
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
              disabled={isSubmitting}
              id="email"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              type="email"
              value={email}
            />
          </div>

          <div>
            <label
              className="mb-2 block text-sm font-medium text-slate-800"
              htmlFor="password"
            >
              Password
            </label>
            <input
              autoComplete="current-password"
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
              disabled={isSubmitting}
              id="password"
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
              type="password"
              value={password}
            />
          </div>

          {error ? (
            <p
              aria-live="polite"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <button
            className="flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:bg-indigo-400"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-slate-600">
          New to Mini Kanban?{" "}
          <Link
            className="font-semibold text-indigo-600 underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            href="/register"
          >
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}

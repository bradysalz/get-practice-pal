import Link from "next/link";
import { redirect } from "next/navigation";
import { sendMagicLinkAction } from "@/lib/auth/actions";
import { getAuthState } from "@/lib/auth/session";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const auth = await getAuthState();
  const params = (await searchParams) ?? {};

  if (auth.user) {
    redirect("/sessions");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl items-center px-4 py-10 md:px-6">
      <div className="grid w-full gap-6 md:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2rem] border border-base-300/70 bg-base-100/85 p-8 shadow-sm backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-secondary">
            PracticePal
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-base-content">
            Sign in with a magic link.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-base-content/75">
            Backend MVP uses Supabase email magic links so every book, session, setlist, and stat is
            scoped to a real user from the start.
          </p>
          <form action={sendMagicLinkAction} className="mt-8 space-y-4">
            <label className="form-control w-full">
              <span className="label-text mb-2 text-sm font-medium text-base-content">Email</span>
              <input
                required
                type="email"
                name="email"
                placeholder="you@example.com"
                className="input input-bordered w-full"
              />
            </label>
            <button className="btn btn-primary w-full sm:w-auto" type="submit">
              Send magic link
            </button>
          </form>
          {params.success ? (
            <p className="mt-4 rounded-xl bg-success/15 px-4 py-3 text-sm text-base-content">
              {params.success}
            </p>
          ) : null}
          {params.error ? (
            <p className="mt-4 rounded-xl bg-error/12 px-4 py-3 text-sm text-base-content">
              {params.error}
            </p>
          ) : null}
          {!auth.isConfigured ? (
            <p className="mt-4 rounded-xl bg-warning/15 px-4 py-3 text-sm text-base-content">
              Supabase env vars are not configured yet. Add them to `.env.local` to test auth.
            </p>
          ) : null}
        </section>
        <aside className="rounded-[2rem] border border-base-300/60 bg-base-100/70 p-8 shadow-sm backdrop-blur">
          <h2 className="text-lg font-semibold text-base-content">What this unlocks</h2>
          <div className="mt-5 space-y-3 text-sm leading-6 text-base-content/75">
            <p>Each user gets isolated library, setlist, session, and stats data via row-level security.</p>
            <p>The same sign-in flow works locally, in preview deployments, and in production.</p>
            <p>
              Once signed in, head to <Link href="/sessions" className="link">Sessions</Link> to land in
              the protected shell.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}

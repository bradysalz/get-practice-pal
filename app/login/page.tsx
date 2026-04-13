import Link from "next/link";
import { redirect } from "next/navigation";
import {
  sendMagicLinkAction,
  signInWithPasswordAction,
  signUpWithPasswordAction,
} from "@/lib/auth/actions";
import { Field, TextInput } from "@/components/ui/primitives";
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
  const isDevPasswordLoginEnabled = process.env.ENABLE_DEV_PASSWORD_LOGIN === "true";

  if (auth.user) {
    redirect("/sessions");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl items-center px-4 py-10 md:px-6">
      <div className="grid w-full gap-6 md:grid-cols-[1.1fr_0.9fr]">
        <section className="border-2 border-neutral bg-base-100 p-8 shadow-[4px_4px_0_#0a0a0a]">
          <p className="eyebrow">
            PracticePal
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-base-content">
            Sign in to PracticePal.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-base-content/75">
            Backend MVP uses Supabase email magic links so every book, session, setlist, and stat is
            scoped to a real user from the start.
          </p>
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <form action={sendMagicLinkAction} className="space-y-4 border-2 border-neutral bg-base-200 p-5">
              <div>
                <h2 className="text-lg font-semibold text-base-content">Magic link</h2>
                <p className="mt-2 text-sm leading-6 text-base-content/70">
                  Primary sign-in flow for real usage and deployment.
                </p>
              </div>
              <Field label="Email">
                <TextInput
                  required
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                />
              </Field>
              <button className="btn btn-primary w-full sm:w-auto" type="submit">
                Send magic link
              </button>
            </form>

            {isDevPasswordLoginEnabled ? (
              <div className="space-y-4 border-2 border-neutral bg-base-200 p-5">
                <div>
                  <h2 className="text-lg font-semibold text-base-content">Dev password fallback</h2>
                  <p className="mt-2 text-sm leading-6 text-base-content/70">
                    Enabled only because `ENABLE_DEV_PASSWORD_LOGIN=true`. Use this for local testing when
                    Supabase rate-limits email delivery.
                  </p>
                </div>

                <form action={signInWithPasswordAction} className="space-y-3">
                  <Field label="Email">
                    <TextInput required type="email" name="email" />
                  </Field>
                  <Field label="Password">
                    <TextInput required type="password" name="password" />
                  </Field>
                  <button className="btn btn-secondary w-full sm:w-auto" type="submit">
                    Sign in with password
                  </button>
                </form>

                <div className="divider my-1">or</div>

                <form action={signUpWithPasswordAction} className="space-y-3">
                  <Field label="Email">
                    <TextInput required type="email" name="email" />
                  </Field>
                  <Field label="Password">
                    <TextInput required type="password" name="password" />
                  </Field>
                  <button className="btn btn-outline w-full sm:w-auto" type="submit">
                    Create dev password account
                  </button>
                </form>
              </div>
            ) : null}
          </div>
          {params.success ? (
            <p className="mt-4 border-2 border-success bg-success/10 px-4 py-3 text-sm font-medium text-base-content">
              {params.success}
            </p>
          ) : null}
          {params.error ? (
            <p className="mt-4 border-2 border-error bg-error/10 px-4 py-3 text-sm font-medium text-base-content">
              {params.error}
            </p>
          ) : null}
          {!auth.isConfigured ? (
            <p className="mt-4 border-2 border-warning bg-warning/10 px-4 py-3 text-sm font-medium text-base-content">
              Supabase env vars are not configured yet. Add them to `.env.local` to test auth.
            </p>
          ) : null}
          {auth.isConfigured && !isDevPasswordLoginEnabled ? (
            <p className="mt-4 border-2 border-base-300 bg-base-200 px-4 py-3 text-sm font-medium text-base-content/75">
              If Supabase email rate limits block testing, set `ENABLE_DEV_PASSWORD_LOGIN=true` locally to
              expose a temporary password fallback on this page.
            </p>
          ) : null}
        </section>
        <aside className="border-2 border-neutral bg-base-100 p-8 shadow-[3px_3px_0_#0a0a0a]">
          <h2 className="text-lg font-bold text-base-content">What this unlocks</h2>
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

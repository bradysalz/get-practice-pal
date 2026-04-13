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
    <main className="mx-auto flex min-h-screen max-w-2xl items-center px-4 py-10 md:px-6">
      <section className="w-full border-2 border-neutral bg-base-100 p-8 shadow-[4px_4px_0_#0a0a0a] md:p-10">
        <p className="eyebrow">PracticePal</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-base-content">Sign in</h1>
        <form action={sendMagicLinkAction} className="mt-8 space-y-4">
          <Field label="Email">
            <TextInput required type="email" name="email" placeholder="you@example.com" />
          </Field>
          <div className="pt-2">
            <button className="btn btn-primary w-full sm:w-auto" type="submit">
              Send magic link
            </button>
          </div>
        </form>

        {isDevPasswordLoginEnabled ? (
          <div className="mt-8 border-t-2 border-base-300 pt-6">
            <div className="grid gap-5 md:grid-cols-2">
              <form action={signInWithPasswordAction} className="space-y-3">
                <h2 className="text-lg font-semibold text-base-content">Password sign in</h2>
                <Field label="Email">
                  <TextInput required type="email" name="email" />
                </Field>
                <Field label="Password">
                  <TextInput required type="password" name="password" />
                </Field>
                <div className="pt-2">
                  <button className="btn btn-primary w-full sm:w-auto" type="submit">
                    Sign in
                  </button>
                </div>
              </form>

              <form action={signUpWithPasswordAction} className="space-y-3">
                <h2 className="text-lg font-semibold text-base-content">Create dev account</h2>
                <Field label="Email">
                  <TextInput required type="email" name="email" />
                </Field>
                <Field label="Password">
                  <TextInput required type="password" name="password" />
                </Field>
                <div className="pt-2">
                  <button className="btn btn-outline w-full sm:w-auto" type="submit">
                    Create account
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}

        <div className="mt-6 space-y-3">
          {params.success ? (
            <p className="border-2 border-success bg-success/10 px-4 py-3 text-sm font-medium text-base-content">
              {params.success}
            </p>
          ) : null}
          {params.error ? (
            <p className="border-2 border-error bg-error/10 px-4 py-3 text-sm font-medium text-base-content">
              {params.error}
            </p>
          ) : null}
          {!auth.isConfigured ? (
            <p className="border-2 border-warning bg-warning/10 px-4 py-3 text-sm font-medium text-base-content">
              Supabase env vars are not configured yet. Add them to `.env.local` to test auth.
            </p>
          ) : null}
          {auth.isConfigured && !isDevPasswordLoginEnabled ? (
            <p className="border-2 border-base-300 bg-base-200 px-4 py-3 text-sm font-medium text-base-content/75">
              For local rate-limit issues, set `ENABLE_DEV_PASSWORD_LOGIN=true`.
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}

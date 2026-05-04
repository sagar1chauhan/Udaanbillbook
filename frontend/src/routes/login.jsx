import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell } from "@/components/AuthShell";
import { LoginForm } from "@/modules/auth/LoginForm";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Udaan" },
      { name: "description", content: "Sign in to Udaan with your mobile number to manage billing, GST and inventory." },
    ],
  }),
  component: Login,
});

function Login() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in with your registered mobile number to continue."
      footer={
        <>
          New to Udaan?{" "}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm />

      <p className="mt-6 text-center text-xs text-muted-foreground">
        By continuing you agree to our{" "}
        <a className="underline">Terms</a> and{" "}
        <a className="underline">Privacy Policy</a>.
      </p>
    </AuthShell>
  );
}

import React from "react";
import { Link } from "react-router-dom";
import { AuthShell } from "@/components/AuthShell";
import { LoginForm } from "@/modules/auth/LoginForm";

export default function Login() {
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
        <a className="underline cursor-pointer">Terms</a> and{" "}
        <a className="underline cursor-pointer">Privacy Policy</a>.
      </p>
    </AuthShell>
  );
}

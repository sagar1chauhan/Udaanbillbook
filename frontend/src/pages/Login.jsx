import React from "react";
import { Link } from "react-router-dom";
import { AuthShell } from "@/components/AuthShell";
import { LoginForm } from "@/modules/auth/LoginForm";

export default function Login({ role }) {
  const isAdmin = role === "admin";
  return (
    <AuthShell
      title={isAdmin ? "Admin Login" : "Staff / User Login"}
      subtitle={isAdmin ? "Sign in as Admin to manage business settings and full operations." : "Sign in to handle billing and inventory workflows."}
      footer={
        <>
          New to Udaan?{" "}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm role={role} />

      <p className="mt-6 text-center text-xs text-muted-foreground">
        By continuing you agree to our{" "}
        <a className="underline cursor-pointer">Terms</a> and{" "}
        <a className="underline cursor-pointer">Privacy Policy</a>.
      </p>
    </AuthShell>
  );
}

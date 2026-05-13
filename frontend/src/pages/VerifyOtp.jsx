import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { mockAuth } from "@/lib/auth-store";

export default function VerifyOtp() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const search = {
    phone: searchParams.get("phone") || "",
    mode: searchParams.get("mode") || "login",
    name: searchParams.get("name") || undefined,
    business: searchParams.get("business") || undefined,
    email: searchParams.get("email") || undefined,
  };

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [resend, setResend] = useState(30);
  const refs = useRef([]);

  useEffect(() => {
    if (resend <= 0) return;
    const t = setTimeout(() => setResend((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resend]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const setDigit = (i, val) => {
    const v = val.replace(/\D/g, "").slice(-1);
    setDigits((d) => {
      const n = [...d];
      n[i] = v;
      return n;
    });
    if (v && i < 5) refs.current[i + 1]?.focus();
  };

  const onKey = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const onPaste = (e) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length === 6) {
      e.preventDefault();
      setDigits(text.split(""));
      refs.current[5]?.focus();
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const code = digits.join("");
    if (code.length !== 6) return toast.error("Enter all 6 digits");

    // Mock — assign role based on phone number for testing or if it's a new registration
    const isSuperAdmin = search.phone === "1234567890";
    const isAdminUser = search.phone === "9999999999" || search.phone === "9876543210" || search.mode === "register";
    
    const role = isSuperAdmin ? "SuperAdmin" : isAdminUser ? "Admin" : "Staff";
    
    mockAuth.signIn({
      name: isSuperAdmin ? "Platform Owner" : search.name || (isAdminUser ? "Admin User" : "Staff User"),
      business: isSuperAdmin ? "Udaan Platform" : search.business || "Sharma Traders",
      phone: search.phone,
      email: isSuperAdmin ? "superadmin@udaan.com" : search.email,
      role: role,
    });
    toast.success(isSuperAdmin ? "SuperAdmin access granted!" : search.mode === "register" ? "Account created!" : "Signed in successfully");
    navigate(isSuperAdmin ? "/superadmin" : "/");
  };

  const masked =
    search.phone.length === 10
      ? `+91 ${search.phone.slice(0, 2)}xxxx${search.phone.slice(-4)}`
      : "your mobile";

  return (
    <AuthShell
      title="Verify your number"
      subtitle={`We sent a 6-digit code to ${masked}.`}
      footer={
        <>
          Wrong number?{" "}
          <Link
            to={search.mode === "register" ? "/register" : "/login"}
            className="font-semibold text-primary hover:underline"
          >
            Go back
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="flex justify-between gap-2 sm:gap-3" onPaste={onPaste}>
          {digits.map((d, i) => (
            <Input
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => onKey(i, e)}
              className="h-14 w-12 rounded-xl text-center text-xl font-bold sm:h-16 sm:w-14 sm:text-2xl"
            />
          ))}
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-success" />
            Demo mode — any 6 digits work
          </span>
          {resend > 0 ? (
            <span className="text-muted-foreground">Resend in {resend}s</span>
          ) : (
            <button
              type="button"
              className="font-semibold text-primary hover:underline"
              onClick={() => {
                setResend(30);
                toast.success("OTP resent");
              }}
            >
              Resend OTP
            </button>
          )}
        </div>

        <Button type="submit" className="h-12 w-full rounded-xl text-base">
          Verify & continue <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </form>
    </AuthShell>
  );
}

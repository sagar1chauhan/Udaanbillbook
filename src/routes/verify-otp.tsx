import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { mockAuth } from "@/lib/auth-store";

type Search = {
  phone: string;
  mode?: "login" | "register";
  name?: string;
  business?: string;
  email?: string;
};

export const Route = createFileRoute("/verify-otp")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    phone: String(s.phone ?? ""),
    mode: (s.mode as "login" | "register") ?? "login",
    name: s.name ? String(s.name) : undefined,
    business: s.business ? String(s.business) : undefined,
    email: s.email ? String(s.email) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Verify OTP — LedgerLite" },
      { name: "description", content: "Verify the 6-digit OTP sent to your mobile to access LedgerLite." },
    ],
  }),
  component: VerifyOtp,
});

function VerifyOtp() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [resend, setResend] = useState(30);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resend <= 0) return;
    const t = setTimeout(() => setResend((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resend]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const setDigit = (i: number, val: string) => {
    const v = val.replace(/\D/g, "").slice(-1);
    setDigits((d) => {
      const n = [...d];
      n[i] = v;
      return n;
    });
    if (v && i < 5) refs.current[i + 1]?.focus();
  };

  const onKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length === 6) {
      e.preventDefault();
      setDigits(text.split(""));
      refs.current[5]?.focus();
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join("");
    if (code.length !== 6) return toast.error("Enter all 6 digits");

    // Mock — accept any 6-digit code
    mockAuth.signIn({
      name: search.name || "Rahul Kumar",
      business: search.business || "Sharma Traders",
      phone: search.phone,
      email: search.email,
    });
    toast.success(search.mode === "register" ? "Account created!" : "Signed in successfully");
    navigate({ to: "/" });
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

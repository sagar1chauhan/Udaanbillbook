import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Phone } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — LedgerLite" },
      { name: "description", content: "Sign in to LedgerLite with your mobile number to manage billing, GST and inventory." },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = phone.replace(/\D/g, "");
    if (clean.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      toast.success("OTP sent to +91 " + clean);
      navigate({ to: "/verify-otp", search: { phone: clean, mode: "login" } });
    }, 600);
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in with your registered mobile number to continue."
      footer={
        <>
          New to LedgerLite?{" "}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="phone">Mobile number</Label>
          <div className="flex items-stretch gap-2">
            <div className="flex items-center gap-1 rounded-xl border bg-secondary px-3 text-sm font-semibold">
              <Phone className="h-4 w-4 text-muted-foreground" />
              +91
            </div>
            <Input
              id="phone"
              inputMode="numeric"
              maxLength={10}
              placeholder="98xxxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              className="h-12 flex-1 rounded-xl text-base"
              autoFocus
            />
          </div>
          <p className="text-xs text-muted-foreground">We'll send a 6-digit OTP to verify.</p>
        </div>

        <Button type="submit" disabled={loading} className="h-12 w-full rounded-xl text-base">
          {loading ? "Sending OTP…" : <>Send OTP <ArrowRight className="ml-1 h-4 w-4" /></>}
        </Button>

        <div className="relative my-2 text-center">
          <span className="relative z-10 bg-background px-3 text-xs uppercase tracking-wider text-muted-foreground">
            Demo
          </span>
          <span className="absolute left-0 top-1/2 h-px w-full bg-border" />
        </div>

        <Button
          type="button"
          variant="outline"
          className="h-12 w-full rounded-xl text-base"
          onClick={() => {
            setPhone("9876543210");
            toast.message("Demo number filled — tap Send OTP");
          }}
        >
          Use demo account
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        By continuing you agree to our{" "}
        <a className="underline">Terms</a> and{" "}
        <a className="underline">Privacy Policy</a>.
      </p>
    </AuthShell>
  );
}

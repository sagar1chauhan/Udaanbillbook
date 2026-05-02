import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ArrowRight, Phone } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create your account — LedgerLite" },
      { name: "description", content: "Start your free LedgerLite account in 30 seconds — billing, GST and inventory." },
    ],
  }),
  component: Register,
});

const businessTypes = [
  "Retail Shop",
  "Wholesale / Distribution",
  "Manufacturing",
  "Services",
  "Restaurant / Cafe",
  "Other",
];

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    business: "",
    type: "Retail Shop",
    phone: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = form.phone.replace(/\D/g, "");
    if (!form.name.trim()) return toast.error("Please enter your full name");
    if (!form.business.trim()) return toast.error("Please enter your business name");
    if (clean.length !== 10) return toast.error("Please enter a valid 10-digit mobile number");
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email))
      return toast.error("Please enter a valid email or leave it blank");

    setLoading(true);
    setTimeout(() => {
      toast.success("OTP sent to +91 " + clean);
      navigate({
        to: "/verify-otp",
        search: {
          phone: clean,
          mode: "register",
          name: form.name,
          business: form.business,
          email: form.email,
        },
      });
    }, 600);
  };

  return (
    <AuthShell
      title="Create your free account"
      subtitle="Set up your business in less than a minute."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Your name</Label>
            <Input
              id="name"
              placeholder="Rahul Kumar"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className="h-11 rounded-xl"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="business">Business name</Label>
            <Input
              id="business"
              placeholder="Sharma Traders"
              value={form.business}
              onChange={(e) => set("business", e.target.value)}
              className="h-11 rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Business type</Label>
          <Select value={form.type} onValueChange={(v) => set("type", v)}>
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {businessTypes.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
              value={form.phone}
              onChange={(e) => set("phone", e.target.value.replace(/\D/g, ""))}
              className="h-11 flex-1 rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email <span className="text-muted-foreground">(optional)</span></Label>
          <Input
            id="email"
            type="email"
            placeholder="you@business.com"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            className="h-11 rounded-xl"
          />
        </div>

        <Button type="submit" disabled={loading} className="h-12 w-full rounded-xl text-base">
          {loading ? "Sending OTP…" : <>Continue <ArrowRight className="ml-1 h-4 w-4" /></>}
        </Button>
      </form>
    </AuthShell>
  );
}

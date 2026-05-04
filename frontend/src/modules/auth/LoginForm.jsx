import React, { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Phone, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export function LoginForm() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = (e) => {
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
          Demo Options
        </span>
        <span className="absolute left-0 top-1/2 h-px w-full bg-border" />
      </div>

      <div className="grid grid-cols-2 gap-3">
         <Button
           type="button"
           variant="outline"
           className="h-12 rounded-xl text-xs gap-2"
           onClick={() => {
             setPhone("9876543210");
             toast.message("Demo Admin filled");
           }}
         >
           <ShieldCheck className="h-4 w-4 text-primary" /> Admin Demo
         </Button>
         <Button
           type="button"
           variant="outline"
           className="h-12 rounded-xl text-xs gap-2"
           onClick={() => {
             setPhone("9123456789");
             toast.message("Demo Staff filled");
           }}
         >
           <Phone className="h-4 w-4 text-muted-foreground" /> Staff Demo
         </Button>
      </div>
    </form>
  );
}

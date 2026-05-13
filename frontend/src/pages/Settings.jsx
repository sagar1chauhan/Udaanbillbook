import React from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useSubscription, PLANS } from "@/hooks/useSubscription";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export default function Settings() {
  const { currentPlan, isFree, planStatus } = useSubscription();
  const validUntil = new Date();
  validUntil.setFullYear(validUntil.getFullYear() + 1);

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Manage business profile and preferences" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="border-0 shadow-[var(--shadow-card)] lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Business Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="grid grid-cols-1 gap-4 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                toast.success("Profile updated");
              }}
            >
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Business Name</Label>
                <Input defaultValue="Sharma Traders" className="h-10 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label>GSTIN</Label>
                <Input defaultValue="07ABCDE1234F1Z5" className="h-10 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input defaultValue="+91 98765 43210" className="h-10 rounded-xl" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Address</Label>
                <Input defaultValue="Shop 14, MG Road, Pune 411001" className="h-10 rounded-xl" />
              </div>
              <div className="sm:col-span-2">
                <Button className="rounded-xl">Save Changes</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Subscription Card */}
        <Card className="border-0 shadow-[var(--shadow-card)] lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              Subscription & Billing
              <Badge variant={isFree ? "secondary" : "default"} className={!isFree ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                {currentPlan} Plan
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-border/50 bg-muted/20">
              <div className="space-y-1">
                <p className="font-semibold">Current Plan: {currentPlan}</p>
                {isFree ? (
                  <p className="text-sm text-muted-foreground">You are currently on the free tier. Upgrade to unlock more features.</p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Your {currentPlan} plan is active. Valid until: <span className="font-medium text-foreground">{validUntil.toLocaleDateString()}</span>
                  </p>
                )}
              </div>
              <Link to="/pricing">
                <Button variant={isFree ? "default" : "outline"} className="rounded-xl w-full md:w-auto">
                  {isFree ? "Upgrade Now" : "Manage Plan"}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-[var(--shadow-card)] lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Email notifications", desc: "Daily sales summary" },
              { label: "WhatsApp reminders", desc: "Auto follow-ups for pending dues" },
              { label: "Low-stock alerts", desc: "Notify when below minimum" },
              { label: "Dark mode", desc: "Reduce eye strain at night" },
            ].map((p, i) => (
              <div key={p.label}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{p.label}</p>
                    <p className="text-xs text-muted-foreground">{p.desc}</p>
                  </div>
                  <Switch defaultChecked={i < 2} />
                </div>
                {i < 3 && <Separator className="mt-4" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

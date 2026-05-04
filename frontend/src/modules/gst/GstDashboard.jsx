import React from "react";
import { 
  ShieldCheck, 
  FileText, 
  ArrowUpRight, 
  ArrowDownRight, 
  PieChart, 
  Info,
  Download,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/PageHeader";

const fmt = (n) => "₹" + n.toLocaleString("en-IN");

export function GstDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="GST & Taxation"
        subtitle="Track your GST liabilities, ITC and file reports easily."
        actions={
          <Button className="rounded-xl">
             Generate GSTR Summary
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
        <Card className="border-0 shadow-sm border-t-4 border-t-primary transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Output GST (Liability)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fmt(64250)}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Tax collected from sales</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm border-t-4 border-t-success transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Input Tax Credit (ITC)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{fmt(42100)}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Tax paid on purchases</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm border-t-4 border-t-accent transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Net GST Payable</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{fmt(22150)}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Payable to government</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-0 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PieChart className="h-4 w-4 text-primary" /> Tax Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between mb-2 text-sm">
                <span className="font-medium">IGST (Inter-state)</span>
                <span className="font-bold">{fmt(28400)}</span>
              </div>
              <Progress value={45} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2 text-sm">
                <span className="font-medium">CGST (Central)</span>
                <span className="font-bold">{fmt(17925)}</span>
              </div>
              <Progress value={30} className="h-2 [&>div]:bg-success" />
            </div>
            <div>
              <div className="flex justify-between mb-2 text-sm">
                <span className="font-medium">SGST (State)</span>
                <span className="font-bold">{fmt(17925)}</span>
              </div>
              <Progress value={30} className="h-2 [&>div]:bg-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <CardHeader>
             <CardTitle className="text-base flex items-center gap-2">
               <ShieldCheck className="h-4 w-4 text-success" /> Filing Status
             </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center gap-4 rounded-xl border p-4">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-success/10 text-success">
                   <CheckCircle2 className="h-6 w-6" />
                </div>
                <div className="flex-1">
                   <p className="text-sm font-bold">GSTR-1 (Sales)</p>
                   <p className="text-xs text-muted-foreground">Filed on 11 Apr 2024</p>
                </div>
                <Badge variant="success" className="rounded-full">Filed</Badge>
             </div>
             <div className="flex items-center gap-4 rounded-xl border p-4">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-accent/10 text-accent">
                   <AlertCircle className="h-6 w-6" />
                </div>
                <div className="flex-1">
                   <p className="text-sm font-bold">GSTR-3B (Monthly)</p>
                   <p className="text-xs text-muted-foreground">Due on 20 May 2024</p>
                </div>
                <Badge variant="secondary" className="rounded-full">Pending</Badge>
             </div>
             <div className="flex items-center gap-4 rounded-xl border p-4 bg-muted/30">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                   <Info className="h-6 w-6" />
                </div>
                <div className="flex-1">
                   <p className="text-sm font-bold">GSTIN Verified</p>
                   <p className="text-xs text-muted-foreground">27AAACR1234F1Z5</p>
                </div>
                <Button variant="link" size="sm" className="h-auto p-0 text-xs">Edit</Button>
             </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
         <CardHeader>
            <CardTitle className="text-base">GSTR Summary Reports</CardTitle>
            <CardDescription>Download auto-calculated GST reports for filing.</CardDescription>
         </CardHeader>
         <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
               {[
                 { name: "GSTR-1 Summary", period: "April 2024", type: "Sales" },
                 { name: "GSTR-2B Summary", period: "April 2024", type: "ITC" },
                 { name: "GSTR-3B Draft", period: "April 2024", type: "Summary" },
                 { name: "Annual Report", period: "FY 2023-24", type: "Yearly" }
               ].map((report, i) => (
                 <div key={i} className="flex flex-col gap-3 rounded-xl border p-4 hover:border-primary/50 transition-colors cursor-pointer group">
                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-secondary text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                       <FileText className="h-5 w-5" />
                    </div>
                    <div>
                       <p className="text-sm font-bold">{report.name}</p>
                       <p className="text-[11px] text-muted-foreground">{report.period}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="w-full text-xs h-8 rounded-lg mt-1 border">
                       <Download className="h-3.5 w-3.5 mr-1" /> Download JSON
                    </Button>
                 </div>
               ))}
            </div>
         </CardContent>
      </Card>
    </div>
  );
}

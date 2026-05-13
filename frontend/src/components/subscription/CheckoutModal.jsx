import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, CreditCard } from "lucide-react";
import { mockAuth, useMockAuth } from "@/lib/auth-store";
import { toast } from "sonner";
import { PLANS } from "@/hooks/useSubscription";

export function CheckoutModal({ isOpen, onClose, selectedPlan, planPrice }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { user } = useMockAuth();

  const handlePayment = () => {
    setIsProcessing(true);
    
    // Simulate payment gateway delay (e.g. Razorpay/Stripe)
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      
      // Update global user state with new subscription
      mockAuth.updateUser({
        subscription: {
          plan: selectedPlan,
          status: "active",
          validUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString() // 1 year from now
        }
      });
      
      toast.success(`Successfully upgraded to ${selectedPlan} Plan!`);
      
      // Auto close after success
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        // optionally refresh or reload to apply full UI changes
      }, 2000);

    }, 2000);
  };

  const handleCancel = () => {
    setIsProcessing(false);
    setIsSuccess(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-md">
        {!isSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Secure Checkout
              </DialogTitle>
              <DialogDescription>
                You are about to upgrade to the <strong>{selectedPlan} Plan</strong>.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <div className="flex justify-between items-center p-4 bg-muted/50 rounded-xl border border-border/50">
                <div className="flex flex-col">
                  <span className="font-semibold">{selectedPlan} Plan (Annual)</span>
                  <span className="text-xs text-muted-foreground">Billed yearly</span>
                </div>
                <div className="font-bold text-lg">
                  ₹{planPrice * 12}
                </div>
              </div>
              <div className="flex justify-between items-center px-4 text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{planPrice * 12}</span>
              </div>
              <div className="flex justify-between items-center px-4 text-sm">
                <span className="text-muted-foreground">GST (18%)</span>
                <span>₹{Math.round(planPrice * 12 * 0.18)}</span>
              </div>
              <div className="flex justify-between items-center px-4 font-semibold text-base border-t border-border pt-4">
                <span>Total Amount</span>
                <span>₹{Math.round(planPrice * 12 * 1.18)}</span>
              </div>
            </div>
            <DialogFooter className="sm:justify-between">
              <Button variant="ghost" onClick={handleCancel} disabled={isProcessing}>
                Cancel
              </Button>
              <Button onClick={handlePayment} disabled={isProcessing} className="w-full sm:w-auto gap-2">
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  `Pay ₹${Math.round(planPrice * 12 * 1.18)}`
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 animate-in zoom-in" />
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-foreground">Payment Successful!</h2>
              <p className="text-sm text-muted-foreground">
                Your account has been upgraded to the {selectedPlan} plan.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

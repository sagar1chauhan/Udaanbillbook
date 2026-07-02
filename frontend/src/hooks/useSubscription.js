import { useMockAuth } from "@/lib/auth-store";
import { useMemo } from "react";

export const PLANS = {
  FREE: "Free",
  SILVER: "Silver",
  GOLD: "Gold",
  ENTERPRISE: "Enterprise"
};

// Define what features are available in which plans
const FEATURE_ACCESS = {
  dashboard: [PLANS.FREE, PLANS.SILVER, PLANS.GOLD, PLANS.ENTERPRISE],
  billing: [PLANS.FREE, PLANS.SILVER, PLANS.GOLD, PLANS.ENTERPRISE],
  inventory: [PLANS.SILVER, PLANS.GOLD, PLANS.ENTERPRISE], // Basic inventory starts at Silver
  parties: [PLANS.FREE, PLANS.SILVER, PLANS.GOLD, PLANS.ENTERPRISE],
  expenses: [PLANS.SILVER, PLANS.GOLD, PLANS.ENTERPRISE],
  accounting: [PLANS.GOLD, PLANS.ENTERPRISE], // Advanced accounting in Gold+
  gst: [PLANS.GOLD, PLANS.ENTERPRISE], // GST in Gold+
  reports: [PLANS.SILVER, PLANS.GOLD, PLANS.ENTERPRISE], // Standard reports in Silver+
  admin: [PLANS.FREE, PLANS.SILVER, PLANS.GOLD, PLANS.ENTERPRISE], // Staff management in all plans
};

export function useSubscription() {
  const { user, hydrated } = useMockAuth();
  
  const isAdmin = user?.role?.toLowerCase() === "admin";
  
  // Default to Free plan if no subscription object exists
  const currentPlan = isAdmin ? "None" : (user?.subscription?.plan || PLANS.FREE);
  const planStatus = isAdmin ? "inactive" : (user?.subscription?.status || "active");

  const isFree = !isAdmin && currentPlan === PLANS.FREE;
  const isPremium = !isAdmin && currentPlan !== PLANS.FREE && planStatus === "active";

  const canAccessFeature = (featureName) => {
    if (isAdmin) return true; // Admins have bypass access to all features
    
    const allowedPlans = FEATURE_ACCESS[featureName.toLowerCase()];
    if (!allowedPlans) return true; // If feature isn't defined, allow access
    
    // If the user's plan is in the allowed plans, they can access it
    return allowedPlans.includes(currentPlan);
  };

  return {
    currentPlan,
    planStatus,
    isFree,
    isPremium,
    canAccessFeature,
    hydrated
  };
}

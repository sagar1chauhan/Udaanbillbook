// ===== MOCK DATA FOR SUPERADMIN PANEL =====

export const platformKPIs = {
  totalBusinesses: 2847,
  activeSubscriptions: 1923,
  monthlyRevenue: 1842500,
  platformGrowth: 18.4,
  activeUsers: 8412,
  pendingApprovals: 23,
  failedPayments: 7,
  supportTickets: 34,
};

export const revenueChartData = [
  { month: "Jan", revenue: 1245000, expenses: 340000 },
  { month: "Feb", revenue: 1380000, expenses: 360000 },
  { month: "Mar", revenue: 1520000, expenses: 390000 },
  { month: "Apr", revenue: 1410000, expenses: 370000 },
  { month: "May", revenue: 1680000, expenses: 420000 },
  { month: "Jun", revenue: 1842500, expenses: 450000 },
];

export const businessGrowthData = [
  { month: "Jan", businesses: 2120, users: 6200 },
  { month: "Feb", businesses: 2280, users: 6800 },
  { month: "Mar", businesses: 2450, users: 7200 },
  { month: "Apr", businesses: 2580, users: 7600 },
  { month: "May", businesses: 2710, users: 8000 },
  { month: "Jun", businesses: 2847, users: 8412 },
];

export const subscriptionDistribution = [
  { name: "Free", value: 924, fill: "#94a3b8" },
  { name: "Silver", value: 1102, fill: "#3b82f6" },
  { name: "Gold", value: 648, fill: "#f59e0b" },
  { name: "Enterprise", value: 173, fill: "#8b5cf6" },
];

export const dailySignups = [
  { day: "Mon", signups: 42 },
  { day: "Tue", signups: 38 },
  { day: "Wed", signups: 56 },
  { day: "Thu", signups: 44 },
  { day: "Fri", signups: 62 },
  { day: "Sat", signups: 28 },
  { day: "Sun", signups: 18 },
];

export const businesses = [
  { id: 1, name: "Sharma Traders", owner: "Rahul Sharma", phone: "+91 98765 43210", email: "rahul@sharmatraders.com", plan: "Gold", status: "Active", revenue: 284500, users: 5, created: "20 Jan 2024", lastActive: "2 min ago", city: "Pune", type: "Retail Shop" },
  { id: 2, name: "Patel Electronics", owner: "Amit Patel", phone: "+91 98765 67890", email: "amit@patelelectronics.com", plan: "Silver", status: "Active", revenue: 156200, users: 3, created: "12 Feb 2024", lastActive: "15 min ago", city: "Mumbai", type: "Electronics" },
  { id: 3, name: "Green Mart", owner: "Priya Singh", phone: "+91 98765 12345", email: "priya@greenmart.com", plan: "Enterprise", status: "Active", revenue: 492800, users: 12, created: "05 Mar 2024", lastActive: "1 hr ago", city: "Delhi", type: "Wholesale" },
  { id: 4, name: "Krishna Stores", owner: "Vikram Reddy", phone: "+91 98765 99999", email: "vikram@krishna.com", plan: "Free", status: "Active", revenue: 0, users: 1, created: "18 Apr 2024", lastActive: "3 hrs ago", city: "Hyderabad", type: "Retail Shop" },
  { id: 5, name: "Gupta & Sons", owner: "Suresh Gupta", phone: "+91 98765 11111", email: "suresh@guptasons.com", plan: "Gold", status: "Suspended", revenue: 178900, users: 4, created: "01 Jan 2024", lastActive: "5 days ago", city: "Jaipur", type: "Manufacturing" },
  { id: 6, name: "Quick Bites Cafe", owner: "Meera Nair", phone: "+91 98765 22222", email: "meera@quickbites.com", plan: "Silver", status: "Active", revenue: 92400, users: 2, created: "22 Mar 2024", lastActive: "30 min ago", city: "Bangalore", type: "Restaurant" },
  { id: 7, name: "Royal Fabrics", owner: "Deepak Joshi", phone: "+91 98765 33333", email: "deepak@royalfabrics.com", plan: "Gold", status: "Active", revenue: 345600, users: 6, created: "10 Feb 2024", lastActive: "45 min ago", city: "Surat", type: "Wholesale" },
  { id: 8, name: "Fresh Farm Dairy", owner: "Anita Desai", phone: "+91 98765 44444", email: "anita@freshfarm.com", plan: "Free", status: "Trial", revenue: 0, users: 1, created: "08 May 2024", lastActive: "1 day ago", city: "Ahmedabad", type: "Services" },
];

export const transactions = [
  { id: "TXN-2024-001", business: "Sharma Traders", amount: 2988, status: "Success", method: "UPI", date: "Today, 2:30 PM", plan: "Gold" },
  { id: "TXN-2024-002", business: "Green Mart", amount: 5988, status: "Success", method: "Card", date: "Today, 11:15 AM", plan: "Enterprise" },
  { id: "TXN-2024-003", business: "Patel Electronics", amount: 2388, status: "Success", method: "NetBanking", date: "Yesterday", plan: "Silver" },
  { id: "TXN-2024-004", business: "Quick Bites Cafe", amount: 2388, status: "Failed", method: "UPI", date: "Yesterday", plan: "Silver" },
  { id: "TXN-2024-005", business: "Royal Fabrics", amount: 2988, status: "Success", method: "Card", date: "2 days ago", plan: "Gold" },
  { id: "TXN-2024-006", business: "Gupta & Sons", amount: 2988, status: "Refunded", method: "Card", date: "3 days ago", plan: "Gold" },
];

export const recentActivities = [
  { action: "New Business Registered", detail: "Fresh Farm Dairy — Ahmedabad", time: "2 min ago", type: "business" },
  { action: "Subscription Upgraded", detail: "Sharma Traders: Silver → Gold", time: "15 min ago", type: "subscription" },
  { action: "Payment Failed", detail: "Quick Bites Cafe — ₹2,388", time: "1 hr ago", type: "payment" },
  { action: "Business Suspended", detail: "Gupta & Sons — Policy Violation", time: "3 hrs ago", type: "security" },
  { action: "Support Ticket Opened", detail: "#TKT-892 — Invoice generation issue", time: "5 hrs ago", type: "support" },
  { action: "New Business Registered", detail: "Krishna Stores — Hyderabad", time: "8 hrs ago", type: "business" },
];

export const securityLogs = [
  { id: 1, event: "Failed Login Attempt", ip: "192.168.1.45", user: "unknown@test.com", device: "Chrome / Windows", time: "5 min ago", severity: "warning" },
  { id: 2, event: "Suspicious Activity Detected", ip: "103.24.56.78", user: "vikram@krishna.com", device: "Mobile / Android", time: "1 hr ago", severity: "critical" },
  { id: 3, event: "Multiple Login Locations", ip: "45.12.89.101", user: "rahul@sharmatraders.com", device: "Safari / macOS", time: "2 hrs ago", severity: "warning" },
  { id: 4, event: "Admin Permission Changed", ip: "10.0.0.1", user: "superadmin@udaan.com", device: "Chrome / Windows", time: "4 hrs ago", severity: "info" },
  { id: 5, event: "API Rate Limit Exceeded", ip: "203.45.67.89", user: "api-bot", device: "API Client", time: "6 hrs ago", severity: "critical" },
];

export const subscriptionPlans = [
  { id: 1, name: "Free", price: 0, interval: "forever", activeSubscribers: 924, monthlyRevenue: 0, features: ["50 invoices/month", "Basic inventory", "1 user", "Udaan branding"], status: "Active" },
  { id: 2, name: "Silver", price: 199, interval: "month", activeSubscribers: 1102, monthlyRevenue: 219298, features: ["Unlimited invoices", "Advanced inventory", "3 users", "No branding", "Basic GST", "Company Logo"], status: "Active" },
  { id: 3, name: "Gold", price: 299, interval: "month", activeSubscribers: 648, monthlyRevenue: 193752, features: ["Everything in Silver", "Unlimited users", "E-way bills", "Advanced GST", "Staff management", "Company Logo"], status: "Active", popular: true },
  { id: 4, name: "Enterprise", price: 499, interval: "month", activeSubscribers: 173, monthlyRevenue: 86327, features: ["Everything in Gold", "Custom themes", "Priority support", "Barcode gen", "API access", "Company Logo"], status: "Active" },
];

export const fmt = (n) => "₹" + n.toLocaleString("en-IN");

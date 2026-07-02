import React, { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/api";

const InvoiceContext = createContext();

export function InvoiceProvider({ children }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchInvoices = async () => {
    const authData = localStorage.getItem('Udaan.auth');
    if (!authData) return;
    setLoading(true);
    try {
      const res = await api.get("/invoices");
      // Normalize invoices from backend
      const normalized = (res.data || []).map(inv => ({
        id: inv.invoiceNumber || `INV-${inv._id.substring(18).toUpperCase()}`,
        party: inv.partyName || (inv.party && inv.party.name) || "Walk-in Customer",
        date: new Date(inv.date).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' }),
        amount: inv.grandTotal || 0,
        status: inv.status || "Unpaid",
        type: inv.type || "Sale"
      }));
      setInvoices(normalized);
    } catch (err) {
      console.error("Failed to fetch invoices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const refreshInvoices = () => {
    fetchInvoices();
  };

  const addInvoice = (invoice) => {
    refreshInvoices();
  };

  return (
    <InvoiceContext.Provider value={{ invoices, loading, refreshInvoices, addInvoice }}>
      {children}
    </InvoiceContext.Provider>
  );
}

export function useInvoices() {
  return useContext(InvoiceContext);
}

import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../lib/api";
import { toast } from "sonner";
import { useMockAuth } from "../lib/auth-store";

const InvoiceContext = createContext();

export function InvoiceProvider({ children }) {
  const [invoices, setInvoices] = useState([]);
  const { hydrated, isAuthenticated } = useMockAuth();

  const fetchInvoices = async () => {
    try {
      const res = await api.get('/invoices');
      setInvoices(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load invoices");
    }
  };

  useEffect(() => {
    if (hydrated && isAuthenticated) {
      fetchInvoices();
    } else if (hydrated && !isAuthenticated) {
      setInvoices([]);
    }
  }, [hydrated, isAuthenticated]);

  const addInvoice = async (invoiceData) => {
    try {
      const res = await api.post('/invoices', invoiceData);
      setInvoices((prev) => [res.data, ...prev]);
      return res.data;
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create invoice");
      throw err;
    }
  };

  return (
    <InvoiceContext.Provider value={{ invoices, addInvoice, fetchInvoices }}>
      {children}
    </InvoiceContext.Provider>
  );
}

export function useInvoices() {
  return useContext(InvoiceContext);
}

import React, { createContext, useContext, useState } from "react";

const INITIAL_INVOICES = [
  { id: "INV-2041", party: "Anil Sweets", date: "28 Apr 2026", amount: 24500, status: "Unpaid", type: "Sale" },
  { id: "INV-2040", party: "Sharma Kirana", date: "27 Apr 2026", amount: 12800, status: "Partial", type: "Sale" },
  { id: "PUR-1001", party: "S.K. Traders", date: "26 Apr 2026", amount: 8400, status: "Paid", type: "Purchase" },
  { id: "INV-2038", party: "Patel Stores", date: "25 Apr 2026", amount: 36200, status: "Unpaid", type: "Sale" },
  { id: "PUR-1002", party: "Global Fabrics", date: "24 Apr 2026", amount: 18900, status: "Paid", type: "Purchase" },
];

const InvoiceContext = createContext();

export function InvoiceProvider({ children }) {
  const [invoices, setInvoices] = useState(INITIAL_INVOICES);

  const addInvoice = (invoice) => {
    setInvoices((prev) => [invoice, ...prev]);
  };

  return (
    <InvoiceContext.Provider value={{ invoices, addInvoice }}>
      {children}
    </InvoiceContext.Provider>
  );
}

export function useInvoices() {
  return useContext(InvoiceContext);
}

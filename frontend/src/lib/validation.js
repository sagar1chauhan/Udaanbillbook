// UTR Number: 12-22 alphanumeric characters (bank UTR references)
export const validateUtr = (utr) => {
  const trimmed = (utr || "").trim();
  if (!trimmed) return false;
  const regex = /^[A-Za-z0-9]{12,22}$/;
  return regex.test(trimmed);
};

// UPI ID format: name@bankcode (e.g. harsh@paytm, 9876543210@upi)
// OR a numeric Transaction ID (12-30 digit number)
export const validateUpi = (upi) => {
  const trimmed = (upi || "").trim();
  if (!trimmed) return false;
  // Accept UPI ID format
  const upiRegex = /^[a-zA-Z0-9._-]{2,30}@[a-zA-Z0-9.-]{2,15}$/;
  if (upiRegex.test(trimmed)) return true;
  // Accept numeric transaction ID (12-30 digits)
  const txnIdRegex = /^[0-9]{12,30}$/;
  if (txnIdRegex.test(trimmed)) return true;
  return false;
};

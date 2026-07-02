export const validateUtr = (utr) => {
  const trimmed = (utr || "").trim();
  const regex = /^[A-Za-z0-9]{12,22}$/;
  return regex.test(trimmed);
};

export const validateUpi = (upi) => {
  const trimmed = (upi || "").trim();
  const regex = /^[a-zA-Z0-9._-]{2,30}@[a-zA-Z0-9.-]{2,15}$/;
  return regex.test(trimmed);
};

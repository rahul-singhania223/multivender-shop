import crypto from "crypto";

const generateOtp = (): number => {
  return crypto.randomInt(100000, 999999);
};

export { generateOtp };

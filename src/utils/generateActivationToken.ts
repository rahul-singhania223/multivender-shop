import jwt from "jsonwebtoken";
import { IUserBody } from "../../interfaces";

const generateActivationToken = (otp: number, userData: IUserBody): string => {
  return jwt.sign(
    { otp, userData },
    process.env.ACTIVATION_TOKEN_SECRET as string,
    { expiresIn: "5m" }
  );
};

export { generateActivationToken };

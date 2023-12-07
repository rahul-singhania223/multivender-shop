import { JwtPayload } from "jsonwebtoken";

export interface IUserBody {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  isVendor: boolean;
}

export interface IJWTBody extends JwtPayload {
  userData: IUserBody;
  otp: number;
}

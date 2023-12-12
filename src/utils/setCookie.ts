import { Response } from "express";

// set cookie
const setCookie = (
  name: string,
  value: string,
  expires: number, // expire in minutes
  res: Response
) => {
  res.cookie(name, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" ? true : false,
    expires: new Date(parseInt(new Date().toString()) + 1000 * 60 * expires),
    maxAge: 1000 * 60 * expires,
  });
};

export { setCookie };

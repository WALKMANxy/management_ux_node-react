//src/models/types.ts
import { Request } from "express";
import jwt from "jsonwebtoken";
import { IUser } from "./User";

export interface CustomUser {
  id: IUser["_id"];
  email: IUser["email"];
  role: IUser["role"];
  entityCode: IUser["entityCode"];
  entityRole: IUser["role"];
}

export interface AuthenticatedRequest extends Request {
  user?: Partial<IUser>;
  ipInfo?: IpInfo;
}

export interface UserRequest extends Request {
  user: IUser;
}

export type IpInfo = {
  ip: string;
  country: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  [key: string]: any;
};

export type GoogleUserInfo = {
  id: string;
  email: string;
  name: string;
  picture: string;
};

export interface DecodedToken extends jwt.JwtPayload {
  id: string;
  authType: "email" | "google";
}

import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/config";
import { IUser, User } from "../models/User";
import { AuthenticatedRequest } from "../models/types";

const JWT_SECRET = config.jwtSecret || "";

export const generateToken = (user: IUser) => {
  return jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });
};

export const authenticateUser = async (
  req: AuthenticatedRequest,  // Use AuthenticatedRequest here
  res: Response,
  next: NextFunction
) => {
  const token =
    req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");
 // console.log("Authenticate user: token is", token);
  if (!token) {
    console.log("Token is not provided, authorization denied");
    return res
      .status(401)
      .json({ message: "No token provided, authorization denied" });
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
   // console.log("Authenticate user: decoded is", decoded);
    const user = await User.findById(decoded.id);
   // console.log("Authenticate user: user is", user);
    if (!user) {
      console.log("Invalid token, authorization denied");
      return res
        .status(401)
        .json({ message: "Invalid token, authorization denied" });
    }
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      entityCode: user.entityCode,
    };
    //console.log("Authenticate user: user is authenticated", req.user);
    next();
  } catch (error) {
    console.log("Token is not valid, authorization denied:", error);
    res.status(401).json({ message: "Token is not valid" });
  }
};

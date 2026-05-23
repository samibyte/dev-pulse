import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../db";
import type { ROLES } from "../types";
import sendResponse from "../utils/sendResponse";

const auth = (...roles: ROLES[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization;

      if (!token) {
        sendResponse(res, {
          statusCode: 401,
          success: false,
          message: "Unauthorized access!",
        });
      }

      const decoded = jwt.verify(
        token as string,
        config.jwt_access_secret as string,
      ) as JwtPayload;

      const userData = await pool.query(
        `
          SELECT * FROM users WHERE email=$1   
        `,
        [decoded.email],
      );

      const user = userData.rows[0];

      if (userData.rows.length === 0) {
        sendResponse(res, {
          statusCode: 401,
          success: false,
          message: "Unauthorized access!",
        });
      }

      // if (roles.length && !roles.includes(user.role)) {
      //   res.status(403).json({
      //     success: false,
      //     message: "Forbidden!!,This role have no access!",
      //   });
      // }

      req.user = decoded;

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;

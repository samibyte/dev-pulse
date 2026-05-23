import bcrypt from "bcryptjs";
import { pool } from "../../db/index";
import type { IUser } from "./auth.interface";
import jwt from "jsonwebtoken";
import config from "../../config";
import ApiError from "../../errors/ApiError";

const createUserInDB = async (payload: IUser) => {
  const { name, email, password, role } = payload;

  if (!name || !email || !password) {
    throw ApiError.badRequest("Name, email, and password are required");
  }

  const hashPassword = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      `
       INSERT INTO users(name,email,password,role) VALUES($1,$2,$3,COALESCE($4,'contributor')) RETURNING *
      `,
      [name, email, hashPassword, role],
    );

    delete result.rows[0].password;

    return result;
  } catch (error: any) {
    if (error?.code === "23505") {
      throw ApiError.conflict("Email already exists");
    }
    throw error;
  }
};

const loginUserInDB = async (payload: { email: string; password: string }) => {
  const { email, password } = payload;

  if (!email || !password) {
    throw ApiError.badRequest("Email and password are required");
  }

  const userData = await pool.query(
    `
    SELECT * FROM users WHERE email=$1
    `,
    [email],
  );
  if (userData.rows.length === 0) {
    throw ApiError.unauthorized("Invalid credentials");
  }

  const user = userData.rows[0];
  const matchPassword = await bcrypt.compare(password, user.password);

  if (!matchPassword) {
    throw ApiError.unauthorized("Invalid credentials");
  }

  const jwtPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };

  const accessToken = jwt.sign(jwtPayload, config.jwt_access_secret as string, {
    expiresIn: "1d",
  });

  const refreshToken = jwt.sign(
    jwtPayload,
    config.jwt_refresh_secret as string,
    {
      expiresIn: "15d",
    },
  );

  delete user.password;

  return { accessToken, refreshToken, user };
};

export const authService = {
  createUserInDB,
  loginUserInDB,
};

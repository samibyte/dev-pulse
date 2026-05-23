import type { Request, Response } from "express";
import { authService } from "./auth.service";
import sendResponse from "../../utils/sendResponse";

const registerUser = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: "Name, email, and password are required",
    });
  }

  try {
    const result = await authService.createUserInDB(req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: error?.statusCode ?? 500,
      success: false,
      message: error?.message ?? "Something went wrong",
      error,
    });
  }
};

const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: "Email and password are required",
    });
  }

  try {
    const result = await authService.loginUserInDB(req.body);

    const { refreshToken } = result;

    res.cookie("refreshToken", refreshToken, {
      secure: true,
      httpOnly: true,
      sameSite: "lax",
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Login successful",
      data: { token: result.accessToken, user: result.user },
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: error?.statusCode ?? 500,
      success: false,
      message: error?.message ?? "Something went wrong",
      error,
    });
  }
};

export const authController = { registerUser, loginUser };

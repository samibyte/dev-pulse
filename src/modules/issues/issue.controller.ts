import type { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { issueService } from "./issue.service";
import type { JwtPayload } from "jsonwebtoken";

const createIssue = async (req: Request, res: Response) => {
  const user = req.user as JwtPayload & { id: number };

  if (!user?.id) {
    return sendResponse(res, {
      statusCode: 401,
      success: false,
      message: "Unauthorized",
    });
  }

  try {
    const result = await issueService.createIssueInDB(req.body, user.id);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully",
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

export const issueController = { createIssue };

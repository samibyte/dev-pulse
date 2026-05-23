import type { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { issueService } from "./issue.service";
import type { JwtPayload } from "jsonwebtoken";
// using generic record for query parsing

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

const getAllIssues = async (req: Request, res: Response) => {
  try {
    const query = req.query as Record<string, unknown>;

    const sort = typeof query.sort === "string" ? query.sort : undefined;
    const type = typeof query.type === "string" ? query.type : undefined;
    const status = typeof query.status === "string" ? query.status : undefined;

    const allowedSort = ["newest", "oldest"];
    const allowedType = ["bug", "feature_request"];
    const allowedStatus = ["open", "in_progress", "resolved"];

    if (sort && !allowedSort.includes(sort)) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "Invalid sort value",
      });
    }

    if (type && !allowedType.includes(type)) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "Invalid type value",
      });
    }

    if (status && !allowedStatus.includes(status)) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "Invalid status value",
      });
    }

    const issues = await issueService.getAllIssuesFromDB({
      sort,
      type,
      status,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issues retrived successfully",
      data: issues,
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

const getSingleIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const issueId = parseInt(id, 10);

    if (isNaN(issueId)) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "Invalid issue ID",
      });
    }

    const issue = await issueService.getSingleIssueFromDB(issueId);

    if (!issue) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found",
      });
    }

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue retrived successfully",
      data: issue,
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

export const issueController = { createIssue, getAllIssues, getSingleIssue };

import type { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { issueService } from "./issue.service";
import { pool } from "../../db/index";
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

    // Validate that id exists and is a valid number
    if (!id || isNaN(Number(id))) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "Invalid issue ID",
      });
    }

    const issue = await issueService.getSingleIssueFromDB(Number(id));

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

const updateIssue = async (req: Request, res: Response) => {
  const user = req.user as JwtPayload & { id: number; role: string };

  if (!user?.id) {
    return sendResponse(res, {
      statusCode: 401,
      success: false,
      message: "Unauthorized",
    });
  }

  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "Invalid issue ID",
      });
    }

    const issueId = Number(id);

    // Get the current issue to check permissions
    const issueRes = await pool.query(`SELECT * FROM issues WHERE id = $1`, [
      issueId,
    ]);

    const currentIssue = issueRes.rows[0];

    if (!currentIssue) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found",
      });
    }

    // Check access control
    // Maintainer can update any issue, Contributor can only update own issue if status is open
    const isMaintainer = user.role === "maintainer";
    const isReporter = user.id === currentIssue.reporter_id;
    const isOpen = currentIssue.status === "open";

    if (!isMaintainer && !(isReporter && isOpen)) {
      return sendResponse(res, {
        statusCode: 403,
        success: false,
        message: "Forbidden",
      });
    }

    // Validate input fields
    const { title, description, type } = req.body;
    const allowedTypes = ["bug", "feature_request"];

    if (type && !allowedTypes.includes(type)) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "Invalid issue type",
      });
    }

    if (description && description.length < 20) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "Description must be at least 20 characters",
      });
    }

    const payload = {
      ...(title && { title }),
      ...(description && { description }),
      ...(type && { type }),
    };

    const updatedIssue = await issueService.updateIssueInDB(issueId, payload);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue updated successfully",
      data: updatedIssue,
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

const deleteIssue = async (req: Request, res: Response) => {
  const user = req.user as JwtPayload & { id: number; role: string };

  if (!user?.id) {
    return sendResponse(res, {
      statusCode: 401,
      success: false,
      message: "Unauthorized",
    });
  }

  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "Invalid issue ID",
      });
    }

    const issueId = Number(id);

    // Only maintainers can delete
    if (user.role !== "maintainer") {
      return sendResponse(res, {
        statusCode: 403,
        success: false,
        message: "Forbidden",
      });
    }

    const deleted = await issueService.deleteIssueInDB(issueId);

    if (!deleted) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found",
      });
    }

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue deleted successfully",
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

export const issueController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue,
};

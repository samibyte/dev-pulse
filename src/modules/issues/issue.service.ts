import { pool } from "../../db/index";
import type { IIssue } from "./issue.interface";

const createIssueInDB = async (payload: IIssue, reporterId: number) => {
  const { title, description, type } = payload;

  try {
    const result = await pool.query(
      `
       INSERT INTO issues(title,description,type, reporter_id) VALUES($1,$2,$3,$4) RETURNING *
      `,
      [title, description, type, reporterId],
    );
    return result;
  } catch (error: any) {
    throw error;
  }
};

export const issueService = {
  createIssueInDB,
};

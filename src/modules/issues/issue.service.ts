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

const getAllIssuesFromDB = async (options: {
  sort?: string | undefined;
  type?: string | undefined;
  status?: string | undefined;
}) => {
  const { sort, type, status } = options || {};

  const values: any[] = [];
  const whereClauses: string[] = [];

  if (type) {
    values.push(type);
    whereClauses.push(`type=$${values.length}`);
  }

  if (status) {
    values.push(status);
    whereClauses.push(`status=$${values.length}`);
  }

  const where = whereClauses.length
    ? `WHERE ${whereClauses.join(" AND ")}`
    : "";
  const order = sort === "oldest" ? "ASC" : "DESC";

  try {
    const issuesRes = await pool.query(
      `SELECT * FROM issues ${where} ORDER BY created_at ${order}`,
      values,
    );

    const issues = issuesRes.rows;

    if (!issues || issues.length === 0) return [];

    const reporterIds = Array.from(
      new Set(issues.map((i: any) => i.reporter_id)),
    );

    const usersRes = await pool.query(
      `SELECT id,name,role FROM users WHERE id = ANY($1)`,
      [reporterIds],
    );

    const users = usersRes.rows;
    const userMap = new Map(users.map((u: any) => [u.id, u]));

    const formatted = issues.map((issue: any) => ({
      id: issue.id,
      title: issue.title,
      description: issue.description,
      type: issue.type,
      status: issue.status,
      reporter: userMap.get(issue.reporter_id) ?? null,
      created_at: issue.created_at,
      updated_at: issue.updated_at,
    }));

    return formatted;
  } catch (error: any) {
    throw error;
  }
};

const getSingleIssueFromDB = async (issueId: number) => {
  try {
    const issueRes = await pool.query(`SELECT * FROM issues WHERE id = $1`, [
      issueId,
    ]);

    const issue = issueRes.rows[0];

    if (!issue) return null;

    const userRes = await pool.query(
      `SELECT id, name, role FROM users WHERE id = $1`,
      [issue.reporter_id],
    );

    const user = userRes.rows[0];

    const formatted = {
      id: issue.id,
      title: issue.title,
      description: issue.description,
      type: issue.type,
      status: issue.status,
      reporter: user ?? null,
      created_at: issue.created_at,
      updated_at: issue.updated_at,
    };

    return formatted;
  } catch (error: any) {
    throw error;
  }
};

const updateIssueInDB = async (issueId: number, payload: Partial<IIssue>) => {
  const { title, description, type } = payload;

  const updates: string[] = [];
  const values: any[] = [];

  if (title !== undefined) {
    values.push(title);
    updates.push(`title=$${values.length}`);
  }

  if (description !== undefined) {
    values.push(description);
    updates.push(`description=$${values.length}`);
  }

  if (type !== undefined) {
    values.push(type);
    updates.push(`type=$${values.length}`);
  }

  if (updates.length === 0) {
    throw new Error("No fields to update");
  }

  values.push(issueId);
  updates.push(`updated_at=NOW()`);

  try {
    const result = await pool.query(
      `UPDATE issues SET ${updates.join(", ")} WHERE id=$${values.length} RETURNING *`,
      values,
    );
    return result.rows[0];
  } catch (error: any) {
    throw error;
  }
};

const deleteIssueInDB = async (issueId: number) => {
  try {
    const result = await pool.query(
      `DELETE FROM issues WHERE id = $1 RETURNING *`,
      [issueId],
    );

    return result.rows[0] ?? null;
  } catch (error: any) {
    throw error;
  }
};

export const issueService = {
  createIssueInDB,
  getAllIssuesFromDB,
  getSingleIssueFromDB,
  updateIssueInDB,
  deleteIssueInDB,
};

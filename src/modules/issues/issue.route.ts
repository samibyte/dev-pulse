import { Router } from "express";
import { issueController } from "./issue.controller";
import auth from "../../middleware/auth";

const router = Router();
router.get("/", issueController.getAllIssues);
router.get("/:id", issueController.getSingleIssue);
router.post("/", auth(), issueController.createIssue);
router.patch("/:id", auth(), issueController.updateIssue);
router.delete("/:id", auth(), issueController.deleteIssue);

export const issueRouter: Router = router;

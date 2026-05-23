import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { authRouter } from "./modules/auth/auth.route";
import { issueRouter } from "./modules/issues/issue.route";
import globalErrorHandler from "./middleware/globalErrorHandler";

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Dev Pulse Server is running",
    author: "SAMIBYTE",
  });
});

app.use("/api/auth", authRouter);
app.use("/api/issues", issueRouter);

app.use(globalErrorHandler);

export default app;

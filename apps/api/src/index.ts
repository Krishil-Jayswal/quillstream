import { Hono } from "hono";
import authRouter from "./routes/auth";
import userRouter from "./routes/user";
import uploadRouter from "./routes/upload";

const app = new Hono();

const api = new Hono();

app.get("/", (c) => {
  return c.text("Quill Stream API Server.");
});

api.route("/auth", authRouter);
api.route("/user", userRouter);
api.route("/upload", uploadRouter);

app.route("/api/v1", api);

export default app;

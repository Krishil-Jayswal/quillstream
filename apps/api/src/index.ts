import { Hono } from "hono";
import authRouter from "./routes/auth";
import userRouter from "./routes/user";

const app = new Hono();

const api = new Hono();

app.get("/", (c) => {
  return c.text("Quill Stream API Server.");
});

api.route("/auth", authRouter);
api.route("/user", userRouter);

app.route("/api/v1", api);

export default app;

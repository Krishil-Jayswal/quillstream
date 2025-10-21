import { Hono } from "hono";
import { cors } from "hono/cors";
import authRouter from "./routes/auth";
import userRouter from "./routes/user";
import uploadRouter from "./routes/upload";
import { Bindings } from "./types/generics";

const app = new Hono<{ Bindings: Bindings }>();

const api = new Hono();

app.use("*", (c, next) => {
  return cors({
    origin: c.env.CLIENT_URL,
    allowHeaders: ["content-type", "authorization"],
    allowMethods: ["GET", "POST"],
  })(c, next);
});

app.get("/", (c) => {
  return c.text("Quill Stream API Server.");
});

api.route("/auth", authRouter);
api.route("/user", userRouter);
api.route("/upload", uploadRouter);

app.route("/api/v1", api);

export default app;

import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import { join } from "path";
import { fileURLToPath } from "url";
import router from "./routes";
import { logger } from "./lib/logger";
import { sessionIssuance, requireSessionWithQuota } from "./lib/session-quota";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const SESSION_SECRET =
  process.env.SESSION_SECRET ?? (() => {
    const generated = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    logger.warn("SESSION_SECRET env var not set — using ephemeral secret. Cookies will be invalidated on restart.");
    return generated;
  })();

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(cookieParser(SESSION_SECRET));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(sessionIssuance);

const improvePromptLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please wait before trying again." },
});

app.use("/api/improve-prompt", improvePromptLimiter, requireSessionWithQuota);

app.use("/api", router);

const staticDir = join(__dirname, "../../promptloop/dist/public");
app.use(express.static(staticDir));
app.get("/{*path}", (_req, res) => {
  res.sendFile(join(staticDir, "index.html"));
});

export default app;

import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();
const apiPathPattern = /^\/(?!api(?:\/|$)).*/;

function findClientDist() {
  const moduleDir = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.resolve(process.cwd(), "../cafe-website/dist/public"),
    path.resolve(process.cwd(), "artifacts/cafe-website/dist/public"),
    path.resolve(moduleDir, "../../cafe-website/dist/public"),
  ];

  return candidates.find((candidate) =>
    existsSync(path.join(candidate, "index.html")),
  );
}

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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

if (process.env.NODE_ENV === "production") {
  const clientDist = findClientDist();

  if (clientDist) {
    app.use(express.static(clientDist));
    app.get(apiPathPattern, (_req, res) => {
      res.sendFile(path.join(clientDist, "index.html"));
    });
  } else {
    logger.warn("Frontend build output not found; serving API only");
  }
}

export default app;

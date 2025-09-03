import "dotenv/config";
import express from "express";
import cors from "cors";
import pino from "pino";
import routes from "./routes/index.js";

const app = express();
const logger = pino({ transport: { target: "pino-pretty" } });

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api", routes);

const port = Number(process.env.PORT || 3001);
app.listen(port, () => logger.info(`API listening on http://localhost:${port}`));

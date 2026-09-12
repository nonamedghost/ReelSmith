import express from "express";
import cors from "cors";
import router from "./routes/index.js";

const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());
app.use("/api", router);

export default app;
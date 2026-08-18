import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import userauth from "./src/routes/user/auth";
import service from "./src/routes/service";
import user from "./src/routes/user/user";
import project from "./src/routes/project";
import tool from "./src/routes/tool";
import skill from "./src/routes/skill";
import serviceRequest from "./src/routes/service-requests";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";

const swaggerDocument = JSON.parse(fs.readFileSync(path.resolve(__dirname, './swagger-output.json'), 'utf8'));


const app = express();

app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/", userauth);
app.use("/user", user);
app.use("/service", service);
app.use("/project", project);
app.use("/tool", tool);
app.use("/skill", skill);
app.use("/service-request", serviceRequest);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/", (req: Request, res: Response) => res.json({ message: "Nazarify API is running" }));

const PORT = process.env.PORT || 3001;

mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => {
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });
  
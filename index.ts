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
import bookings from "./src/routes/booking";
import notification from "./src/routes/notification";
import adminAuth from "./src/routes/admin/auth";
import admin from "./src/routes/admin/admin";
import ai from "./src/routes/ai";
import partners from "./src/routes/partners";
import about from "./src/routes/about";
import contact from "./src/routes/contact";
// import messages from "./src/routes/messages";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const swaggerPath = path.join(__dirname, "swagger-output.json");
const swaggerDocument = JSON.parse(fs.readFileSync(swaggerPath, "utf8"));
app.use("/", userauth);
app.use("/user", user);
app.use("/service", service);
app.use("/project", project);
app.use("/tool", tool);
app.use("/skill", skill);
app.use("/bookings", bookings);
app.use("/notifications", notification);
app.use("/admin", adminAuth);
app.use("/admin", admin);
app.use("/ai", ai);
app.use("/partners", partners);
app.use("/about", about);
app.use("/contact", contact);
// app.use("/messages", messages);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/", (req: Request, res: Response) => res.json({ message: "Nazarify API is running" }));

const PORT = process.env.PORT || 3001;

mongoose.connect(process.env.MONGO_URI!).then(() => {
    console.log("MongoDB connected");

    if (process.env.NODE_ENV !== "production") {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    }
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });

export default app;

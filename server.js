import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit"
import cookieParser from "cookie-parser"
import cors from "cors"

import connectDB from "./config/db.js";

const app = express();
dotenv.config()

app.use(helmet());
app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// OTP Rate Limit
app.use("/api/auth/send-otp", rateLimit({
  windowMs: 60 * 1000,
  max: 5
}));

// import authRouter from "./routes/auth.router.js"
import otpRouter from "./routes/otpRoutes.js"
import serviceRoutes from "./routes/serviceRoutes.js"

import brandRoutes from "./routes/brandRoutes.js";
import modelRoutes from "./routes/modelRoutes.js";
import servicePackageRoutes from "./routes/servicePackageRoutes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";

// otp api
app.use("/api/auth", otpRouter);
  
// service api
app.use("/api/services", serviceRoutes);

// admin auth api
app.use("/api/admin", adminAuthRoutes);

app.use("/api/brands", brandRoutes);

app.use("/api/models", modelRoutes);

app.use("/api/packages", servicePackageRoutes);

app.get("/", (req, res)=>{
    res.send("server is run");
})

// database connected
connectDB();

const PORT=process.env.PORT || 8080;

app.listen(PORT, ()=>{
    console.log(`server is running on http://localhost:${PORT}`);
})
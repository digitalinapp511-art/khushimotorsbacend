import express from "express";
import { firebaseLogin } from "../controllers/firebaseLogin.js";

const router = express.Router();

router.post("/login", firebaseLogin);

export default router;
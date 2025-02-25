import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {PrismaClient} from "@prisma/client";
import authRoutes from "./routes/authRoutes";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use('/auth', authRoutes);

app.get("/", (req, res) => {
    res.send("Refresh is running")
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

export default prisma

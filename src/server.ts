import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {PrismaClient} from "@prisma/client";
import authRoutes from "./routes/authRoutes";
import jobsRoutes from "./routes/jobsRoutes"
import cookieParser from "cookie-parser";
import passport from "./config/passport"
import session from "express-session";
import cron from "node-cron"
import { storeJobs, deleteOldJobs } from "./scrape";

dotenv.config();
const app = express();
const prisma = new PrismaClient();
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use('/auth', authRoutes);
app.use('/job', jobsRoutes)

app.get("/", (req, res) => {
    res.send("Refresh is running")
})

app.use(
    session({
        secret: process.env.JWT_SECRET!,
        resave: false,
        saveUninitialized: true,
        cookie: {secure: false}
    })
)
const scrape = storeJobs()
async () => {
    try {
        await scrape
    } catch (err) {
        console.error("failed", err)
    }
}
//cron.schedule("*/40 * * * *", async () => {
//    console.log("Running scheduled job scraping");
  //  await deleteOldJobs();
    //await storeJobs();
    //console.log("Job refresh completed.");
//})

app.use(passport.initialize())
app.use(passport.session())
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
    console.log(`Server running on port ${PORT}`)
)

export default prisma

import { Router } from "express";
import prisma from "../server";

const router = Router()

router.get("/jobs", async (req, res) => {
    try {
    const jobs = await prisma.job.findMany({
        orderBy: {timePosted: "desc"}
    })
    res.json(jobs)
    } catch(error) {
        console.error(error);
        res.status(500).json({message: 'server error'})
        }
    }
)

export default router

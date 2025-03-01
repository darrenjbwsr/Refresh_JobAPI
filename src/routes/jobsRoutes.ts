import { Router } from "express";
import prisma from "../server";

const router = Router()

router.get("/jobs", async (req, res) => {

    const jobs = await prisma.job.findMany({
        orderBy: {timePosted: "desc"}
    })
    res.json(jobs)
})

export default router

import puppeteer from "puppeteer";
import prisma from "./server";



const INDEED_URL = "https://www.indeed.com/jobs?q=a&fromage=1"

export const scrapeJobs = async() => {
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium-browser",
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-blink-features=AutomationControlled"
        ]
    })

    const page = await browser.newPage()
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36");
    await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });
    console.log("Navigating to Indeed");
    await page.goto(INDEED_URL, {waitUntil: "networkidle2"})
    console.log("Stage one")
    await page.waitForSelector('[data-testid="slider_container"]', { timeout: 60000 })

    const jobs = await page.evaluate(() => {
        const jobListings: {
            title: string;
            company: string;
            location: string;
            salary: string;
            description: string;
            timePosted: string;
            link: string;
            created_at: Date;
        }[] = []

        const jobElements = document.querySelectorAll('[data-testid="slider_container"]')
        jobElements.forEach((job) => {
            const title = (job.querySelector("h2") as HTMLElement)?.innerText || "Unknown Title"
            const company = (job.querySelector('[data-testid="company-name"') as HTMLElement)?.innerText || "Unknown Company"
            const location = (job.querySelector('[data-testid="text-location"]') as HTMLElement)?.innerText || "Unknown Location"
            const salary = (job.querySelector(".salary-snippet-container") as HTMLElement)?.innerText || "No Listed Salary"
            const description = (job.querySelector(".job-snippet")as HTMLElement)?.innerText || "No Description"
            const timePosted = (job.querySelector(".date")as HTMLElement)?.innerText || "No Posted Time"
            const link= "https://www.indeed.com" + (job.querySelector("h2 a") as HTMLElement)?.getAttribute("href")
            jobListings.push({title, company, location, salary, description, timePosted, link, created_at: new Date() })
        })
        return jobListings
    })

    console.log(`Scrapped ${jobs.length} jobs`)
    await browser.close()

    return jobs
}

export const storeJobs = async () => {
    console.log("Saving Scrape")
    const jobs = await scrapeJobs()

    for (const job of jobs) {
        const existingJob = await prisma.job.findUnique({ where: {link: job.link} });
        if (!existingJob) {
            await prisma.job.create({
                data: {
                    title: job.title,
                    company: job.company,
                    location: job.location,
                    salary: job.salary,
                    description: job.description,
                    timePosted: job.timePosted,
                    link: job.link,
                }
            })
        }
    }
    console.log(`Stored ${jobs.length} new Jobs`)
}

export const deleteOldJobs = async () => {
    console.log("Deleting old jobs...");
    await prisma.job.deleteMany({});
    console.log("Old jobs deleted.");
};

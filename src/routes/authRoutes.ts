import { Router } from "express";
import passport from "../config/passport";
import { registerUser, loginUser, logoutUser } from "../controllers/authController";
import { verifyGoogleAuth } from "../middlewares/verifyingGoogleAuth";
const router = Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/logout', logoutUser)

router.get("/google", passport.authenticate("google", {scope: ["profile", "email"]}))
router.get(
    "/google/callback",
    passport.authenticate("google", {failureRedirect: "/login"}),
    (req, res) => {
        res.redirect("/dashboard")
    }
)
router.get("/dashboard", verifyGoogleAuth, (req,res) => {
    res.json({ message: "Welcome to your dashboard!", user: req.user})
})
export default router

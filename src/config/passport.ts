import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: process.env.GOOGLE_CALLBACK_URL!,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const existingUser = await prisma.user.findUnique({
                    where: {email: profile.emails?.[0].value},
                })

                if (existingUser) {
                    return done(null, existingUser);
                }

                const newUser = await prisma.user.create({
                    data: {
                        firstName: profile.name?.givenName || "NoFirstName",
                        lastName: profile.name?.familyName || "NoLastName",
                        email: profile.emails?.[0].value || "",
                        password: "",
                    }
                })
                return done(null, newUser)
            } catch (error) {
                return done(error, undefined);
            }
        }
    )
)

passport.serializeUser((user:any, done) => {
    done(null, user.id);
})

passport.deserializeUser(async (id: number, done) => {
    try {
        const user = await prisma.user.findUnique({where: {id}})
        if (!user) {
            return done(null, false)
        }
        done(null, user)
    } catch (error) {
        done(error, undefined)
    }
})

export default passport

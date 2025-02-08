import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../server";

export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const {firstName, lastName, email, password} = req.body;

        const existingUser = await prisma.user.findUnique({
            where: {email}
        });
        if (existingUser) {
            res.status(400).json({ message: "User already exists"})
            return
        }
        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                password: hashedPassword
            }
        })
        res.status(201).json({ id: newUser.id, firstName: newUser.firstName, lastName: newUser.lastName, email: newUser.email})
    } catch(err) {
        console.error(err);
        res.status(500).json({message: 'server error'})
        }
    }


export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const {email, password} = req.body
        const user = await prisma.user.findUnique({
            where: {email}
        })
        if (!user) {
            res.status(400).json({ message: 'Invalid User'})
            return
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            res.status(400).json({ message: "Incorrect Password"})
            return
        }
        const token = jwt.sign(
            {id: user.id, email: user.email},
            process.env.JWT_SECRET || "default",
            {expiresIn: '12hr'}
        )
        res.status(200).json({token})
    } catch (err){
        console.error(err);
        res.status(500).json({message:"server error"})
    }
}

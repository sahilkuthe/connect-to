import express from "express";
import client from "@repo/db/client"
import { SigninSchema, SignupSchema } from "./types";
import jwt from "jsonwebtoken"
import { JWT_PASSWORD } from "./config";
import { compare, hash } from "./scrypt";


const app = express();

app.use(express.json())

app.post("/signup", async (req, res) => {
    //check
    const parsedData = SignupSchema.safeParse(req.body)
    if(!parsedData.success){
        res.status(400).json({message: "validation failed"})
        return
    }

    const hashedPass = await hash(parsedData.data.password);

    try {
        const user = await client.user.create({
            data: {
                username: parsedData.data.username,
                password: hashedPass,
                role: parsedData.data.type === "admin" ? "Admin" : "User"

            }
        })

        res.json({userId: user.id})
    } catch (e) {
        res.status(400).json({message: "user already exists"})
    }

    
})

//auth tested and working

app.post("/signin", async (req, res) => {
    const parsedData = SigninSchema.safeParse(req.body)
    if (!parsedData.success) {
        res.status(403).json({message: "Validation failed"})
        return
    }

    try {
        const user = await client.user.findUnique({
            where: {
                username: parsedData.data.username
            }
        })
        
        if (!user) {
            res.status(403).json({message: "User not found"})
            return
        }
        const isValid = await compare(parsedData.data.password, user.password)

        if (!isValid) {
            res.status(403).json({message: "Invalid password"})
            return
        }

        const token = jwt.sign({
            userId: user.id,
            role: user.role
        }, JWT_PASSWORD);

        res.json({
            token
        })
    } catch(e) {
        res.status(400).json({message: "Internal server error"})
    }
})

app.get("/avatars", (req, res) => {
    
})

app.listen(process.env.PORT || 3000)
import { NextRequest } from "next/server";
import prisma from "@/db";
import { hash } from "bcrypt";
import * as z from 'zod';

interface BodyType {
    Name: string
    username: string,
    password: string
}

const UserSchema = z.object({
    Name: z.string().min(1, "Required"),
    username: z.string().min(1, {
        message: "email is Required"
    }).email('Invalid email'),
    password: z.string().min(8, { message: "password must contain atleat 8 character" })
})


export async function POST(req: NextRequest) {

    try {
        const body = await req.json();
        const { Name, username, password }: BodyType = UserSchema.parse(body);

        const existingUser = await prisma.user.findUnique({
            where: {
                username: username
            }
        });

        if (existingUser) {
            throw new Error("User already exists !!")
        }

        const hashedPassword = await hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                Name,
                username,
                password: hashedPassword
            }
        });

        return Response.json({ user: newUser, message: "Signed up Successfully", status: 201 });
    } 
    catch (error: any) {
        // console.error("Error occurred while creating user:", error);

        if (error.message === "User already exists!") {
            return Response.json({ error: error.message }, { status: 400 });
        }

        if (error instanceof z.ZodError) {
            return Response.json({ error: error.errors }, { status: 400 });
        }

        return Response.json(
            { error: "An error occurred while creating user" },
            { status: 500 }
        );
    }
}

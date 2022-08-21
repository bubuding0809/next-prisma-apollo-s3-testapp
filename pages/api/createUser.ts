import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { request } from "http";

const prisma = new PrismaClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ statusCode: 405, message: "Method Not Allowed" });
  }

  const userData = JSON.parse(req.body);

  const savedUser = await prisma.user.create({
    data: userData,
  });

  return res.json({ message: "User Created", data: savedUser });
};

export default handler;

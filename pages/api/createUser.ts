import { Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../backend/utils/prisma";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ statusCode: 405, message: "Method Not Allowed" });
  }

  const userData: Prisma.UserCreateInput = JSON.parse(req.body);

  try {
    const savedUser = await prisma.user.create({
      data: {
        name: !userData.name ? null : userData.name,
        email: !userData.email ? null : userData.email,
      },
    });
    console.log("createUser API hit successfully");
    return res.json({ message: "User Created", data: savedUser });
  } catch (error) {
    console.log("createUser API hit but got an error", error);
    return res.status(500).json({ message: error.message });
  }
};

export default handler;

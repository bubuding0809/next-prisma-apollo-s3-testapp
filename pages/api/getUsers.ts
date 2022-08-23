import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../backend/utils/prisma";

const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        posts: true,
        profile: true,
      },
    });
    console.log("getUser API hit successfully");
    res.status(200).json(users);
  } catch (err: any) {
    console.log("getUser API hit but got an error");
    res.status(500).json({ statusCode: 500, message: err.message });
  }
};

export default handler;

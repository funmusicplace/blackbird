import { User } from "@prisma/client";
import { Request, Response } from "express";

import { userAuthenticated } from "../../../../auth/passport";
import prisma from "../../../../../prisma/prisma";

type Params = {
  id: string;
};

export default function () {
  const operations = {
    POST: [userAuthenticated, POST],
  };

  async function POST(req: Request, res: Response) {
    const { id: artistId } = req.params as unknown as Params;
    const { id: userId } = req.user as User;

    try {
      const artist = await prisma.artist.findFirst({
        where: {
          id: Number(artistId),
        },
        include: {
          subscriptionTiers: true,
        },
      });

      if (artist) {
        await prisma.artistUserSubscription.deleteMany({
          where: {
            artistSubscriptionTier: {
              artistId: artist.id,
              isDefaultTier: true,
            },
            userId: userId,
          },
        });

        res.status(200).json({
          message: "success",
        });
      } else {
        res.status(404).json({
          error: "Artist not found",
        });
      }
    } catch (e) {
      console.error(e);
      res.status(500).json({
        error: "Something went wrong while subscribing the user",
      });
    }
  }

  POST.apiDoc = {
    summary: "Follows a user to an artist",
    parameters: [
      {
        in: "path",
        name: "id",
        required: true,
        type: "number",
      },
    ],
    responses: {
      200: {
        description: "Created artistSubscriptionTier",
      },
      default: {
        description: "An error occurred",
        schema: {
          additionalProperties: true,
        },
      },
    },
  };

  return operations;
}

import { RequestHandler } from "express";
import { Prisma, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getFeedAll: RequestHandler = async (req, res, next) => {
  try {
    const postsData = await prisma.feed.findMany({
      orderBy: {
        id: "desc",
      },
      take: 10,
    });
    res.status(200).json({
      data: postsData,
    });
  } catch (error) {
    console.error("Error fetching all feeds:", error);
  }
};

export const getFeed: RequestHandler = async (req, res, next) => {
  console.log("getFeed called");
};

export const createFeed: RequestHandler = async (req, res, next) => {
  try {
    const rawData = req.body;
        // db 저장
    const result = await prisma.feed.create({
      data: rawData,
    });

    res.status(201).json({
      result: result,
      data: "POSTS request to /posts",
    });

    res.status(201).json({
      result: rawData,
      data: "저장되었습니다.",
    });
  } catch (error) {
    console.error("Error creating feed:", error);
    res.status(500).json({
      error: "Failed to create feed",
    });
  }
};

export const updateFeed: RequestHandler = async (req, res, next) => {
  console.log("updateFeed called");
};

export const deleteFeed: RequestHandler = async (req, res, next) => {
  console.log("deleteFeed called");
};

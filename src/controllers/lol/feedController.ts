import { RequestHandler } from "express";
import { feedSchema } from "../../models/lol/feedSchema";
import { HttpError } from "../../utils/HttpError";

import { Prisma, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getFeedAll: RequestHandler = async (req, res, next) => {
  try {
    const result = await prisma.feed.findMany({
      orderBy: {
        feedID: "desc",
      },
      take: 10,
    });
    res.status(200).json({
      data: result,
    });
  } catch (error) {
    return next(new HttpError("서버 오류가 발생했습니다.", 500));
  }
};

export const getFeed: RequestHandler = async (req, res, next) => {
  try {
    const { feedID } = req.params;
    const result = await prisma.feed.findUnique({
      where: {
        feedID: String(feedID),
      },
    });

    // db 에러 처리
    if (!result) {
      return next(new HttpError("데이터가 없습니다.", 404));
    }

    res.status(200).json({
      data: result,
    });
  } catch (error) {
    console.log(error);
    return next(new HttpError("서버 오류가 발생했습니다.", 500));
  }
};

export const createFeed: RequestHandler = async (req, res, next) => {
  try {
    // 유효성 검사
    const rawData = req.body;
    const vaildData = feedSchema.safeParse(rawData);
    const errorMessage = vaildData.error?.errors[0]?.message;

    if (!vaildData.success) {
      // return next(new HttpError(errorMessage || "입력 데이터 에러", 422));
      throw new HttpError(errorMessage || "입력 데이터 에러", 422);
    }

    
    const result = await prisma.feed.create({
      data: {
        content: vaildData.data.content,
        userID: "TEST001",
        imageUrl: vaildData.data.imageUrl || null, 
      },
    });

    res.status(201).json({
      result: result,
      message: "피드 생성 성공",
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return next(error);
    }
    console.error("피드 생성 중 오류 발생:", error);
    return next(new HttpError("피드 생성 중 오류 발생", 500));
  }
};

export const updateFeed: RequestHandler = async (req, res, next) => {
  try {
    const { feedID } = req.params;
    const prevData = await prisma.feed.findUnique({
      where: {
        feedID: String(feedID),
      },
    });

    if (!prevData) {
      return next(new HttpError("데이터가 없습니다.", 404));
    }

    const rawData = req.body;
    const vaildData = feedSchema.safeParse(rawData);
    if (!vaildData.success) {
      return next(new HttpError("입력 데이터 에러", 422));
    }

    const updateData = await prisma.feed.update({
      where: {
        feedID: String(feedID),
      },
      data: vaildData.data,
    });

    res.status(200).json({
      data: updateData,
    });
  } catch (error) {
    return next(new HttpError("서버 오류가 발생했습니다.", 500));
  }
};

export const deleteFeed: RequestHandler = async (req, res, next) => {
  try {
    const { feedID } = req.params;
    console.log(feedID)
    const prevData = await prisma.feed.findUnique({
      where: {
        feedID: String(feedID),
      },
    });

    if (!prevData) {
      return next(new HttpError("데이터가 없습니다.", 404));
    }

    const deleteData = await prisma.feed.delete({
      where: {
        feedID: String(feedID),
      },
    });
    console.log(deleteData)

    res.status(200).json({
      data: deleteData,
    });
  } catch (error) {
    return next(new HttpError("서버 오류가 발생했습니다.", 500));
  }
};

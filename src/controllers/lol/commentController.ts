import { RequestHandler } from "express";
import { commentSchema } from "../../models/lol/commentSchema";
import { HttpError } from "../../utils/HttpError";

import { Prisma, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getComment: RequestHandler = async (req, res, next) => {
  try {
    const result = await prisma.comment.findMany({
      orderBy: {
        commentID: "desc",
      },
      // take: 10,
    });
    res.status(200).json({
      data: result,
    });
  } catch (error) {
    return next(new HttpError("서버 오류가 발생했습니다.", 500));
  }
};

export const createComment: RequestHandler = async (req, res, next) => {
  try {
    const userId = (req.user as any).id;

    if (!userId) {
      return next(new HttpError('로그인이 필요합니다.', 401));
    }

    const rawData = req.body;
    const validData = commentSchema.safeParse(rawData);
    const errorMessage = validData.error?.errors[0]?.message;

    if (!validData.success) {
      return next(new HttpError(errorMessage || "입력 데이터 에러", 422));
    }

    const result = await prisma.comment.create({
      data: {
        feedID: rawData.feedID,
        content: validData.data.content,
        userID: userId,
      },
    });

    res.status(201).json({
      result,
      message: "댓글 생성 성공",
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return next(error);
    }
    console.error("댓글 생성 중 오류 발생:", error);
    return next(new HttpError("댓글 생성 중 오류 발생", 500));
  }
};

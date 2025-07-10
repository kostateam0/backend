import { RequestHandler } from "express";
import { feedSchema } from "../../models/lol/feedSchema";
import { HttpError } from "../../utils/HttpError";
import prisma from "../../lib/prisma";
import * as feedService from "../../services/lol/feedService";

interface PassportSession {
  cookie: any;
  passport?: {
    user?: string;
  };
}

// const getUserIDFromSession = (req: any): string | null => {
//   const session = req.session as PassportSession;
//   if (session && session.passport && session.passport.user) {
//     return session.passport.user;
//   }
//   return null;
// };

export const getFeeds: RequestHandler = async (req, res, next) => {
  try {
    const userID = (req.user as any)?.id;
    const feeds = await feedService.getAllFeeds(userID);
    res.status(200).json({ data: feeds });
  } catch (error) {
    return next(new HttpError("서버 오류가 발생했습니다.", 500));
  }
};

export const getFeed: RequestHandler = async (req, res, next) => {
  const userID = (req.user as any)?.id;
  const { feedID } = req.params;

  try {
    const result = await prisma.feed.findUnique({
      where: { feedID: String(feedID) },
      include: {
        Comment: {
          orderBy: {
            commentID: "desc",
          },
        },
        _count: {
          select: { likes: true },
        },
      },
    });

    if (!result) {
      return next(new HttpError("데이터가 없습니다.", 404));
    }

    let liked = false;
    if (userID) {
      const like = await prisma.like.findUnique({
        where: {
          userID_feedID: {
            userID,
            feedID: String(feedID),
          },
        },
      });
      liked = !!like;
    }

    res.status(200).json({
      data: {
        ...result,
        likedCount: result._count.likes,
        isLiked: liked,
      },
    });
  } catch (error) {
    return next(new HttpError("서버 오류가 발생했습니다.", 500));
  }
};

export const createFeed: RequestHandler = async (req, res, next) => {
  try {
    // 유효성 검사
    const userID = (req.user as any)?.id;
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
        userID: userID,
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

    res.status(200).json({
      data: deleteData,
    });
  } catch (error) {
    return next(new HttpError("서버 오류가 발생했습니다.", 500));
  }
};

export const toggleFeedLike: RequestHandler = async (req, res, next) => {
  const userID = (req.user as any).id;
  const { feedID } = req.params;

  try {
    const existing = await prisma.like.findUnique({
      where: {
        userID_feedID: {
          userID,
          feedID,
        },
      },
    });

    if (existing) {
      await prisma.like.delete({
        where: {
          userID_feedID: {
            userID,
            feedID,
          },
        },
      });

      res.status(200).json({ message: "좋아요 취소됨", liked: false });
    } else {
      await prisma.like.create({
        data: {
          userID,
          feedID,
        },
      });

      res.status(200).json({ message: "좋아요 추가됨", liked: true });
    }
  } catch (err) {
    console.error("좋아요 토글 오류:", err);
    return next(new HttpError("좋아요 처리 중 오류 발생", 500));
  }
};

export const getFeedLikes: RequestHandler = async (req, res, next) => {
  const { feedID } = req.params;

  try {
    const count = await prisma.like.count({
      where: { feedID },
    });

    res.status(200).json({ count });
  } catch (err) {
    console.error(err);
    return next(new HttpError("좋아요 수 조회 실패", 500));
  }
};

export const isFeedLiked: RequestHandler = async (req, res, next) => {
  const userID = (req.user as any).id;
  const { feedID } = req.params;

  try {
    const like = await prisma.like.findUnique({
      where: {
        userID_feedID: {
          userID,
          feedID,
        },
      },
    });

    res.status(200).json({ liked: !!like });
  } catch (err) {
    console.error(err);
    return next(new HttpError("좋아요 여부 확인 실패", 500));
  }
};

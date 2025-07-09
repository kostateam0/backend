import prisma from "../../lib/prisma";

export const getAllFeeds = async (userID?: string) => {
  const feeds = await prisma.feed.findMany({
    orderBy: { feedID: "desc" },
    take: 10,
    include: {
      Comment: { orderBy: { commentID: "desc" } },
      _count: { select: { likes: true } },
    },
  });

  let likedFeedIDs: string[] = [];

  // 로그인 안했으면 좋아요 정보는 조회하지 않음
  if (!userID) {
    return feeds.map((feed) => ({
      ...feed,
      likedCount: feed._count.likes,
      isLiked: false,
    }));
  }

  // 로그인 사용자라면 좋아요 정보도 함께 조회
  if (userID) {
    const likedFeeds = await prisma.like.findMany({
      where: {
        userID,
        feedID: { in: feeds.map((f) => f.feedID) },
      },
      select: { feedID: true },
    });
    likedFeedIDs = likedFeeds.map((like) => like.feedID.toString());
  }

  return feeds.map((feed) => ({
    ...feed,
    likedCount: feed._count.likes,
    isLiked: likedFeedIDs.includes(feed.feedID.toString()),
  }));
};

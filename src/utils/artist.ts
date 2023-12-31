import {
  User,
  ArtistSubscriptionTier,
  Artist,
  Post,
  ArtistBanner,
  ArtistAvatar,
  TrackGroup,
  TrackGroupCover,
  Track,
  Prisma,
} from "@prisma/client";
import prisma from "../../prisma/prisma";
import stripe from "./stripe";
import { deleteTrackGroup, processSingleTrackGroup } from "./trackGroup";
import postProcessor from "./post";
import { convertURLArrayToSizes } from "./images";
import {
  finalArtistAvatarBucket,
  finalArtistBannerBucket,
  removeObjectsFromBucket,
} from "./minio";
import { DefaultArgs } from "@prisma/client/runtime/library";

export const checkIsUserSubscriber = async (
  user?: User,
  artistId?: number | null
) => {
  let userSubscriber = false;

  if (!artistId) {
    return true;
  }

  if (user) {
    const subscriber = await prisma.artistUserSubscription.findFirst({
      where: {
        userId: user.id,
        artistSubscriptionTier: {
          artistId,
        },
      },
    });

    userSubscriber = !!subscriber;
  }
  return userSubscriber;
};

export const findArtistIdForURLSlug = async (id: string) => {
  if (Number.isNaN(Number(id))) {
    const artist = await prisma.artist.findFirst({
      where: {
        urlSlug: { equals: id, mode: "insensitive" },
      },
    });
    id = `${artist?.id ?? id}`;
  }
  if (Number.isNaN(Number(id))) {
    return undefined;
  }
  return Number(id);
};

export const subscribeUserToArtist = async (
  artist: {
    user: User;
    subscriptionTiers: ArtistSubscriptionTier[];
    id: number;
  },
  user?: User | null
) => {
  let defaultTier = artist.subscriptionTiers.find((tier) => tier.isDefaultTier);

  if (!defaultTier) {
    defaultTier = await prisma.artistSubscriptionTier.create({
      data: {
        name: "follow",
        description: "follow an artist",
        minAmount: 0,
        currency: artist.user.currency ?? "USD",
        isDefaultTier: true,
        artistId: artist.id,
      },
    });
  }

  if (user && defaultTier) {
    const isSubscribed = await prisma.artistUserSubscription.findFirst({
      where: {
        userId: user.id,
        artistSubscriptionTier: {
          artistId: artist.id,
        },
      },
    });
    if (!isSubscribed) {
      await prisma.artistUserSubscription.upsert({
        create: {
          artistSubscriptionTierId: defaultTier.id,
          userId: user.id,
          amount: 0,
        },
        update: {
          deletedAt: null,
        },
        where: {
          userId_artistSubscriptionTierId: {
            userId: user.id,
            artistSubscriptionTierId: defaultTier.id,
          },
        },
      });
    }
  }

  const subscriptions = await prisma.artistUserSubscription.findMany({
    where: {
      userId: user?.id,
      artistSubscriptionTier: {
        artistId: artist.id,
      },
    },
  });

  return subscriptions;
};

export const deleteArtist = async (userId: number, artistId: number) => {
  await prisma.artist.deleteMany({
    where: {
      id: Number(artistId),
      userId: Number(userId),
    },
  });

  // FIXME: We don't do cascading deletes because of the
  // soft deletion. That _could_ probably be put into a
  // a prisma middleware. This is a lot!
  // https://github.com/funmusicplace/mirlo/issues/19
  await prisma.post.deleteMany({
    where: {
      artistId: Number(artistId),
    },
  });

  await deleteStripeSubscriptions({
    artistSubscriptionTier: { artistId: Number(artistId) },
  });

  await prisma.artistSubscriptionTier.deleteMany({
    where: {
      artistId: Number(artistId),
    },
  });

  await prisma.artistUserSubscription.deleteMany({
    where: {
      artistSubscriptionTier: { artistId: Number(artistId) },
    },
  });

  const trackGroups = await prisma.trackGroup.findMany({
    where: {
      artistId: Number(artistId),
    },
  });

  await Promise.all(trackGroups.map((tg) => deleteTrackGroup(tg.id)));
};

export const deleteArtistAvatar = async (artistId: number) => {
  const avatar = await prisma.artistAvatar.findFirst({
    where: {
      artistId,
    },
  });

  if (avatar) {
    await prisma.artistAvatar.delete({
      where: {
        artistId,
      },
    });

    try {
      removeObjectsFromBucket(finalArtistAvatarBucket, avatar.id);
    } catch (e) {
      console.error("Found no files, that's okay");
    }
  }
};

export const deleteArtistBanner = async (artistId: number) => {
  const banner = await prisma.artistBanner.findFirst({
    where: {
      artistId,
    },
  });

  if (banner) {
    await prisma.artistBanner.delete({
      where: {
        artistId,
      },
    });

    try {
      removeObjectsFromBucket(finalArtistBannerBucket, banner.id);
    } catch (e) {
      console.error("Found no files, that's okay");
    }
  }
};

export const deleteStripeSubscriptions = async (
  where: Prisma.ArtistUserSubscriptionWhereInput
) => {
  const stripeSubscriptions = await prisma.artistUserSubscription.findMany({
    where,
    include: {
      artistSubscriptionTier: true,
    },
  });
  await Promise.all(
    stripeSubscriptions.map(async (sub) => {
      if (sub.stripeSubscriptionKey) {
        const artistUser = await prisma.user.findFirst({
          where: {
            artists: {
              some: {
                id: sub.artistSubscriptionTier.artistId,
              },
            },
          },
        });
        try {
          if (artistUser?.stripeAccountId) {
            await stripe.subscriptions.cancel(sub.stripeSubscriptionKey, {
              stripeAccount: artistUser?.stripeAccountId,
            });
          } else {
            await stripe.subscriptions.cancel(sub.stripeSubscriptionKey);
          }
        } catch (e) {
          console.error("Fail silently on deleting from stripe", e);
        }
      }
    })
  ).catch((e) => {
    console.error("truely a failure");
  });
};

export const singleInclude = (): Prisma.ArtistInclude<DefaultArgs> => {
  return {
    trackGroups: {
      where: {
        published: true,
        tracks: { some: { audio: { uploadState: "SUCCESS" } } },
      },
      orderBy: {
        releaseDate: "desc",
      },
      include: {
        tracks: {
          where: { deletedAt: null },
        },
        cover: {
          where: {
            deletedAt: null,
          },
        },
      },
    },
    banner: {
      where: {
        deletedAt: null,
      },
    },
    avatar: {
      where: {
        deletedAt: null,
      },
    },
    subscriptionTiers: {
      where: {
        deletedAt: null,
        isDefaultTier: false,
      },
      orderBy: {
        minAmount: "asc",
      },
    },
    posts: {
      where: {
        publishedAt: {
          lte: new Date(),
        },
        deletedAt: null,
      },
      orderBy: {
        publishedAt: "desc",
      },
    },
  };
};

interface LocalArtist extends Artist {
  posts: Post[];
  banner: ArtistBanner | null;
  avatar: ArtistAvatar | null;
  trackGroups: (TrackGroup & {
    cover?: TrackGroupCover | null;
    tracks?: Track[];
  })[];
}

export const processSingleArtist = (
  artist: LocalArtist,
  userId?: number,
  isUserSubscriber?: boolean
) => {
  return {
    ...artist,
    posts: artist?.posts.map((p: Post) =>
      postProcessor.single(p, isUserSubscriber || artist.userId === userId)
    ),
    banner: artist?.banner
      ? {
          ...artist?.banner,
          sizes:
            artist?.banner &&
            convertURLArrayToSizes(
              artist?.banner?.url,
              finalArtistBannerBucket
            ),
        }
      : null,
    avatar: artist?.avatar
      ? {
          ...artist?.avatar,
          sizes:
            artist?.avatar &&
            convertURLArrayToSizes(
              artist?.avatar?.url,
              finalArtistAvatarBucket
            ),
        }
      : null,
    trackGroups: artist?.trackGroups.map(processSingleTrackGroup),
  };
};

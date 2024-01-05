import React from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useArtistContext } from "state/ArtistContext";
import useGetUserObjectById from "utils/useGetUserObjectById";
import { useGlobalStateContext } from "state/GlobalState";
import HeaderDiv from "components/common/HeaderDiv";
import ManageSectionWrapper from "./ManageSectionWrapper";
import { css } from "@emotion/css";
import LoadingBlocks from "components/Artist/LoadingBlocks";
import BackToArtistLink from "./BackToArtistLink";
import PostForm from "./PostForm";
import Post from "components/Post";
import Button from "components/common/Button";
import { bp } from "constants";

const ManagePost: React.FC<{}> = () => {
  const { t } = useTranslation("translation", { keyPrefix: "managePost" });

  const { postId } = useParams();
  const {
    state: { user },
  } = useGlobalStateContext();
  const {
    state: { artist },
  } = useArtistContext();

  const userId = user?.id;

  const {
    object: post,
    reload,
    isLoadingObject,
  } = useGetUserObjectById<Post>("posts", userId, postId);

  if (!post && isLoadingObject) {
    return <LoadingBlocks />;
  } else if (!Post) {
    return null;
  }

  const isPublished = post && new Date(post.publishedAt) < new Date();

  return (
    <ManageSectionWrapper
      className={css`
        padding-top: 1rem !important;
      `}
    >
      <div
        className={css`
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding-top: 1rem;

          @media screen and (max-width: ${bp.medium}px) {
            padding-top: 0.5rem;
          }
        `}
      >
        <BackToArtistLink />
        <HeaderDiv>
          <h1
            className={css`
              display: flex;
              align-items: center;
            `}
          >
            {t("managePost")}
          </h1>
          {post && isPublished && (
            <div
              className={css`
                display: flex;
                align-items: center;
              `}
            >
              <Link to={`/post/${post.id}`}>
                <Button type="button">{t("viewLive")}</Button>
              </Link>
            </div>
          )}
        </HeaderDiv>
      </div>
      {artist && <PostForm existing={post} reload={reload} artist={artist} />}
    </ManageSectionWrapper>
  );
};

export default ManagePost;

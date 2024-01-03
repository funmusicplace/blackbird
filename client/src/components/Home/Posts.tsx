import { css } from "@emotion/css";
import { SectionHeader } from "./Home";
import WidthContainer from "components/common/WidthContainer";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import React from "react";
import api from "services/api";
import PostCard from "components/common/PostCard";
import Overlay from "components/common/Overlay";
import { bp } from "../../constants";

const Posts = () => {
  const { t } = useTranslation("translation", { keyPrefix: "home" });
  const [posts, setPosts] = React.useState<Post[]>([]);
  console.log("posts", posts);
  const fetchAllPosts = React.useCallback(async () => {
    const fetched = await api.getMany<Post>("posts?take=3");
    setPosts(
      // FIXME: Maybe this should be managed by a filter on the API?
      fetched.results
    );
  }, []);

  const fetchPosts = React.useCallback(async () => {
    await fetchAllPosts();
  }, [fetchAllPosts]);

  React.useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);
  if (posts.length === 0) {
    return null;
  }

  return (
    <>
      <WidthContainer variant="big">
        <div
          className={css`
            padding-top: 1rem;
          `}
        >
          <SectionHeader className={css``}>
            <h5>{t("latestCommunityPost")}</h5>
          </SectionHeader>

          <div
            className={css`
              a {
                color: var(--mi-normal-foreground-color);
              }
            `}
          >
            <div
              className={css`
                margin: var(--mi-side-paddings-xsmall);
                margin-top: 0.5rem;
                display: flex;
                flex-wrap: wrap;
                justify-content: space-between;

                a {
                  width: 32%;
                }

                @media screen and (max-width: ${bp.medium}px) {
                  flex-direction: column;
                  margin-top: 0.25rem;

                  a {
                    width: 100%;
                  }
                }
              `}
            >
              {posts.map((p) => (
                <Link
                  to={`/post/${p.id}/`}
                  className={css`
                    display: flex;
                    margin-bottom: 1.5rem;
                    border-radius: 5px;
                    background-color: var(--mi-darken-background-color);
                    filter: brightness(95%);
                    width: 100%;

                    :hover {
                      transition: 0.2s ease-in-out;
                      text-decoration: none;
                      background-color: rgba(50, 0, 0, 0.07);
                      filter: brightness(90%);
                    }

                    @media (prefers-color-scheme: dark) {
                      :hover {
                        filter: brightness(120%);
                        background-color: rgba(100, 100, 100, 0.2);
                      }
                    }
                  `}
                >
                  <Overlay width="100%" height="100%"></Overlay>
                  <PostCard
                    width="100%"
                    height="350px"
                    dateposition="100%"
                    p={p}
                  ></PostCard>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </WidthContainer>
    </>
  );
};

export default Posts;

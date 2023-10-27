import { css } from "@emotion/css";
import React from "react";
import { Link } from "react-router-dom";
import { useGlobalStateContext } from "state/GlobalState";
import api from "../services/api";
import Box from "./common/Box";
import PostContent from "./common/PostContent";
import Logo from "./common/Logo";
import { Trans, useTranslation } from "react-i18next";

  function Home() {
    const {
      state: { user },
    } = useGlobalStateContext();
    const [posts, setPosts] = React.useState<Post[]>([]);
    const { t } = useTranslation("translation", { keyPrefix: "home" })

    const fetchAllPosts = React.useCallback(async () => {
      const fetched = await api.getMany<Post>("posts");
      setPosts(
        // FIXME: Maybe this should be managed by a filter on the API?
        fetched.results.filter((p) => !(p.isPublic && p.content === ""))
      );
    }, []);

    const userId = user?.id;

    const fetchPosts = React.useCallback(async () => {
      if (userId) {
        const fetched = await api.getMany<Post>(`users/${userId}/feed`);
        setPosts(fetched.results);
        if (fetched.results.length === 0) {
          await fetchAllPosts();
        }
      } else {
        // await fetchAllPosts();
      }
    }, [userId, fetchAllPosts]);

    React.useEffect(() => {
      fetchPosts();
    }, [fetchPosts]);

    return (
      <div
        className={
          !userId
            ? css`
              flex-grow: 1;
              display: flex;
              align-items: center;
              flex-grow: 1;
            `
            : css`
              min-height: calc(100vh - 350px);
              width: 100%;
            `
        }
      >
        {!user && (
          <div
            className={css`
            display: flex;
            align-items: center;
            justify-content: center;
          `}
          >
            <div
              className={css`
              display: none;

              @media (min-width: 768px) {
                display: block;
                background-image: url("/images/blackbird-light.webp");
                background-size: contain;
                background-repeat: no-repeat;
                width: 370px;
                height: 285px;
                margin-right: 60px;
              }

              @media (min-width: 768px) and (prefers-color-scheme: dark) {
                background-image: url("/images/blackbird-dark.webp");
              }
            `}
            />
            <div
              className={css`
              display: flex;
              flex-direction: column;
              gap: 48px;
              max-width: 500px;
            `}
            >
              <Logo />
              <div
                className={css`
                display: flex;
                flex-direction: column;
                gap: 24px;
              `}
              >
                <h1
                  className={css`
                  font-size: 1.75rem;
                  font-weight: 400;
                  line-height: 1.25;
                `}
                >
                  {t("support")}
                </h1>
                {/* <Link to="signup">
            <Button
              className={css`
                margin-top: 1.5rem;
              `}
              endIcon={<FaArrowRight />}
            >
              Get started
            </Button>
          </Link> */}
                <div
                  className={css`
                  display: flex;
                  gap: 16px;
                `}
                >
                  <a
                    href="https://dashboard.mailerlite.com/forms/396303/100612617721087214/share"
                    target="_blank"
                    rel="noreferrer"
                    className={css`
                    display: block;
                    height: 51px;
                    border-radius: 9999px;
                    font-weight: bold;
                    font-size: 1rem;
                    align-items: center;
                    display: inline-flex;
                    line-height: 1rem;
                    padding: 1rem;
                    text-decoration: none;
                    &:hover {
                      text-decoration: underline;
                    }

                    background-color: var(--mi-pink);
                    color: var(--mi-white);
                  `}
                  >
                    {t("mailingList")}
                  </a>
                  <Link
                    to="/login"
                    className={css`
                    display: block;
                    height: 51px;
                    border-radius: 9999px;
                    font-weight: bold;
                    font-size: 1rem;
                    align-items: center;
                    display: inline-flex;
                    line-height: 1rem;
                    padding: 1rem;
                    text-decoration: none;
                    &:hover {
                      text-decoration: underline;
                    }

                    background-color: var(--mi-black);
                    color: var(--mi-white);
                    @media (prefers-color-scheme: dark) {
                      background-color: var(--mi-white);
                      color: var(--mi-black);
                    }
                  `}
                  >
                    {t("logIn")}
                  </Link>
                </div>
                <p
                  className={css`
                  font-size: 0.875rem;
                  line-height: 1.5;
                `}
                >
                  <Trans
                    t={t}
                    i18nKey="mirloConstruction"
                    components={{
                      github: <a href="https://github.com/funmusicplace/mirlo/"></a>,
                      discord: <a href="https://discord.gg/VjKq26raKX"></a>,
                      email: <a href="mailto:mirlodotspace@proton.me"></a>,
                    }}
                  />
                </p>
              </div>
            </div>
          </div>
        )}
        {user && posts.length > 0 && (
          <>
            <h2
              className={css`
              margin-top: 1rem;
              margin-bottom: 1rem;
            `}
            >
              {t("latestCommunityPost")}
            </h2>
            {posts.map((p) => (
              <Box
                key={p.id}
                className={css`
                margin-bottom: 1rem;

                h3 {
                  padding-bottom: 0.4rem;
                }
              `}
              >
                <h3>
                  <Link to={`/post/${p.id}/`}>{p.title}</Link>
                </h3>
                {p.artist && (
                  <em>
                    by{" "}
                    <Link to={`/${p.artist.urlSlug ?? p.artist.id}`}>
                      {p.artist?.name}
                    </Link>
                  </em>
                )}
                <PostContent content={p.content} />
              </Box>
            ))}
          </>
        )}
      </div>
    );
  }

  export default Home;

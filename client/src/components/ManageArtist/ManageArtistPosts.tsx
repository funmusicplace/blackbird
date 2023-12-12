import { css } from "@emotion/css";
import Button from "components/common/Button";
import React from "react";
import api from "services/api";
import { useGlobalStateContext } from "state/GlobalState";
import NewPostForm from "./NewPostForm";
import Box from "components/common/Box";
import { FaPen, FaTrash } from "react-icons/fa";
import MarkdownContent from "components/common/MarkdownContent";
import { useSnackbar } from "state/SnackbarContext";
import PostForm from "./PostForm";
import Modal from "components/common/Modal";
import { useTranslation } from "react-i18next";
import { FaPlus } from "react-icons/fa";
import { useArtistContext } from "state/ArtistContext";
import HeaderDiv from "components/common/HeaderDiv";
import { ManageSectionWrapper } from "./ManageSectionWrapper";

const ManageArtistPosts: React.FC<{}> = () => {
  const {
    state: { user },
  } = useGlobalStateContext();
  const { t } = useTranslation("translation", { keyPrefix: "manageArtist" });

  const snackbar = useSnackbar();
  const {
    state: { artist },
  } = useArtistContext();

  const [addingNewPost, setAddingNewPost] = React.useState(false);
  const [managePost, setManagePost] = React.useState<Post>();

  const [posts, setPosts] = React.useState<Post[]>([]);

  const userId = user?.id;
  const artistId = artist?.id;
  const fetchPosts = React.useCallback(async () => {
    if (userId) {
      const fetchedPosts = await api.getMany<Post>(
        `users/${userId}/posts?artistId=${artistId}`
      );
      setPosts(fetchedPosts.results);
    }
  }, [artistId, userId]);

  React.useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const deletePost = React.useCallback(
    async (postId: number) => {
      try {
        await api.delete(`users/${userId}/posts/${postId}`);
        snackbar(t("postDeleted"), { type: "success" });
        fetchPosts();
      } catch (e) {
        console.error(e);
      }
    },
    [fetchPosts, snackbar, userId, t]
  );

  if (!artist) {
    return null;
  }

  return (
    <ManageSectionWrapper>
      <HeaderDiv>
        <h2>{t("posts")}</h2>
        <Button
          transparent
          onClick={() => {
            setAddingNewPost(true);
          }}
          startIcon={<FaPlus />}
          compact
        >
          {t("addNewPost", { artist: artist.name })}
        </Button>
      </HeaderDiv>
      {posts?.map((p) => (
        <Box
          key={p.id}
          className={css`
            margin-bottom: 1rem;
            background-color: var(--mi-darken-background-color);
          `}
        >
          <div
            className={css`
              display: flex;
              justify-content: space-between;
            `}
          >
            <strong>{p.title}</strong>
            <div>
              <Button
                compact
                onlyIcon
                transparent
                startIcon={<FaPen />}
                onClick={() => setManagePost(p)}
              >
                {" "}
                {/* {t("edit")} */}
              </Button>
              <Button
                className={css`
                  margin-left: 0.5rem;
                `}
                compact
                transparent
                startIcon={<FaTrash />}
                onClick={() => deletePost(p.id)}
              >
                {/*{t("delete")}*/}
              </Button>
            </div>
          </div>
          <MarkdownContent content={p.content} />
        </Box>
      ))}
      {managePost && (
        <Modal
          open={!!managePost}
          onClose={() => setManagePost(undefined)}
          title={t("editPost") ?? ""}
        >
          <PostForm existing={managePost} reload={fetchPosts} artist={artist} />
        </Modal>
      )}

      <NewPostForm
        open={addingNewPost}
        onClose={() => setAddingNewPost(false)}
        reload={fetchPosts}
        artist={artist}
      />
    </ManageSectionWrapper>
  );
};

export default ManageArtistPosts;

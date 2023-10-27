import React from "react";

import { useForm } from "react-hook-form";
import Button from "../common/Button";
import { InputEl } from "../common/Input";
import TextArea from "../common/TextArea";
import FormComponent from "components/common/FormComponent";
import { useSnackbar } from "state/SnackbarContext";
import { pick } from "lodash";
import LoadingSpinner from "components/common/LoadingSpinner";
import api from "../../services/api";
import { useGlobalStateContext } from "state/GlobalState";
import { css } from "@emotion/css";
import { useTranslation } from "react-i18next";

const PostForm: React.FC<{
  existing?: Post;
  reload: () => Promise<void>;
  artist: Artist;
  onClose?: () => void;
}> = ({ reload, artist, existing, onClose }) => {
  const {
    state: { user },
  } = useGlobalStateContext();
  const snackbar = useSnackbar();
  const [isSaving, setIsSaving] = React.useState(false);
  const {t} = useTranslation("translation",{keyPrefix : "postForm"})


  const publishedAt = existing ? new Date(existing.publishedAt) : new Date();
  publishedAt.setMinutes(
    publishedAt.getMinutes() - publishedAt.getTimezoneOffset()
  );

  const { register, handleSubmit } = useForm<{
    title: string;
    publishedAt: string;
    content: string;
    isPublic: boolean;
  }>({
    defaultValues: existing
      ? { ...existing, publishedAt: publishedAt.toISOString().slice(0, 16) }
      : {
          publishedAt: publishedAt.toISOString().slice(0, 16),
        },
  });

  const existingId = existing?.id;
  const userId = user?.id;

  const doSave = React.useCallback(
    async (data: { title: string; publishedAt: string; content: string }) => {
      if (userId) {
        try {
          setIsSaving(true);
          if (existingId) {
            // const timezoneOffset =
            await api.put(`users/${userId}/posts/${existingId}`, {
              ...pick(data, ["title", "content", "isPublic"]),
              publishedAt: new Date(data.publishedAt + ":00").toISOString(),
              artistId: artist.id,
            });
          } else {
            await api.post<
              {
                title?: string;
                artistId: number;
                cover?: File[];
                publishedAt: string;
              },
              { id: number }
            >(`users/${userId}/posts`, {
              ...pick(data, ["title", "content", "isPublic"]),
              publishedAt: new Date(data.publishedAt + ":00").toISOString(),
              artistId: artist.id,
            });
          }

          snackbar("Post updated", { type: "success" });
          reload?.();
          onClose?.();
        } catch (e) {
          snackbar("There was a problem with the API", { type: "warning" });
        } finally {
          setIsSaving(false);
          await reload();
        }
      }
    },
    [reload, existingId, snackbar, artist.id, onClose, userId]
  );

  return (
    <form onSubmit={handleSubmit(doSave)}>
      <h4>
        {existing ? "Edit" : "New"} blog post for {artist.name}
      </h4>

      {/* <FormComponent>
        Display artist: <InputEl {...register("display_artist")} />
      </FormComponent> */}
      <FormComponent>
        {t("title")} <InputEl {...register("title")} />
      </FormComponent>
      <FormComponent>
        {t("publicationDate")}{" "}
        <InputEl type="datetime-local" {...register("publishedAt")} />
      </FormComponent>
      <FormComponent>
        {t("content")} <TextArea {...register("content")} rows={10} />
      </FormComponent>
      <FormComponent
        className={css`
          margin-top: 0.5rem;
          display: flex;
        `}
      >
        <input id="private" type="checkbox" {...register("isPublic")} />{" "}
        <label htmlFor="private">
          {t("isSubscriptionOnly")}
          <small>{t("postForm")}</small>
        </label>
      </FormComponent>
      <Button
        type="submit"
        disabled={isSaving}
        startIcon={isSaving ? <LoadingSpinner /> : undefined}
      >
        {existing ? t("save") : t("saveNew")} {t("post")}
      </Button>
    </form>
  );
};

export default PostForm;

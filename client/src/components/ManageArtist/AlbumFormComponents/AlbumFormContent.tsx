import React from "react";
import { useFormContext } from "react-hook-form";

import FormComponent from "components/common/FormComponent";

import { useTranslation } from "react-i18next";
import { InputEl } from "components/common/Input";
import TextArea from "components/common/TextArea";
import UploadImage from "../UploadImage";
import UploadArtistImage from "../UploadArtistImage";

const AlbumFormContent: React.FC<{
  isLoadingImage: boolean;
  existingFileCover?: string;
  existingObject?: TrackGroup;
}> = ({ isLoadingImage, existingFileCover, existingObject }) => {
  const { t } = useTranslation("translation", { keyPrefix: "manageAlbum" });
  const { register } = useFormContext();

  return (
    <>
      <FormComponent>
        {t("title")}: <InputEl {...register("title")} />
      </FormComponent>
      <FormComponent
        style={{
          flexDirection: "column",
          display: "flex",
          alignItems: "flex-start",
        }}
      >
        {t("cover")}:
        {!existingObject && (
          <UploadImage
            formName="coverFile"
            isLoading={isLoadingImage}
            existingCover={existingFileCover}
          />
        )}
        {existingObject && (
          <UploadArtistImage
            existing={existingObject}
            imageType="cover"
            height="400"
            width="400"
            maxDimensions="1500x1500"
          />
        )}
      </FormComponent>

      {/* <FormComponent>
        {t("type")}:{" "}
        <SelectEl defaultValue="lp" {...register("type")}>
          <option value="lp">{t("lp")}</option>
          <option value="ep">{t("ep")}</option>
          <option value="single">{t("single")}</option>
          <option value="compilation">{t("compilation")}</option>
        </SelectEl>
        <small>The type is optional</small>
      </FormComponent> */}

      <FormComponent>
        {t("releaseDate")}:{" "}
        <InputEl type="date" {...register("releaseDate")} required />
      </FormComponent>
      <FormComponent>
        {t("about")}: <TextArea {...register("about")} rows={7} />
      </FormComponent>
      <FormComponent>
        {t("credits")}: <TextArea {...register("credits")} rows={5} />
      </FormComponent>
      <FormComponent>
        {t("price")}:
        <InputEl type="number" {...register("minPrice")} />
      </FormComponent>
    </>
  );
};

export default AlbumFormContent;

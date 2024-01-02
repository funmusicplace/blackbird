import { css } from "@emotion/css";
import React from "react";
import { useGlobalStateContext } from "state/GlobalState";
import ManageSubscriptionTierBox from "./ManageSubscriptionTierBox";
import SubscriptionForm from "./SubscriptionForm";
import { useArtistContext } from "state/ArtistContext";
import useGetUserObjectById from "utils/useGetUserObjectById";
import { Link, useParams } from "react-router-dom";
import HeaderDiv from "components/common/HeaderDiv";
import { ManageSectionWrapper } from "./ManageSectionWrapper";
import Modal from "components/common/Modal";
import { useTranslation } from "react-i18next";
import Button from "components/common/Button";
import { FaPlus } from "react-icons/fa";

const ManageArtistSubscriptionTiers: React.FC<{}> = () => {
  const {
    state: { user },
  } = useGlobalStateContext();
  const [addingNewTier, setAddingNewTier] = React.useState(false);
  const { t } = useTranslation("translation", {
    keyPrefix: "subscriptionForm",
  });

  const {
    state: { artist },
  } = useArtistContext();
  const { artistId } = useParams();
  const { objects: tiers, reload } =
    useGetUserObjectById<ArtistSubscriptionTier>(
      "artists",
      user?.id,
      artistId,
      `/subscriptionTiers`,
      { multiple: true }
    );

  if (!artist) {
    return null;
  }

  return (
    <ManageSectionWrapper>
      <HeaderDiv>
        <div />
        <div>
          <Link to="supporters">{t("supporters")}</Link>
          <Button
            transparent
            onClick={() => {
              setAddingNewTier(true);
            }}
            startIcon={<FaPlus />}
            compact
          >
            {t("addNewTier")}
          </Button>
        </div>
      </HeaderDiv>
      <div
        className={css`
          margin-bottom: 1rem;
        `}
      >
        {tiers?.map((tier) => (
          <ManageSubscriptionTierBox
            tier={tier}
            key={tier.id}
            reload={reload}
            artist={artist}
          />
        ))}
      </div>
      <Modal
        open={addingNewTier}
        onClose={() => setAddingNewTier(false)}
        title={t("newSubscriptionTierFor", { artistName: artist.name }) ?? ""}
      >
        <SubscriptionForm artist={artist} reload={reload} />
      </Modal>
    </ManageSectionWrapper>
  );
};

export default ManageArtistSubscriptionTiers;

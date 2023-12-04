import { Link } from "react-router-dom";
import Modal from "components/common/Modal";
import React from "react";
import { bp } from "../../constants";
import { css } from "@emotion/css";
import { useTranslation } from "react-i18next";
import api from "services/api";
import { useGlobalStateContext } from "state/GlobalState";
import BuyTrackGroup from "components/TrackGroup/Buy";
import { useArtistContext } from "state/ArtistContext";
import DownloadAlbumButton from "components/common/DownloadAlbumButton";

const PurchaseOrDownloadAlbum: React.FC<{
  trackGroup: TrackGroup;
}> = ({ trackGroup }) => {
  const { t } = useTranslation("translation", { keyPrefix: "trackGroupCard" });
  const {
    state: { user },
  } = useGlobalStateContext();
  const [isPurchasingAlbum, setIsPurchasingAlbum] = React.useState(false);
  const [isOwned, setIsOwned] = React.useState(false);
  const { state: artistState } = useArtistContext();

  const userId = user?.id;

  const checkForAlbumOwnership = React.useCallback(async () => {
    try {
      if (userId) {
        const { results: purchases } =
          await api.getMany<UserTrackGroupPurchase>(
            `users/${userId}/purchases?trackGroupId=${trackGroup.id}`
          );

        setIsOwned(purchases.length > 0);
      }
    } catch (e) {
      console.error(e);
    }
  }, [trackGroup.id, userId]);

  React.useEffect(() => {
    checkForAlbumOwnership();
  }, [checkForAlbumOwnership]);

  if (!trackGroup || !artistState?.artist) {
    return null;
  }

  // FIXME: remove once we have a real stripe account
  if (!userId) {
    return null;
  }

  const userIsTrackGroupArtist =
    user && artistState?.artist.userId === user?.id;

  return (
    <>
      <div>
        {!userIsTrackGroupArtist &&
          !isOwned &&
          artistState?.userStripeStatus?.chargesEnabled && (
            <div
              className={css`
                margin-top: 0rem;

                button {
                  background: transparent;
                  color: var(--mi-normal-foreground-color) !important;
                  padding: 0;
                }
                button:hover {
                  color: var(--mi-normal-foreground-color) !important;
                  background-color: transparent !important;
                  text-decoration: underline;
                }

                @media screen and (max-width: ${bp.small}px) {
                  button {
                    padding: 0;
                    font-size: 0.75rem;
                  }
                }
              `}
            >
              <Link
                onClick={() => setIsPurchasingAlbum(true)}
                to={""}
                className={css`
                  font-weight: bold;
                  margin-left: 0.2rem;
                  @media screen and (max-width: ${bp.small}px) {
                    font-size: var(--mi-font-size-xsmall);
                  }
                `}
              >
                {t("buy")}
              </Link>
            </div>
          )}
        {(userIsTrackGroupArtist || isOwned) && (
          <DownloadAlbumButton trackGroup={trackGroup} />
        )}
      </div>
      <div
        className={css`
          overflow-y: hidden !important;
        `}
      >
        <Modal
          size="small"
          open={isPurchasingAlbum}
          onClose={() => setIsPurchasingAlbum(false)}
          title={t("buyingTrackGroup", { title: trackGroup.title }) ?? ""}
        >
          <BuyTrackGroup trackGroup={trackGroup} />
        </Modal>
      </div>
    </>
  );
};

export default PurchaseOrDownloadAlbum;

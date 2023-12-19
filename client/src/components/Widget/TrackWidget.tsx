import { css } from "@emotion/css";
import { AudioWrapper } from "components/AudioWrapper";
// import { AudioWrapper } from "components/AudioWrapper";
// import ClickToPlay from "components/common/ClickToPlay";
import ImageWithPlaceholder from "components/common/ImageWithPlaceholder";
import { MetaCard } from "components/common/MetaCard";
import PauseButton from "components/common/PauseButton";
import PlayButton from "components/common/PlayButton";
import SmallTileDetails from "components/common/SmallTileDetails";
import React from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import api from "services/api";
import { useGlobalStateContext } from "state/GlobalState";
import { isTrackOwnedOrPreview, widgetUrl } from "utils/tracks";

function inIframe() {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}

function inMirlo() {
  try {
    return window.top?.location.origin === process.env.REACT_APP_CLIENT_DOMAIN;
  } catch (e) {
    return false;
  }
}

const TrackWidget = () => {
  const params = useParams();
  const {
    state: { playing, user },
  } = useGlobalStateContext();

  const [track, setTrack] = React.useState<Track>();
  const [isLoading, setIsLoading] = React.useState(true);
  const { t } = useTranslation("translation", { keyPrefix: "trackDetails" });
  const { t: artistTranslation } = useTranslation("translation", {
    keyPrefix: "artist",
  });

  const embeddedInMirlo = inIframe() && inMirlo();

  React.useEffect(() => {
    const callback = async () => {
      setIsLoading(true);
      try {
        const results = await api.get<Track>(`tracks/${params.id}`);
        setTrack(results.result);
      } catch (e) {
        console.error("e", e);
      } finally {
        setIsLoading(false);
      }
    };

    callback();
  }, [params.id]);

  return (
    <>
      {(!track || !track.id) && !isLoading && (
        <div
          className={css`
            border: var(--mi-border);
            display: flex;
            width: 100%;
            justify-content: center;
            padding: 1rem;
          `}
        >
          {t("trackDoesntExist")}
        </div>
      )}
      {track?.id && (
        <div
          className={css`
            display: flex;
            border: var(--mi-border);
            flex-direction: column;
            width: 100%;
            padding: 1rem;
            border-radius: 0.3rem;
            box-sizing: border-box;
            height: 100%;
            background: var(--mi-normal-background-color);
          `}
        >
          <div
            className={css`
              display: flex;
              align-items: center;
            `}
          >
            <MetaCard
              title={`${track.title} by ${
                track.trackGroup.artist?.name ?? "Unknown"
              }`}
              description={track.trackGroup.title}
              image={track.trackGroup.cover?.sizes?.[300]}
              player={widgetUrl(track.id)}
            />
            <ImageWithPlaceholder
              src={track.trackGroup.cover?.sizes?.[300] ?? ""}
              alt={track.title}
              size={120}
            />
            <SmallTileDetails
              title={track.title}
              subtitle={track.trackGroup.title}
              footer={
                track.trackGroup.artist?.name ??
                (artistTranslation("unknown") as string)
              }
            />

            {isTrackOwnedOrPreview(track, user) && (
              <>
                {!playing && (
                  <PlayButton
                    className={
                      playing || embeddedInMirlo
                        ? css`
                            margin-right: 0.5rem;
                            width: 3rem;
                            height: 3rem;
                          `
                        : "height: 3rem; width: 3rem;"
                    }
                  />
                )}
                {playing && (
                  <PauseButton
                    className={css`
                      width: 3rem;
                      height: 3rem;
                      padding-left: 0.8rem !important;
                      background-color: var(--mi-normal-background-color);
                      :hover {
                        padding-left: 0.8rem !important;
                        border: solid 1.5px var(--mi-normal-foreground-color) !important;
                      }
                    `}
                  />
                )}
              </>
            )}
          </div>
          {track && !embeddedInMirlo && (
            <div
              className={css`
                border-bottom: solid 0.25rem var(--mi-lighten-background-color);
                margin-top: 1rem;
              `}
            >
              <div
                className={css`
                  display: flex;
                  align-items: center;
                  width: 100%;
                  margin-top: -1rem;
                  padding: 1rem 0 0 0;
                  position: relative;
                  bottom: -0.25rem;

                  & > div {
                    max-width: ;
                  }
                `}
              >
                <AudioWrapper
                  currentTrack={track}
                  hideControls
                  position="relative"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default TrackWidget;

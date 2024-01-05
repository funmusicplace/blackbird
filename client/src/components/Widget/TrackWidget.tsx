import { css } from "@emotion/css";
import { AudioWrapper } from "components/AudioWrapper";
// import { AudioWrapper } from "components/AudioWrapper";
// import ClickToPlay from "components/common/ClickToPlay";
import IconButton from "components/common/IconButton";
import ImageWithPlaceholder from "components/common/ImageWithPlaceholder";
import { MetaCard } from "components/common/MetaCard";
import SmallTileDetails from "components/common/SmallTileDetails";
import React from "react";
import { useTranslation } from "react-i18next";
import { TfiControlPause } from "react-icons/tfi";
import { VscPlay } from "react-icons/vsc";
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
    dispatch,
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

  const onPause = React.useCallback(
    (e: any) => {
      if (track && embeddedInMirlo) {
        window.parent.postMessage("mirlo:pause:track:" + track.id);
      } else {
        dispatch({ type: "setPlaying", playing: false });
      }
    },
    [dispatch, embeddedInMirlo, track]
  );

  const playMusic = React.useCallback(() => {
    if (track) {
      if (embeddedInMirlo) {
        window.parent.postMessage("mirlo:play:track:" + track.id);
      } else {
        dispatch({ type: "setPlayerQueueIds", playerQueueIds: [track.id] });
        dispatch({ type: "setPlaying", playing: true });
      }
    }
  }, [track, dispatch, embeddedInMirlo]);

  return (
    <>
      {(!track || !track.id) && !isLoading && (
        <div
          className={css`
            border: var(--mi-border);
            ${embeddedInMirlo && "min-height: 154px;"}
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
            padding: 0.5rem;
            ${embeddedInMirlo && "min-height: 154px;"}
            display: flex;
            flex-direction: column;
            align-items: space-between;
            justify-content: stretch;
            border-radius: 0.3rem;
            box-sizing: border-box;
            background: var(--mi-normal-background-color);
          `}
        >
          <div
            className={css`
              display: flex;
              align-items: center;
              height: 135px;
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
              size={135}
            />

            <div
              className={css`
                width: 100%;
                min-width: 30%;
              `}
            >
              <SmallTileDetails
                title={track.title}
                subtitle={track.trackGroup.title}
                footer={
                  track.trackGroup.artist?.name ??
                  (artistTranslation("unknown") as string)
                }
              />
            </div>

            {isTrackOwnedOrPreview(track, user) && (
              <>
                <div
                  className={css`
                    button {
                      font-size: 1.4rem !important;
                      background-color: var(--mi-normal-foreground-color);
                      color: var(--mi-normal-background-color);
                      border: solid 1.5px var(--mi-normal-foreground-color) !important;
                      width: 3rem !important;
                      height: 3rem !important;
                    }

                    @media (prefers-color-scheme: dark) {
                      button {
                        background-color: var(--mi-normal-foreground-color);
                        color: var(--mi-normal-background-color);
                      }
                      button:hover {
                        color: var(--mi-normal-foreground-color) !important;
                      }
                    }
                  `}
                >
                  {!playing && (
                    <IconButton
                      onClick={playMusic}
                      className={css`
                          padding-left: 0.85rem !important;
                        }
                      `}
                    >
                      <VscPlay />
                    </IconButton>
                  )}
                  {(playing || embeddedInMirlo) && (
                    <IconButton
                      onClick={onPause}
                      className={css`
                          padding: 0.75rem !important;
                          ${embeddedInMirlo && "display: none;"}
                        }
                      `}
                    >
                      <TfiControlPause />
                    </IconButton>
                  )}
                </div>
              </>
            )}
          </div>
          {track && !embeddedInMirlo && (
            <div
              className={css`
                border-bottom: solid 0.25rem var(--mi-lighten-background-color);
                margin-top: 0.5rem;
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

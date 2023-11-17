import { css } from "@emotion/css";
import React from "react";
import { FiLink } from "react-icons/fi";
import { useGlobalStateContext } from "state/GlobalState";

import IconButton from "./IconButton";
import { fmtMSS, isTrackOwnedOrPreview, widgetUrl } from "utils/tracks";
import { useSnackbar } from "state/SnackbarContext";
import { bp } from "../../constants";
import TrackRowPlayControl from "./TrackRowPlayControl";

const TrackRow: React.FC<{
  track: Track;
  trackGroup: TrackGroup;
  addTracksToQueue: (id: number) => void;
}> = ({ track, addTracksToQueue, trackGroup }) => {
  const snackbar = useSnackbar();
  const [trackTitle] = React.useState(track.title);
  const {
    state: { user },
  } = useGlobalStateContext();

  const canPlayTrack = isTrackOwnedOrPreview(track, user, trackGroup);

  return (
    <tr
      key={track.id}
      id={`${track.id}`}
      className={css`
        ${!canPlayTrack ? `color: var(--mi-lighten-foreground-color);` : ""}
        :hover {
          color: var(--mi-normal-background-color) !important;
          background-color: var(--mi-normal-foreground-color) !important;

          button {
            color: var(--mi-normal-background-color);
            background: transparent;
          }
        }
        button {
          color: var(--mi-normal-foreground-color);
          background: transparent;
        }
        button:hover {
          color: var(--mi-normal-background-color);
          background: transparent;
        }

        font-size: 18px;

        {//*  :hover {
          transform: scale(1.02, 1.02);
          transition: transform .1s ease-in-out;
          font-size: 1.1rem;
        }  *//}

        @media screen and (max-width: ${bp.small}px) {
          font-size: 16px;
          td {
            padding: 0.15rem 0.3rem;
          }
        }

        button {
          font-size: 14px;
        }

        > td > .play-button {
          display: none;
        }
        > td > .track-number {
          display: block;
        }
        &:hover > td > .play-button {
          display: block;
          width: 2rem;
        }
        &:hover > td > .track-number {
          display: none;
        }
      `}
    >
      <td
        className={css`
          height: 30px;

          button {
            padding: .5rem .65rem !important;
            background: none;
          }
          button:hover {
            padding: .5rem .65rem !important;
            background: none;
          }
        `}
      >
        {canPlayTrack && (
          <TrackRowPlayControl
            trackId={track.id}
            trackNumber={track.order}
            onTrackPlayCallback={addTracksToQueue}
          />
        )}
      </td>
      <td
        className={css`
          width: 100%;
          padding: 0rem;
          margin: 0rem;
        `}
      >
        <div
          className={css`
            display: flex;
            flex-direction: row;
            flex-wrap: nowrap;
            padding: 0.1rem;
            margin-bottom: 0.05rem;
            justify-content: space-between;
            align-items: flex-end;

            @media screen and (max-width: ${bp.small}px) {
              flex-wrap: nowrap;
            }
          `}
        >
          <div
            className={css`
          overflow: hidden;
          text-overflow: ellipsis;

          @media screen and (max-width: ${bp.medium}px) {
            font-size: .8rem;
          }

          @media screen and (max-width: ${bp.small}px) {
              td {
                padding: 0.15rem 0.3rem;
              }
        `}
          >
            {trackTitle}
          </div>
          <div
            className={css`
              font-size: 0.9rem;
              @media screen and (max-width: ${bp.medium}px) {
                font-size: 0.7rem;
                font-weight: bold;
                td {
                  padding: 0.15rem 0.3rem;
                }
              }
            `}
          >
            {track.audio?.duration && fmtMSS(track.audio.duration)}
          </div>
        </div>
      </td>
      <td align="right">
        <IconButton
          compact
          onClick={() => {
            navigator.clipboard.writeText(widgetUrl(track.id));
            snackbar("Copied track url", { type: "success" });
          }}
        >
          <FiLink />
        </IconButton>
      </td>
    </tr>
  );
};
export default TrackRow;

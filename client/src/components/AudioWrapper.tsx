// import { css } from "@emotion/css";

import React from "react";
import ReactHlsPlayer from "@gumlet/react-hls-player";
import api from "services/api";

import { useGlobalStateContext } from "state/GlobalState";
// import { fmtMSS } from "utils/tracks";
// import { bp } from "../constants";
import SongTimeDisplay from "./common/SongTimeDisplay";

const hlsConfig = {
  xhrSetup: function (xhr: XMLHttpRequest, url: string) {
    // const { token } = getToken();
    // FIXME: need to set cookies on the xhr for the hls
    xhr.setRequestHeader("Content-Type", "application/octet-stream");
    xhr.withCredentials = true;
    // xhr.setRequestHeader("Authorization", `Bearer ${token}`);
  },
};

export const AudioWrapper: React.FC<{
  currentTrack: Track;
  hideControls?: boolean;
}> = ({ currentTrack, hideControls = false }) => {
  const {
    state: { playerQueueIds, currentlyPlayingIndex, user, playing, looping },
    dispatch,
  } = useGlobalStateContext();
  // const [currentTime, setCurrentTime] = React.useState("0:00");
  const [mostlyListened, setMostlyListened] = React.useState(false);
  const [currentSeconds, setCurrentSeconds] = React.useState(0);
  const userId = user?.id;
  const playerRef = React.useRef<HTMLVideoElement>(null);

  const onEnded = React.useCallback(async () => {
    if (looping === "loopTrack") {
      playerRef.current?.play();
    } else {
      dispatch({ type: "incrementCurrentlyPlayingIndex" });
    }
    setMostlyListened(false);
  }, [playerRef, dispatch, looping]);

  const onListen = React.useCallback(
    async (e: any) => {
      // setCurrentTime(fmtMSS(e.target.currentTime.toFixed()));
      if (
        !mostlyListened &&
        currentTrack &&
        userId &&
        e.target.currentTime > 45
      ) {
        setMostlyListened(true);
        try {
          // const result = await registerPlay(currentTrack.id);
          // dispatch({ type: "setUserCredits", credits: result.total });
        } catch (e) {
          console.error(e);
        }
      }
      setCurrentSeconds(e.target.currentTime);
    },
    [currentTrack, mostlyListened, userId]
  );

  const determineIfShouldPlay = React.useCallback(() => {
    try {
      if (
        currentTrack &&
        currentlyPlayingIndex !== undefined &&
        currentTrack.id === playerQueueIds[currentlyPlayingIndex] &&
        playing
      ) {
        if (playerRef?.current) {
          playerRef.current.setAttribute("muted", "");
          playerRef.current.playsInline = true;
          playerRef.current.play();
        }
      } else if (playerRef?.current && playing === false) {
        if (playerRef?.current) {
          playerRef.current.playsInline = true;
          playerRef.current.pause();
        }
      }
    } catch (e) {
      console.error("an error happened", e);
    }
  }, [currentTrack, currentlyPlayingIndex, playerQueueIds, playerRef, playing]);

  React.useEffect(() => {
    determineIfShouldPlay();
  }, [determineIfShouldPlay]);

  const streamUrl = api.streamUrl(currentTrack);

  const onPlay = React.useCallback(() => {
    dispatch({ type: "setPlaying", playing: true });
  }, [dispatch]);

  if (!streamUrl) {
    return null;
  }

  return (
    <>
      <ReactHlsPlayer
        src={streamUrl}
        autoPlay={false}
        style={{ display: "none" }}
        // controls={true}
        // @ts-ignore
        hlsConfig={hlsConfig}
        width="100%"
        height="2rem"
        onPlay={onPlay}
        onEnded={onEnded}
        playerRef={playerRef}
        onTimeUpdate={onListen}
        playsInline
      />
      <SongTimeDisplay playerRef={playerRef} currentSeconds={currentSeconds} />
    </>
  );
};

import React from "react";
import ArtistTrackGroup from "./Artist/ArtistTrackGroup";
import TrackgroupGrid from "components/common/TrackgroupGrid";
import { useGlobalStateContext } from "state/GlobalState";
import api from "services/api";
import { css } from "@emotion/css";
import { useTranslation } from "react-i18next";
import { bp } from "../constants";

const Releases = () => {
  const {
    state: { user },
  } = useGlobalStateContext();
  const { t } = useTranslation("translation", { keyPrefix: "releases" });
  const [trackGroups, setTrackGroups] = React.useState<TrackGroup[]>([]);

  const userId = user?.id;

  React.useEffect(() => {
    const callback = async () => {
      const results = await api.getMany<TrackGroup>("trackGroups");
      setTrackGroups(results.results);
    };

    callback();
  }, []);

  return (
    <div
      className={css`
        @media screen and (max-width: ${bp.medium}px) {
          margin-bottom: 0rem;
        }
      `}
    >
      <h1
        className={css`
          padding-bottom: 0.5rem;
          margin-bottom: 1rem;
          line-height: 1em;
          @media screen and (max-width: ${bp.medium}px) {
            margin-bottom: 0.5rem;
          }
          @media screen and (min-width: ${bp.medium}px) {
            position: sticky;
            top: 55px;
            ${!userId ? "top: 0; padding-top: .5rem;" : ""}
            background-color: var(--mi-normal-background-color);
            z-index: +1;
            border-bottom: solid 1px var(--mi-lighter-foreground-color);
          }
        `}
      >
        {t("recentReleases")}
      </h1>
      <div
        className={css`
          display: flex;
          width: 100%;
          flex-direction: row;
          flex-wrap: wrap;
        `}
      >
        <TrackgroupGrid>
          {trackGroups?.map((trackGroup) => (
            <ArtistTrackGroup key={trackGroup.id} trackGroup={trackGroup} />
          ))}
        </TrackgroupGrid>
      </div>
    </div>
  );
};

export default Releases;

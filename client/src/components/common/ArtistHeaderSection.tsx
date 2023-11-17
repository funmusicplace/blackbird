import { css } from "@emotion/css";
import { useParams } from "react-router-dom";
import { bp } from "../../constants";
import { MetaCard } from "components/common/MetaCard";
import styled from "@emotion/styled";
import MarkdownContent from "./MarkdownContent";
import HeaderDiv from "./HeaderDiv";
import FollowArtist from "./FollowArtist";

const H1 = styled.h1`
  font-size: 50px;
  font-size: 2.6vmax;
  line-height: 2.8vmax;
  padding-top: 1.5rem;

  @media screen and (max-width: ${bp.medium}px) {
    font-size: 32px;
    font-size: 3vmax;
    line-height: 3vmax;
    padding-top: 0.5rem;
    padding-bottom: 0rem;
  }
`;

const Header = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: left;
  justify-content: space-between;
  flex-grow: 1;
  border-bottom: solid 1px var(--mi-light-foreground-color);

  p {
    margin-bottom: 2rem;
  }

  @media screen and (max-width: ${bp.medium}px) {
    font-size: .7em;
    line-height: 1rem;
    border-radius: 0;
    padding: 0rem 0.5rem 0rem;
    border: solid grey;
    border-width: 0px 0px 1px 0px;
    p {
      margin-bottom: 0em !important;
      padding-bottom: .5rem;
    }
  }
`;

const ArtistHeaderSection: React.FC<{ artist: Artist; isManage?: boolean }> = ({
  artist,
  isManage,
}) => {
  const { trackGroupId } = useParams();

  const artistBanner = artist?.banner?.sizes;

  return (
    <div>
      <MetaCard
        title={artist.name}
        description={artist.bio}
        image={artist.avatar?.sizes?.[500] ?? artist?.banner?.sizes?.[625]}
      />
      {artistBanner && (!trackGroupId || isManage) && (
        <div
          className={css`
            display: flex;
            overflow: hidden;
            align-items: flex-end;
            justify-content: space-around;

            @media screen and (max-width: ${bp.medium}px) {
              background: var(--mi-normal-background-color);
            }
          `}
        >
          <Header>
            <HeaderDiv>
              <H1>{artist.name}</H1>
              <FollowArtist artistId={artist.id} />
            </HeaderDiv>
            <MarkdownContent content={artist.bio} />
          </Header>
        </div>
      )}

      {(!artistBanner || trackGroupId) && (
        <div
          className={css`
            display: flex;
            overflow: hidden;
            align-items: flex-end;
            justify-content: space-around;
          `}
        >
          <Header>
            <H1>{artist.name}</H1>
            <MarkdownContent content={artist.bio} />
          </Header>
        </div>
      )}
    </div>
  );
};

export default ArtistHeaderSection;

import { css, injectGlobal } from "@emotion/css";
import PageHeader from "components/common/PageHeader";
import Snackbar from "components/common/Snackbar";
import Player from "components/Player";
import React, { useContext } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import api from "services/api";
import { useGlobalStateContext } from "state/GlobalState";
import SnackbarContext from "state/SnackbarContext";
import useWidgetListener from "utils/useWidgetListener";
import Header from "./components/Header/Header";
import globalCSS from "./styles";
import { Footer } from "components/Footer";
import { bp } from "./constants";
import { MetaCard } from "components/common/MetaCard";
import useArtistColors from "utils/useArtistColors";

injectGlobal(globalCSS);

function App() {
  const { state, dispatch } = useGlobalStateContext();
  const { isDisplayed } = useContext(SnackbarContext);
  useWidgetListener();
  const navigate = useNavigate();

  const location = useLocation();

  const artistColors = useArtistColors();
  const userId = state.user?.id;
  const isPlaying = state.playerQueueIds;

  React.useEffect(() => {
    const callback = async () => {
      try {
        await api.post("refresh", {});
        const user = await api.get<LoggedInUser>("profile");
        dispatch({
          type: "setLoggedInUser",
          user: user.result,
        });
      } catch (e) {
        if (e instanceof Error && e.message.includes("NetworkError")) {
          console.error(
            "Problem with the network, gonna just do nothing for now, we might want to throw up an error in the future"
          );
          setTimeout(callback, 1000 * 10);
        } else {
          console.error("Error refreshing token", e);
          dispatch({
            type: "setLoggedInUser",
            user: undefined,
          });
          // if (
          //   !(
          //     location.pathname.includes("login") ||
          //     location.pathname.includes("signup")
          //   )
          // ) {
          //   navigate("/login");
          // }
        }
      }
    };

    callback();
    let interval: NodeJS.Timer | null = null;

    if (userId) {
      interval = setInterval(async () => {
        callback();
      }, 1000 * 60 * 5); // refresh every 5 minutes
    }
    return () => (interval ? clearInterval(interval) : undefined);
  }, [userId, dispatch, navigate, location.pathname]);

  // In the case of a widget we don't show all the wrapper stuff
  if (location.pathname.includes("widget")) {
    return <Outlet />;
  }

  return (
    <>
      <MetaCard
        title="Mirlo"
        description="A music distribution and patronage site"
        image="/android-chrome-512x512.png"
      />
      <div
        className={css`
          display: flex;
          flex-direction: column;
          min-height: 100vh;

          ${artistColors &&
          `
          ${
            artistColors.background &&
            `--mi-normal-background-color: ${artistColors.background};`
          }
          ${
            artistColors.primary &&
            `--mi-primary-color: ${artistColors.primary};`
          }
          ${
            artistColors.secondary &&
            `--mi-secondary-color: ${artistColors.secondary};`
          }
          ${
            artistColors.foreground &&
            `--mi-normal-foreground-color: ${artistColors.foreground} !important;`
          }
          `}

          background-color: var(--mi-normal-background-color);
          color: var(--mi-normal-foreground-color);
        `}
      >
        {/* <Snackbar /> */}
        {isDisplayed && <Snackbar />}

        <Header />

        <div
          className={css`

            @media screen and (max-width: ${bp.medium}px) {
                display: none !important;
            }
          `}
        ><PageHeader /></div>
        <div
          className={css`
            flex-grow: 1;
            display: flex;
            flex-direction: column;

            ${isPlaying
              ? `
            padding-bottom: 130px;`
              : ``}
          `}
        >
          <div
            className={css`
              margin: 0 auto;

              width: 100%;
              border-radius: var(--mi-border-radius);
              display: flex;
              z-index: 1;
              ${userId ? "display: flex;" : ""}
              flex-grow: 1;

              @media (min-width: ${bp.small}px) {
                padding: 0rem 2rem 2rem;
                max-width: calc(1080px + 0rem);
              }
              @media screen and (max-width: ${bp.medium}px) {
                button {
                  font-size: 0.7rem;
                }
              }
              @media screen and (max-width: 800px) {
                padding: 0rem 0rem 0rem;

                > div {
                  padding: 0.5rem 0.5rem 0.5rem;
                }
              }
            `}
          >
            <Outlet />
          </div>
          <Footer />
        </div>

        <Player />
      </div>
    </>
  );
}

export default App;

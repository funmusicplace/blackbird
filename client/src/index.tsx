import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";

import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import ErrorPage from "./components/ErrorPage";
import "./i18n";

// import Signup from "./components/Signup";
import Login from "./components/Login";
import { GlobalStateProvider } from "./state/GlobalState";
import Profile from "./components/Profile";
import Manage from "./components/ManageArtist/Manage";
import { SnackBarContextProvider } from "state/SnackbarContext";
import { ThemeProvider } from "@emotion/react";
import { theme } from "utils/theme";
import Admin from "components/Admin/Admin";
import AdminUsers from "components/Admin/Users";
import AdminTrackGroups from "components/Admin/Trackgroups";
import AdminTracks from "components/Admin/Tracks";
import ManageArtist from "components/ManageArtist/ManageArtist";
import Home from "components/Home/Home";
import Artist from "components/Artist/Artist";
import TrackGroupWidget from "components/Widget/TrackGroupWidget";
import TrackWidget from "components/Widget/TrackWidget";
import Collection from "components/Profile/Collection";
import Post, { pageMarkdownWrapper } from "components/Post";
import PasswordReset from "components/PasswordReset";
import TrackGroup from "components/TrackGroup/TrackGroup";
import About from "components/pages/About";
import { AuthWrapper } from "components/AuthWrapper";
import Signup from "components/Signup";
import { ArtistProvider } from "state/ArtistContext";
import FAQ from "components/pages/FAQ";
import ManageTrackGroup from "components/ManageArtist/ManageTrackGroup";
import Releases from "components/Releases";
import ManageContainer from "components/ManageArtist/ManageContainer";
import ManageArtistContainer from "components/ManageArtist/ManageArtistContainer";
import ArtistContainer from "components/Artist/ArtistContainer";
import ProfileContainer from "components/Profile/ProfileContainer";
import WishlistCollection from "components/Profile/WishlistCollection";
import MarkdownContent from "components/common/MarkdownContent";
import Welcome from "components/ManageArtist/Welcome";
import ArtistPosts from "components/Artist/ArtistPosts";
import ArtistAlbums from "components/Artist/ArtistAlbums";
import ArtistSupport from "components/Artist/ArtistSupport";
import ManageArtistAlbums from "components/ManageArtist/ManageArtistAlbums";
import ManageArtistSubscriptionTiers from "components/ManageArtist/ManageArtistSubscriptionTiers";
import ManageArtistPosts from "components/ManageArtist/ManageArtistPosts";
import ManagePost from "components/ManageArtist/ManagePost";
import NewReleaseRedirect from "components/ManageArtist/NewReleaseRedirect";
import { css } from "@emotion/css";
import Supporters from "components/ManageArtist/Supporters";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ArtistProvider>
        <App />
      </ArtistProvider>
    ),
    errorElement: <ErrorPage />,
    children: [
      { path: "", element: <Home /> },
      { path: "pages/about", element: <About /> },
      { path: "pages/faq", element: <FAQ /> },
      {
        path: "pages/cookie-policy",
        element: (
          <div className={pageMarkdownWrapper}>
            <MarkdownContent source="/pages/CookiePolicy.md" />
          </div>
        ),
      },
      {
        path: "pages/privacy",
        element: (
          <div className={pageMarkdownWrapper}>
            <MarkdownContent source="/pages/Privacy.md" />
          </div>
        ),
      },
      {
        path: "pages/terms",
        element: (
          <div className={pageMarkdownWrapper}>
            <MarkdownContent source="/pages/Terms.md" />
          </div>
        ),
      },
      { path: "widget/track/:id", element: <TrackWidget /> },
      { path: "widget/trackgroup/:id", element: <TrackGroupWidget /> },
      { path: "post/:postId", element: <Post /> },
      {
        path: "signup",
        element: <Signup />,
      },
      {
        path: "login",
        element: <Login />,
      },

      {
        path: "password-reset",
        element: <PasswordReset />,
      },
      {
        path: "profile",
        element: (
          <AuthWrapper>
            <ProfileContainer />
          </AuthWrapper>
        ),
        children: [
          {
            path: "",
            element: <Profile />,
          },
          {
            path: "collection",
            element: <Collection />,
          },
          {
            path: "wishlist",
            element: <WishlistCollection />,
          },
        ],
      },
      {
        path: "manage",
        element: (
          <AuthWrapper>
            <ManageContainer />
          </AuthWrapper>
        ),
        children: [
          {
            path: "",
            element: <Manage />,
          },
          { path: "welcome", element: <Welcome /> },
          {
            path: "artists/:artistId",
            element: <ManageArtistContainer />,
            children: [
              {
                path: "",
                element: <ManageArtist />,
                children: [
                  { path: "", element: <Navigate to="releases" /> },
                  {
                    path: "releases",
                    element: <ManageArtistAlbums />,
                  },
                  {
                    path: "tiers",
                    element: <ManageArtistSubscriptionTiers />,
                  },
                  {
                    path: "tiers/supporters",
                    element: <Supporters />,
                  },
                  {
                    path: "posts",
                    element: <ManageArtistPosts />,
                  },
                ],
              },
              {
                path: "release/:trackGroupId",
                element: <ManageTrackGroup />,
              },
              {
                path: "post/:postId",
                element: <ManagePost />,
              },
              {
                path: "new-release",
                element: <NewReleaseRedirect />,
              },
            ],
          },
        ],
      },

      {
        path: "admin",
        element: (
          <AuthWrapper adminOnly>
            <Admin />
          </AuthWrapper>
        ),
        children: [
          {
            path: "users",
            element: <AdminUsers />,
          },
          {
            path: "trackGroups",
            element: <AdminTrackGroups />,
          },
          {
            path: "tracks",
            element: <AdminTracks />,
          },
        ],
      },
      {
        path: "releases",
        element: (
          <div
            className={css`
              width: 100%;
            `}
          >
            <Releases />
          </div>
        ),
      },
      {
        path: ":artistId",
        element: <ArtistContainer />,
        children: [
          {
            path: "",
            element: <Artist />,
            children: [
              {
                path: "posts",
                element: <ArtistPosts />,
              },
              {
                path: "releases",
                element: <ArtistAlbums />,
              },
              {
                path: "support",
                element: <ArtistSupport />,
              },
            ],
          },
          {
            path: "release/:trackGroupId",
            element: <TrackGroup />,
          },
        ],
      },
    ],
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <GlobalStateProvider>
        <SnackBarContextProvider>
          <RouterProvider router={router} />
        </SnackBarContextProvider>
      </GlobalStateProvider>
    </ThemeProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

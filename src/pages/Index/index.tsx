import React, { useEffect, useState } from "react";
import querystring from "query-string";
import axios from "axios";
import { prominent } from "color.js";
import {
  BsFillPlayCircleFill,
  BsPauseCircleFill,
  BsSpotify,
} from "react-icons/bs";
import { IoMdLogOut } from "react-icons/io";
import { toast } from "react-toastify";

import { invertColor } from "../../utils/invertColor";

import "./index.css";
const Index = () => {
  const [token, setToken] = useState<string | null>(null);
  const [topTracks, setTopTracks] = useState([]);
  const [topTrackColors, setTopTrackColors] = useState<any[]>([]);
  const [range, setRange] = useState("");

  const [audio, setAudio] = useState<HTMLAudioElement | undefined>(undefined);
  const [audioState, setAudioState] = useState(false);
  const [playingId, setPlayingId] = useState("");

  useEffect(() => {
    const tokenJson = window.localStorage.getItem("spAuth");

    if (tokenJson !== null && tokenJson !== "") {
      const token = JSON.parse(tokenJson);
      setToken(token.access_token);
    }
  }, []);

  useEffect(() => {
    topTracks.forEach((topTrack: any) => {
      prominent(topTrack.album.images[0].url, {
        amount: 1,
        format: "hex",
      }).then((a) => {
        console.log(a);
        setTopTrackColors((topTrackColor) => [
          ...topTrackColor,
          { id: topTrack.id, color: a.toString() },
        ]);
      });
    });
  }, [topTracks]);

  function generateRandomString(length: number) {
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  function loginWithSpotify() {
    const state = generateRandomString(16);
    const scope = "user-top-read user-read-recently-played user-read-private";

    window.location.href =
      "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: process.env.REACT_APP_SPOTIFY_CLIENT_ID,
        scope: scope,
        redirect_uri: process.env.REACT_APP_CALLBACK_URL,
        state: state,
      });
  }

  function logout() {
    setToken("");
    window.localStorage.setItem("spAuth", "");
  }

  async function getTopTracks(timeRange: string) {
    setRange(timeRange);

    try {
      const response = await axios.get(
        `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}}`,
          },
        }
      );

      setTopTracks(response.data.items);
    } catch {
      toast.error(
        "An error ocurred loading songs. Please login again with Spotify",
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        }
      );
      logout();
    }
  }

  useEffect(() => {
    if (audioState) {
      audio?.play();
    } else {
      audio?.pause();
    }
  }, [audioState, audio]);

  function playPreview(src: string, trackId: string) {
    setPlayingId(trackId);
    const audioPlay = new Audio(src);
    audioPlay.onended = () => {
      setAudioState(false);
      setAudio(undefined);
      setPlayingId("");
    };
    setAudio(audioPlay);
    setAudioState(true);
  }

  function stopPreview() {
    setPlayingId("");
    setAudioState(false);
  }

  return (
    <div className="container">
      {!token && (
        <button className="login" onClick={() => loginWithSpotify()}>
          <BsSpotify size={30} color="#fff" className="spotifyIcon" />
          Login with Spotify
        </button>
      )}
      {token && (
        <div className="songsContainer">
          <button className="logout" onClick={() => logout()}>
            Logout <IoMdLogOut size={25} color="#fff" className="logoutIcon" />
          </button>
          <div className="buttonsContainer">
            <button
              className={`topSongsButton ${
                range === "short_term" ? "selected" : ""
              }`}
              onClick={() => getTopTracks("short_term")}
            >
              Top Tracks (last 4 weeks)
            </button>

            <button
              className={`topSongsButton ${
                range === "medium_term" ? "selected" : ""
              }`}
              onClick={() => getTopTracks("medium_term")}
            >
              Top Tracks (last 6 months)
            </button>

            <button
              className={`topSongsButton ${
                range === "long_term" ? "selected" : ""
              }`}
              onClick={() => getTopTracks("long_term")}
            >
              Top Tracks (All Time)
            </button>
          </div>

          {topTracks &&
            topTracks.map((topTrack: any, index: number) => {
              return (
                <div
                  className="trackContainer"
                  style={{
                    backgroundColor: topTrackColors.find(
                      (a) => a.id === topTrack.id
                    )?.color,
                    color: invertColor(
                      topTrackColors.find((a) => a.id === topTrack.id)?.color,
                      true
                    ),
                  }}
                  key={topTrack.id}
                >
                  {playingId !== "" &&
                  playingId === topTrack.id &&
                  audioState ? (
                    <button
                      className="playIcon"
                      onClick={() => {
                        stopPreview();
                      }}
                    >
                      <BsPauseCircleFill
                        size={40}
                        color={invertColor(
                          topTrackColors.find((a) => a.id === topTrack.id)
                            ?.color,
                          true
                        )}
                        style={{ cursor: "pointer" }}
                      />
                    </button>
                  ) : (
                    <button
                      title="Play preview"
                      className="playIcon"
                      disabled={playingId !== "" && playingId !== topTrack.id}
                      onClick={() => {
                        playPreview(topTrack.preview_url, topTrack.id);
                      }}
                    >
                      <BsFillPlayCircleFill
                        size={40}
                        color={
                          playingId !== "" && playingId !== topTrack.id
                            ? "#999"
                            : invertColor(
                                topTrackColors.find((a) => a.id === topTrack.id)
                                  ?.color,
                                true
                              )
                        }
                        style={{ cursor: "pointer" }}
                      />
                    </button>
                  )}

                  <div>
                    {index + 1}
                    {". "}
                    {topTrack.name}
                    {" - "}
                    {topTrack.artists.map((artist: any, index: number) => {
                      return (
                        <React.Fragment key={index}>
                          {artist.name}
                          {topTrack.artists.length > 1
                            ? index + 1 === topTrack.artists.length
                              ? ""
                              : ", "
                            : ""}
                        </React.Fragment>
                      );
                    })}
                  </div>
                  <img
                    src={topTrack.album.images[0].url}
                    alt="album-img"
                    height={100}
                    className="albumCover"
                  />
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default Index;

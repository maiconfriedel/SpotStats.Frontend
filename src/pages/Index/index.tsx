import React, { useEffect, useState } from "react";
import querystring from "query-string";
import axios from "axios";
import { client_id } from "../../config/spotify";

import "./index.css";
const Index = () => {
  const [token, setToken] = useState<string | null>(null);
  const [topTracks, setTopTracks] = useState([]);

  const [audio, setAudio] = useState<HTMLAudioElement | undefined>(undefined);
  const [audioState, setAudioState] = useState(false);
  const [playingId, setPlayingId] = useState("");

  useEffect(() => {
    const tokenJson = window.localStorage.getItem("spAuth");

    if (tokenJson !== null) {
      const token = JSON.parse(tokenJson);
      setToken(token.access_token);
    }
  }, []);

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
    const redirect_uri = "http://localhost:3000/callback";

    const state = generateRandomString(16);
    const scope = "user-top-read user-read-recently-played user-read-private";

    window.location.href =
      "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state,
      });
  }

  async function getTopTracks(timeRange: string) {
    const response = await axios.get(
      `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}}`,
        },
      }
    );

    console.log(response.data.items);

    setTopTracks(response.data.items);
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
      {!token && <button onClick={loginWithSpotify}>Login with Spotify</button>}
      {token && (
        <div>
          <br />
          <br />
          <button onClick={() => getTopTracks("short_term")}>
            Top Tracks (last 4 weeks)
          </button>

          <button onClick={() => getTopTracks("medium_term")}>
            Top Tracks (last 6 months)
          </button>

          <button onClick={() => getTopTracks("long_term")}>
            Top Tracks (All Time)
          </button>
          <br />
          <br />

          {topTracks &&
            topTracks.map((topTrack: any, index: number) => {
              return (
                <div
                  className="trackContainer"
                  style={{
                    backgroundColor: "#333",
                  }}
                  key={topTrack.id}
                >
                  <button
                    disabled={playingId !== "" && playingId !== topTrack.id}
                    className="playButton"
                    onClick={() => {
                      audioState
                        ? stopPreview()
                        : playPreview(topTrack.preview_url, topTrack.id);
                    }}
                  >
                    {playingId !== "" && playingId === topTrack.id && audioState
                      ? "Pause Preview"
                      : "Play Preview"}
                  </button>
                  <div>
                    {index + 1}
                    {". "}
                    {topTrack.name}
                    {" - "}
                    {topTrack.artists.map((artist: any, index: number) => {
                      return (
                        <React.Fragment key={index}>
                          {artist.name}{" "}
                        </React.Fragment>
                      );
                    })}
                  </div>
                  <img
                    src={topTrack.album.images[0].url}
                    alt="album-img"
                    height={70}
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

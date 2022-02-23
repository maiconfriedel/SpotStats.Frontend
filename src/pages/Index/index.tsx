import React, { useEffect, useState } from "react";
import querystring from "query-string";
import axios from "axios";

import "./index.css";
const Index = () => {
  const [token, setToken] = useState<string | null>(null);
  const [topTracks, setTopTracks] = useState([]);

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
    const client_id = "";
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

    setTopTracks(response.data.items);
  }

  return (
    <div className="container">
      {!token && <button onClick={loginWithSpotify}>Login with Spotify</button>}
      {token && (
        <div>
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
          <button>Top Artists</button>

          {topTracks &&
            topTracks.map((topTrack: any) => {
              return (
                <p key={topTrack.id}>
                  {" "}
                  {topTrack.name} -{" "}
                  {topTrack.artists.map((artist: any) => {
                    return artist.name;
                  })}{" "}
                </p>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default Index;

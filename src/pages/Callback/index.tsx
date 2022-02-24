import React, { useEffect } from "react";
import axios from "axios";
import { Buffer } from "buffer";
import querystring from "query-string";
import { useNavigate } from "react-router-dom";
import { client_id, client_secret } from "../../config/spotify";

import useQuery from "../../utils/useQuery";

const Callback = () => {
  const query = useQuery();
  const navigate = useNavigate();

  const redirect_uri = "http://localhost:3000/callback";

  useEffect(() => {
    async function getToken() {
      const response = await axios.post(
        "https://accounts.spotify.com/api/token",
        querystring.stringify({
          code: query.get("code"),
          redirect_uri,
          grant_type: "authorization_code",
        }),
        {
          headers: {
            Authorization:
              "Basic " +
              Buffer.from(client_id + ":" + client_secret).toString("base64"),
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      window.localStorage.setItem("spAuth", JSON.stringify(response.data));
      navigate("/");
    }

    getToken();
  }, [query, navigate]);

  return <div></div>;
};

export default Callback;

// This file is for accessing the Spotify API and posting playlists to a visitor's Spotify account.

import axios from "axios";

function generateRandomNumber(number) {
  const randomNum = Math.floor(Math.random() * number);
  return randomNum;
}

const spotifyCall = async (searchGenre, authorization) => {
  // authentications, URLs, and other necessary components
  // go to Spotify Developer Site to get Auth Key, which will need to be refreshed per Spotify guidelines
  const mainAuth = authorization;
  const mainUrl = "https://api.spotify.com/v1/search?";
  const mainConfig = {
    params: {
      q: `genre: ${searchGenre}`,
      type: "track",
      limit: 50,
      offset: generateRandomNumber(950),
    },
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${mainAuth}`,
    },
  };

  const spotifyResult = await axios.get(mainUrl, mainConfig);
  const spotifyData = spotifyResult;

  return spotifyData;
};

export { spotifyCall };

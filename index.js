//imports and Express

import {
  typeConversion,
  findPokemonTypes,
  convertToUppercase,
} from "./modules/conversion.mjs";
import { spotifyCall } from "./modules/spotify.mjs";
import express from "express";
import axios from "axios";
import store from "store2";

import * as dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set("view engine", "ejs");

//throughout files, you'll see "localhost:3000/{pathname}"; this is
app.listen(3000, () => {
  console.log("Port 3000 active.");
});

app.get("/", (req, res) => {
  res.render("landing.ejs");
});

//Note for using Spotify Api: the steps to register, approve, and use an app with Spotify are strict and complex. Be sure to read the documentation at https://developer.spotify.com/documentation/ to understand what is necessary and why.

//user has to allow Spotify to view account data in order for authorization token to remain active and/or refresh
//These values will need to be obtained from Spotify:

const authClientID = process.env.API_CLIENTID;
const clientSecret = process.env.API_CLIENTSECRET;

//Provide this to Spotify when ready:
const redirectURI = process.env.API_SPOTIFYREDIRECT;

//user logins to Spotify and gives PokePlaylist permission to view account and create/update playlists
app.get("/login", (req, res) => {
  const authUrl = "https://accounts.spotify.com/en/authorize?";
  const authParams = new URLSearchParams({
    response_type: "code",
    client_id: authClientID,
    redirect_uri: redirectURI,
    scope: "playlist-modify-public playlist-modify-private",
  });

  const loginUrl = authUrl + authParams.toString();

  res.redirect(loginUrl);
});

//once user logins and provides permission, PokePlaylist will route to authorization page to acquire access and refresh codes; more details are provided at https://developer.spotify.com/documentation/general/guides/authorization/code-flow/. PokePlaylist uses OAuth with scopes.
app.get("/authresult", async (req, res) => {
  const resultCode = req.query.code;

  const tokenUrl = "https://accounts.spotify.com/api/token";
  const tokenParams = new URLSearchParams({
    grant_type: "authorization_code",
    code: resultCode,
    redirect_uri: "http://localhost:3000/authresult",
  });

  const authorizationBuffer = Buffer.from(
    authClientID + ":" + clientSecret
  ).toString("base64");
  const authorizationHeader = `Basic ${authorizationBuffer}`;

  await axios
    .post(tokenUrl, tokenParams, {
      headers: {
        Authorization: authorizationHeader,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((response) => {
      const accessToken = response.data["access_token"];
      const refreshToken = response.data["refresh_token"];

      store.local.set("accessToken", accessToken);
      store.local.set("refreshToken", refreshToken);

      //getting the current time so that when /check_for_refresh is called, we have a starting time to refer
      const currentDate = new Date();
      const tokenTime = currentDate.getTime();
      store.local.set("tokenGeneratedTime", tokenTime);

      res.redirect("http://localhost:3000/main");
    })
    .catch((error) => {
      const errorMessage = error;
      res.render("error.ejs", { errorMessage });
      return errorMessage;
    });
});

// refresh authentication; when the user completes a playlist creation or encounters an error, they will be shown a button to return to the main page; when this button is clicked, PokePlaylist will do a quick check to see if access needs to be refreshed per Spotify API guidelines. If so, a refresh will occur according to guidelines.

app.get("/check_for_refresh", async (req, res) => {
  const loginDate = new Date();
  const newLoginTime = loginDate.getTime();
  const oldLoginTime = store("tokenGeneratedTime");
  const loginTimeDiff = (newLoginTime - oldLoginTime) / 1000;
  const loginTimeDiffMin = loginTimeDiff / 60;
  console.log(`it has been ${loginTimeDiffMin} minutes since last login`);

  if (loginTimeDiffMin >= 60) {
    const refreshURL = "http://localhost:3000/refresh_token";
    res.redirect(refreshURL);
  } else {
    res.redirect("http://localhost:3000/main");
  }
});

app.get("/refresh_token", async (req, res) => {
  const refreshToken = store("refreshToken");

  const tokenUrl = "https://accounts.spotify.com/api/token";
  const tokenParams = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const authorizationBuffer = Buffer.from(
    authClientID + ":" + clientSecret
  ).toString("base64");
  const authorizationHeader = `Basic ${authorizationBuffer}`;

  await axios
    .post(tokenUrl, tokenParams, {
      headers: {
        Authorization: authorizationHeader,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((response) => {
      res.redirect("http://localhost:3000/main");
    })
    .catch((error) => {
      const errorMessage = error;
      res.render("error.ejs", { errorMessage });
      console.log(error);
      return errorMessage;
    });
});

//the main page, where everything goes when authentications and playlist creation are complete
app.get("/main", (req, res) => {
  res.render("index.ejs");
});

//a page to display the Pokemon of choice, and to ask the user to confirm their choice before going to the next steps
app.post("/confirm_pokemonchoice", (req, res) => {
  const { pokemon } = req.body;
  if (!pokemon) {
    res.render("error.ejs");
  }

  const pokemonChoice = convertToUppercase(pokemon);
  const pokemonTypes = findPokemonTypes(pokemon);

  pokemonTypes
    .then((response) => {
      const firstType = response["firstType"];
      const secondType = response["secondType"];

      //what's up with pokeDataToRender: this object will contain the values we need to pass to confirm.ejs. However, there are plenty of Pokemon that have a single type, so we need to accomodate the question of how to handle both single-and-double-typed Pokemon.

      const pokeDataToRender = {
        firstPokemonType: convertToUppercase(firstType),
        secondPokemonType: secondType,
        pokemonImage: response["pokemonImage"],
        choiceName: pokemonChoice,
      };
      if (response.length == 1) {
        delete pokeDataToRender.secondPokemonType;
      } else {
        pokeDataToRender.secondPokemonType = convertToUppercase(secondType);
      }
      store.local.set("pokemonImage", pokeDataToRender.pokemonImage);
      store.local.set("pokeChoiceName", pokeDataToRender.choiceName);
      res.render("confirm.ejs", { pokeDataToRender });
    })
    .catch((error) => {
      const errorMessage = error;
      res.render("error.ejs", { errorMessage });
      console.log(errorMessage);
      return errorMessage;
    });
});

//page that makes requests to Spotify API to search for tracks, create a playlist for the user, and then adds found tracks to that playlist

app.post("/create_pokeplaylist", async (req, res) => {
  const ppAuth = store("accessToken");
  const { pokemon } = req.body;

  // pokeNameFinal is set to pokemon as the pass value is already capitalized as needed. When setting up pokeName, we need to bring it back to lowercase form for api Calls
  const pokeNameFinal = pokemon;
  const pokeName = pokemon
    .toLowerCase()
    .replace(/^\s+|\s+$/g, "")
    .replace(/\s+/g, "-")
    .replace(/["]+/g, "");

  const apiUrl = `https://pokeapi.co/api/v2/pokemon/${pokeName}/`;
  await axios
    .get(apiUrl)
    .then(async (response) => {
      const pokeType = response.data.types[0].type.name;

      await axios
        .get("https://api.spotify.com/v1/me", {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${ppAuth}`,
          },
        })
        .then(async (response) => {
          const user_id = response.data["id"];

          const cpAuth = store("accessToken");

          await axios
            .post(
              `https://api.spotify.com/v1/users/${user_id}/playlists`,
              {
                name: `Playlist for ${pokeNameFinal}`,
                description: "Playlist created from PokePlaylist",
                public: false,
              },
              {
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${cpAuth}`,
                },
              }
            )
            .then((response) => {
              const playlist = response.data;
              const playlistID = playlist["id"];
              const searchGenre = `${typeConversion[pokeType]}`;

              const searchAuth = store("accessToken");

              //spotify call is made via function from spotify.mjs
              spotifyCall(searchGenre, searchAuth).then(async (response) => {
                const makeTrackList = function (response) {
                  const maxNumTracks = response.data.tracks["limit"];
                  const trackList = [];
                  for (let i = 0; i < maxNumTracks; i++) {
                    const responseItems = response.data.tracks.items[i]["uri"];
                    trackList.push(responseItems);
                  }
                  return trackList;
                };

                const tracksForPlaylist = [
                  ...new Set(makeTrackList(response).flat()),
                ];

                await axios
                  .post(
                    `https://api.spotify.com/v1/playlists/${playlistID}/tracks`,
                    { uris: tracksForPlaylist },
                    {
                      headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${cpAuth}`,
                      },
                    }
                  )
                  .then((response) => {
                    const pokeDisplayImage = store("pokemonImage");
                    const choiceName = store("pokeChoiceName");
                    const snapshotID = response.data;
                    console.log("playlist creation succesful", snapshotID);
                    const playlistURL = `https://open.spotify.com/playlist/${playlistID}`;
                    res.render("playlist.ejs", {
                      playlistLink: playlistURL,
                      pokeDisplayImage,
                      choiceName,
                    });
                  });
              });
            });
        });
    })

    .catch((error) => {
      const errorMessage = error;
      res.render("error.ejs", { errorMessage });
      console.log(errorMessage);
      return errorMessage;
    });
});

# Welcome to PokePlaylist!

Key Technologies Needed: Javascript | NodeJS/Express | CSS

PokePlaylist utilizes two APIs to provide users with a custom playlist based on their favorite Pokemon:

1. PokeAPI - this API is the leader in collecting information related to the popular game/tv franchise of Pokemon.
2. SpotifyAPI - Spotify's API allows developers to perform a variety of tasks related to Spotify songs, playlists, and more.

By combining the efforts of these two tools, PokePlaylist is able to take a user's chosen Pokemon, identify search terms based on PokeAPI results, and locate songs to add to their Spotify playlist.

# Detailed User Path

1. Using OAuth 2.0 authentication, PokePlaylist will ask the user to allow Spotify access:

![ppspotifycapture](https://user-images.githubusercontent.com/102998600/218354638-c9dc12ae-ecbb-420d-9d43-1e6073a71aaa.PNG)

2. User enters name of a Pokemon they want a playlist for: 

![ppcharizardonecapture](https://user-images.githubusercontent.com/102998600/218354865-10cf7b0c-4236-40d7-a033-55baec050b20.PNG)

3. PokePlaylist will contact PokeAPI for information related to that Pokemon, then present a confirmation screen to the user: 

![ppcharizardtwocapture](https://user-images.githubusercontent.com/102998600/218355614-6790139d-ed64-4d02-bfdc-e3f577b7a26a.PNG)

4. After confirmation, PokePlaylist will contact Spotify to create a playlist, search for songs based on the Pokemon selected, then add songs to the created playlist. Once complete, the user will be provided the opportunity to go to their Spotify page and see the playlist:

![ppcharizardthreecapture](https://user-images.githubusercontent.com/102998600/218357008-c6b3861e-6c9f-41f4-ad66-be0ce6dc7c67.PNG)

# For Developers

Feel free to borrow this code and play with it yourself! This was an early project of mine, so there's probably ways to improve it.

In order to use PokeAPI and SpotifyAPI, you'll need to check out their documentation for policies and access:
- PokeAPI: https://pokeapi.co/docs/v2
- SpotifyAPI: https://developer.spotify.com/ 
  *Note: I've recently discovered that while testing Spotify, you'll be running the app in "developer mode" which means anyone testing your app has to be individually added as an authorized user. See the documentation and developer hub for more details.*

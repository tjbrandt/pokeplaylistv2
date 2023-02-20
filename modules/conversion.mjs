// These are "tables" that contain converted Pokemon elements for use in the Spotify API:
// 1. Type: Each Pokemon has one or more "elemental" types associated with it, and these correspond to different music genres based on the overlapping emotion/feeling between the two. The resulting conversion will be used to filter Spotify search results by "genre".

import axios from "axios";

async function findPokemonTypes(pokemon) {
  const pokeName = String(pokemon).replace(/\s+/g, "-").replace(/["]+/g, "");
  const pokeAPIURL = `https://pokeapi.co/api/v2/pokemon/${pokeName}/`;
  const pokemonData = await axios.get(pokeAPIURL);
  const pokeNumResults = pokemonData.data.types;
  const pokemonImageURL =
    pokemonData.data.sprites.other["official-artwork"]["front_default"];
  const pokeTypeOne = pokemonData.data.types[0].type.name;
  let pokemonTypesAndImage = {};
  if (pokeNumResults.length == 2) {
    const pokeTypeTwo = pokemonData.data.types[1].type.name;
    pokemonTypesAndImage = {
      firstType: pokeTypeOne,
      secondType: pokeTypeTwo,
      pokemonImage: `${pokemonImageURL}`,
      length: 2,
    };

    return pokemonTypesAndImage;
  } else {
    pokemonTypesAndImage = {
      firstType: pokeTypeOne,
      pokemonImage: `${pokemonImageURL}`,
      length: 1,
    };

    return pokemonTypesAndImage;
  }
}

function convertToUppercase(name) {
  const pokeNameReplace = name.replace(/\s+/g, "-").replace(/["]+/g, "");
  const pokeNameSep = pokeNameReplace.split("-");
  const pokeNameUppercase = function (name) {
    for (let i = 0; i < name.length; i++) {
      name[i] = name[i][0].toUpperCase() + name[i].slice(1);
    }
    const combinedName = name.join(" ");

    return combinedName;
  };
  const pokeNameFinal = pokeNameUppercase(pokeNameSep);
  return pokeNameFinal;
}

const typeConversion = {
  normal: "boy band",
  fighting: "gymcore",
  flying: "detroit house",
  poison: "bass electronica",
  ground: "rock",
  rock: "nu metal",
  bug: "vgm instrumental",
  ghost: "witch house",
  steel: "thrash metal",
  fire: "dance electric",
  water: "shanty",
  grass: "organic house",
  electric: "techno",
  psychic: "psybass",
  ice: "modular synth",
  dragon: "metalcore",
  dark: "phonk",
  fairy: "pop",
};

export { typeConversion, findPokemonTypes, convertToUppercase };

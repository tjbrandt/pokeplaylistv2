// These are "tables" that contain converted Pokemon elements for use in the Spotify API:
// 1. Type: Each Pokemon has one or more "elemental" types associated with it, and these correspond to different music genres based on the overlapping emotion/feeling between the two. The resulting conversion will be used to filter Spotify search results by "genre".
// 2. Habitat: The habitat a Pokemon lives in can overlap with different ambiences in music, even within the same genre (think different types of rock or hip-hop). The resulting conversion will be a part of the query string sent to the Spotify API.
// Elements not being converted (ex. Pokemon abilities) will be inserted as part of the query string to Spotify API. Other elements may need to be converted that are not part of the current build, but that is a bridge to cross when arrived.

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

//TODO figure out dual-typing system. Current issue is that combining two genres directly doesn't usually lead to results (ex. there's no songs in Spotify that work for a Fire/Ghost type, as there's no result that meets both "dance electric" and "witch house"). Current ideas a) establish extra entries in typeConversion or make new array for combined types with their own types (ex. Fire/Ghost might become "rave" genre ), b) set a check for a dual-type pokemon, takes its primary type and uses a different genre, but doesn't use/consider second type (ex. Fire/Ghost becomes a variant of "dance electric", but not necessarily a variant related to "witch house" )

const habitatConversion = {
  cave: "hollow",
  forest: "calm",
  grassland: "orchestral",
  mountain: "intense",
  rare: "epic",
  "rough-terrain": "desert",
  sea: "ocean",
  urban: "city",
  "waters-edge": "water",
};

export {
  typeConversion,
  habitatConversion,
  findPokemonTypes,
  convertToUppercase,
};

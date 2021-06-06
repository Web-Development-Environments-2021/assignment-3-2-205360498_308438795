const axios = require("axios");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";
const league_utils = require("./league_utils");

/*
  this function will get all the players id in this team
*/
async function getPlayerIdsByTeam(team_id) {
  let player_ids_list = [];
  const team = await axios.get(`${api_domain}/teams/${team_id}`, {
    params: {
      include: "squad",
      api_token: process.env.api_token,
    },
  });
  team.data.data.squad.data.map((player) =>
    player_ids_list.push(player.player_id)
  );
  return player_ids_list;
}

/*
  this function will get all the players info that we need
*/
async function getPlayersInfo(players_ids_list) {
  let promises = [];
  players_ids_list.map((id) =>
    promises.push(
      axios.get(`${api_domain}/players/${id}`, {
        params: {
          api_token: process.env.api_token,
          include: "team",
        },
      })
    )
  );
  let players_info = await Promise.all(promises);
  return extractRelevantPlayerData(players_info);
}

/*
  this function will get all the players info that we need
  from all the data
*/
function extractRelevantPlayerData(players_info) {
  return players_info.map((player_info) => {
    const { fullname, image_path, position_id } = player_info.data.data;
    const { name } = player_info.data.data.team.data;
    return {
      name: fullname,
      image: image_path,
      position: position_id,
      team_name: name,
    };
  });
}

/*
  this function will get all the players from a team
*/
async function getPlayersByTeam(team_id) {
  let player_ids_list = await getPlayerIdsByTeam(team_id);
  let players_info = await getPlayersInfo(player_ids_list);
  return players_info;
}

/*
  this function will get players by name
*/
async function getplayersByName(name) {
  let players_list = [];
  // get all the players that have the search name
  const players = await axios.get(`${api_domain}/players/search/${name}`, {
    params: {
      api_token: process.env.api_token,
      include: "team,position",
    },
  });
  // loop on every player
  for(const player of players.data.data){
    let team_id;
    let team_name;
    let position_id;
    let position_name;
    // if dont have a team
    if(player.team == undefined){
      team_name = null;
      team_id = null;
    }
    else{
      team_name = player.team.data.name;
      team_id = player.team.data.id;
    }
    // if dont have position
    if(player.position == undefined){
      position_id = null;
      position_name = null;
    }
    else{
      position_id = player.position.data.id;
      position_name = player.position.data.name;
    }
    // make the json
    players_list.push({"firstname": player.firstname, "lastname": player.lastname,"image_path": player.image_path ,
    "team_name": team_name, "position_num": position_id,"position_name": position_name})  
  }
  return players_list;
}

exports.getPlayersByTeam = getPlayersByTeam;
exports.getPlayersInfo = getPlayersInfo;
exports.getplayersByName = getplayersByName;

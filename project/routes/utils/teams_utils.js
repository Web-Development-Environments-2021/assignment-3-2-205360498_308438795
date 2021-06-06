const axios = require("axios");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";
const LEAGUE_ID = 271;
const DButils = require("./DButils");
const events_utils = require("./events_utils");
const referee_utils = require("./referee_utils");
const match_utils = require("./match_utils");

/*
  this function will get teams that have the search name
*/
async function getTeamsByName(name) {
    let teams_list = [];
    const teams = await axios.get(`${api_domain}/teams/search/${name}`, {
      params: {
        api_token: process.env.api_token,
        include: "league",
      },
    });
    // make the json
    teams.data.data.forEach(team => {
        if(team.league && team.league.data.id === LEAGUE_ID){
          teams_list.push({Team_Id:team.id ,Team_name: team.name, Team_img: team.logo_path})  
        }
    });
    return teams_list;
}

/*
  this function will get all team past matches
*/
async function getPastMatches(team_id){
  let array_of_matches = [];
  const matches = await DButils.execQuery(`SELECT * FROM dbo.matches 
  WHERE Played = 1 AND (HomeTeam_Id = '${team_id}' OR AwayTeam_Id ='${team_id}')`);
  for(const match of matches){
    let jason_match = await match_utils.createMatch(match);
    array_of_matches.push(jason_match);
  }
  return array_of_matches;
}

/*
  this function will get all team future matches
*/
async function getNextMatches(team_id){
  let array_of_matches = [];
  const matches = await DButils.execQuery(`SELECT * FROM dbo.matches 
  WHERE Played = 0 AND (HomeTeam_Id = '${team_id}' OR AwayTeam_Id ='${team_id}')`);
  for(const match of matches){
    let jason_match = await match_utils.createMatchPrev(match);
    array_of_matches.push(jason_match);
  }
  return array_of_matches;
}

/*
  this function will get all team matches
*/
async function getAllMatches(team_id){
    let past_matches_array = [];
    let next_matches_array = [];
    past_matches_array = await getPastMatches(team_id);
    next_matches_array = await getNextMatches(team_id);
    return {past_matches:past_matches_array,
            next_matches:next_matches_array
    };
}

/*
  this function will get team name from outside api 
*/
async function getTeamNameFromApi(teamId){
  let teamName = await axios.get(
      `https://soccer.sportmonks.com/api/v2.0/teams/${teamId}`,
      {
        params: {
          api_token: process.env.api_token,
        },
      })

  return teamName.data.data.name;   
}

/*
  this function will get team name and image from outside api 
*/
async function getTeamNameAndImgFromApi(teamId){

  let team = await axios.get(
      `https://soccer.sportmonks.com/api/v2.0/teams/${teamId}`,
      {
        params: {
          api_token: process.env.api_token,
        },
      })

  return {name:team.data.data.name,
          img_url:team.data.data.logo_path
  };   
}

exports.getTeamNameAndImgFromApi = getTeamNameAndImgFromApi;
exports.getTeamNameFromApi = getTeamNameFromApi;
exports.getTeamsByName = getTeamsByName;
exports.getAllMatches = getAllMatches;
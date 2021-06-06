const { match } = require("assert");
const axios = require("axios");
const match_utils = require("./match_utils");
const LEAGUE_ID = 271;

/*
  this function will get all the maches in db
  the matches is split to past and next matches
*/
async function getStageMatches(){
  let matches = await match_utils.getCurrentStageMatches();
  return matches;
}

/*
  this function will check if the given team is from league 271
*/
async function teamIsInLeague(team_id){
  // get league from outside server
  const league = await axios.get(
    `https://soccer.sportmonks.com/api/v2.0/teams/${team_id}/current`,
    {
      params: {
        api_token: process.env.api_token,
      },
    }
  );
  // if this team is not belong to any league
  if(league.data.data[0] == null){
    return false;
  }
  let team_league = league.data.data[0].league.data.id;
  // if the team belong to other league
  if(team_league != LEAGUE_ID){
    return false;
  }
  return true;
}

/*
  this function will get all league details
*/
async function getLeagueDetails() {
  // get league details
  const league = await axios.get(
    `https://soccer.sportmonks.com/api/v2.0/leagues/${LEAGUE_ID}`,
    {
      params: {
        include: "season",
        api_token: process.env.api_token,
      },
    }
  );
  let stage;
  let stage_name;
  // if there is non current stage in league
  if(league.data.data.current_stage_id != null){
    stage = await axios.get(
      `https://soccer.sportmonks.com/api/v2.0/stages/${league.data.data.current_stage_id}`,
      {
        params: {
          api_token: process.env.api_token,
        },
      }
    );
    stage_name = stage.data.data.name;
  }
  else{
    stage = null;
    stage_name = null;
  }
  // get the most near game that going to play
  let nextGameDeatails = await match_utils.getNextGameDetails(); 

  return {
    league_name: league.data.data.name,
    current_season_name: league.data.data.season.data.name,
    current_stage_name: stage_name,
    nextGameDeatails: nextGameDeatails
  };
}

exports.teamIsInLeague = teamIsInLeague;
exports.getStageMatches = getStageMatches;
exports.getLeagueDetails = getLeagueDetails;

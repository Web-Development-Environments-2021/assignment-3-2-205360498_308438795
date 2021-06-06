const { match } = require("assert");
const axios = require("axios");
const match_utils = require("./match_utils");
const LEAGUE_ID = 271;


async function getStageMatches(){
  let matches = await match_utils.getCurrentStageMatches();
  return matches;
}


async function teamIsInLeague(team_id){
  const league = await axios.get(
    `https://soccer.sportmonks.com/api/v2.0/teams/${team_id}/current`,
    {
      params: {
        api_token: process.env.api_token,
      },
    }
  );
  if(league.data.data[0] == null){
    return false;
  }
  let team_league = league.data.data[0].league.data.id;
  if(team_league != LEAGUE_ID){
    return false;
  }
  return true;
  
}

async function getLeagueDetails() {
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

  let nextGameDeatails = await match_utils.getNextGameDetails(); // table or param ?!?!?

  return {
    league_name: league.data.data.name,
    current_season_name: league.data.data.season.data.name,
    current_stage_name: stage_name,
    // next game details should come from DB
    nextGameDeatails: nextGameDeatails

  };
}

exports.teamIsInLeague = teamIsInLeague;
exports.getStageMatches = getStageMatches;
exports.getLeagueDetails = getLeagueDetails;

const { match } = require("assert");
const axios = require("axios");
const match_utils = require("./match_utils");
const LEAGUE_ID = 271;


async function getStageMatches(){
  let matches = await match_utils.getCurrentStageMatches();
  



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
  const stage = await axios.get(
    `https://soccer.sportmonks.com/api/v2.0/stages/${league.data.data.current_stage_id}`,
    {
      params: {
        api_token: process.env.api_token,
      },
    }
  );

  let nextGameDeatails = await match_utils.getNextGameDetails(); // table or param ?!?!?

  return {
    league_name: league.data.data.name,
    current_season_name: league.data.data.season.data.name,
    current_stage_name: stage.data.data.name,
    // next game details should come from DB
    nextGameDeatails: nextGameDeatails

  };
}

exports.getStageMatches = getStageMatches;
exports.getLeagueDetails = getLeagueDetails;

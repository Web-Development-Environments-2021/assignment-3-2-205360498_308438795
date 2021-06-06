var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const players_utils = require("./utils/players_utils");
const teams_utils = require("./utils/teams_utils");

router.get("/teamFullDetails/:teamId", async (req, res, next) => {
  let team_details = [];
  let team_id = req.params.teamId;
  try {
    // check if teams belong to the league
    const TeamFromCurrLeague = await league_utils.teamIsInLeague(team_id);
    if(!TeamFromCurrLeague){
    res.status(400).send("The id of the Team is not from our league!");
      return;
    }
    // const team_name = await teams_utils.getTeamNameFromApi(team_id);
    const team = await teams_utils.getTeamNameAndImgFromApi(team_id);
    let team_name = team.name;
    let team_img = team.img_url;
    let teamPrev = {
      Team_Id:team_id,
      Team_name:team_name,
      Team_img:team_img
    };
    const team_players = await players_utils.getPlayersByTeam(team_id);
    const team_matches = await teams_utils.getAllMatches(team_id);
    const return_json = {
      TeamPrev:teamPrev,
      Team_players:team_players,
      Team_matches:team_matches
    };
    res.send(return_json);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const match_utils = require("./utils/match_utils")
const league_utils = require("./utils/league_utils");
const referee_utils = require("./utils/referee_utils");

/**
 * Authenticate for associationMember requests by middleware
 */
 router.use(async function (req, res, next) {
    try{
      DButils.execQuery(`SELECT permission_char FROM dbo.Permissions WHERE user_id = '${req.session.user_id}'`)
      .then((permissons) => {
        if (permissons.find((x) => x.permission_char === 'A')) {
          next();
        }else{
          res.status(403).send("only association Member can use this function")
          return;
        }
      })
    } catch (error) {
      next(error);  
    }
  });


/**
 * This path gets body with match deatails and save this match in the DB
 */
 router.post("/addMatch", async (req, res, next) => {
    try {
      const match_date = req.body.date;
      const dateIsGood = await match_utils.dateOfTheMatchIsGood(match_date);
      if(!dateIsGood){
        res.status(400).send("The date that given is already gone");
        return;
      }
      // need to check if the user is auth to add match to DB
      const match_deatails = req.body;
      // check if teams belong to the league
      const homeTeamFromCurrLeague = await league_utils.teamIsInLeague(match_deatails.home_team);
      if(!homeTeamFromCurrLeague){
        res.status(400).send("The id of the home Team is not from our league!");
        return;
      }
      const awayTeamFromCurrLeague = await league_utils.teamIsInLeague(match_deatails.away_team);
      if(!awayTeamFromCurrLeague){
        res.status(400).send("The id of the away Team is not from our league!");
        return;
      }
      const refereeExist = await referee_utils.checkIfRefereeExist(match_deatails.referee);
      if(!refereeExist){
        res.status(400).send("The id of the referee is not exist");
        return;
      }
      //
      // to check if need to make sure that the referee is free in this date
      //
      await match_utils.addMatchToDB(match_deatails);
      res.status(201).send("The match successfully saved");
    } catch (error) {
      next(error);
    }
  });
  

  /**
   * This path gets body with match deatails and save this match in the DB
   */
   router.put("/updateMatch", async (req, res, next) => {
    try {
      const match_id = req.body.match_id;
      // need to check if the match exsist in db
      const match_in_db = await match_utils.checkiFMatchExist(match_id);
      if(!match_in_db){
        res.status(400).send("The match_id not found in db");
        return;
      }
      const match_already_past_the_date = await match_utils.matchPastTheDate(match_id);
      if(!match_already_past_the_date){
        res.status(400).send("The date of the match was not past and the match was not played");
        return;
      }
      const match_deatails = req.body;
      let home_team_goals = match_deatails.home_team_goals;
      let away_team_goals = match_deatails.away_team_goals;
      if(home_team_goals < 0 || !Number.isInteger(home_team_goals)){
        res.status(400).send("The home_team_goals is not valid");
        return;
      }
      if(away_team_goals < 0 || !Number.isInteger(away_team_goals)){
        res.status(400).send("The away_team_goals is not valid");
        return;
      }
      await match_utils.updateMatchInDB(match_deatails);
      await match_utils.removeMatchFromFavorite(match_id);
      res.status(200).send("The match update successfully");
    } catch (error) {
      next(error);
    }
  });

/**
 * This path gets body with match deatails and save this match in the DB
 */
 router.post("/addReferee", async (req, res, next) => {
  try {

    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    let refereeExist = await referee_utils.checkIfRefereeExistWithSameName(first_name,last_name);
    if(refereeExist){
      res.status(200).send("The referee is in db");
      return;
    }
    await referee_utils.addRefereeToDB(first_name,last_name);
    res.status(201).send("The Referee successfully saved");
  } catch (error) {
    next(error);
  }
});

module.exports = router;
var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const users_utils = require("./utils/users_utils");
const players_utils = require("./utils/players_utils");
const match_utils = require("./utils/match_utils");
const favoriteMatches_utils = require("./utils/favoriteMatches_utils");

/**
 * This path gets body with playerId and save this player in the favorites list of the logged-in user
 */
 router.post("/players", async (req, res, next) => {
    try {
      const user_id = req.session.user_id;
      const player_id = req.body.playerId;
      await users_utils.markPlayerAsFavorite(user_id, player_id);
      res.status(201).send("The player successfully saved as favorite");
    } catch (error) {
      next(error);
    }
  });
  
  /**
   * This path returns the favorites players that were saved by the logged-in user
   */
  router.get("/players", async (req, res, next) => {
    try {
      const user_id = req.session.user_id;
      let favorite_players = {};
      const player_ids = await users_utils.getFavoritePlayers(user_id);
      let player_ids_array = [];
      player_ids.map((element) => player_ids_array.push(element.player_id)); //extracting the players ids into array
      const results = await players_utils.getPlayersInfo(player_ids_array);
      res.status(200).send(results);
    } catch (error) {
      next(error);
    }
  });
    /**
   * This path returns the favorites matches that were saved by the logged-in user
   */
  router.get("/matches", async (req, res, next) => {
    try {
      const user_id = req.session.user_id;
      // let favorite_players = {};
      const matches_ids = await users_utils.getFavoriteMatches(user_id);
      let matches_ids_array = [];
      matches_ids.map((element) => matches_ids_array.push(element.MatchId)); //extracting the matches ids into array
      // check if user doesnt have favorite matches
      if(matches_ids_array.length==0){
        res.status(204).send("there is no favorite matches")
      }
      const results = await match_utils.getMatchesInfo(matches_ids_array);
      res.status(200).send(results);
    } catch (error) {
      next(error);
    }
  });
  
  
  /**
 * This path gets body with MatchId and save this match in the favorites list of the logged-in user
 */
  router.post("/matches", async (req, res, next) => {
    try {
      const user_id = req.session.user_id;
      const match_id = req.body.match_id;
      let matchExist = await match_utils.checkiFMatchExist(match_id); 
      if(!matchExist){
        res.status(400).send("worng input parameters");
        // match not in DB
        return;
      }
      let match_was_played = await match_utils.matchPastTheDate(match_id);
      if(match_was_played){
        res.status(400).send("the match is already played and cant be added to favorite");
        return;
      }
      let matchAlreadyInFavorites = await favoriteMatches_utils.checkIfMatchInFavo(user_id,match_id);
      if(matchAlreadyInFavorites){
        res.status(204).send("match already in your favorite list");
        return;
      }
      await users_utils.markMatchAsFavorite(user_id, match_id);
      res.status(201).send("The match successfully saved as favorite");
    } catch (error) {
      next(error);
    }
  });

  module.exports = router;
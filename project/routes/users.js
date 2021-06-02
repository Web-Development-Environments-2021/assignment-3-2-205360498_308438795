var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const users_utils = require("./utils/users_utils");
const players_utils = require("./utils/players_utils");
const match_utils = require("./utils/match_utils")

/**
 * Authenticate all incoming requests by middleware
 */
router.use(async function (req, res, next) {
  if (req.session && req.session.user_id) {
    DButils.execQuery("SELECT user_id FROM dbo.users")
      .then((users) => {
        if (users.find((x) => x.user_id === req.session.user_id)) {
          req.user_id = req.session.user_id;
          next();
        }
      })
      .catch((err) => next(err));
  } else {
    res.sendStatus(401);
  }
});

//
const association_Member = require("./associationMember");
router.use("/associationMember", association_Member);


/**
 * This path gets body with playerId and save this player in the favorites list of the logged-in user
 */
router.post("/favoritePlayers", async (req, res, next) => {
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
router.get("/favoritePlayers", async (req, res, next) => {
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

router.get("/favoriteMatches", async (req, res, next) => {
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



router.post("/favoriteMatches", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const match_id = req.body.match_id;
    let matchExist = await match_utils.checkiFMatchExist(match_id); 
    if(!matchExist){
      res.status(400).send("worng input parameters")
      return;
    }
    let matchAlreadyInFavorites = await users_utils.checkIfMatchInFavo(user_id,match_id);
    if(!matchAlreadyInFavorites){
      res.status(204).send("match already in your favorite list")
      return;
    }
    await users_utils.markMatchAsFavorite(user_id, match_id);
    res.status(201).send("The match successfully saved as favorite");
  } catch (error) {
    next(error);
  }
});



/**
 * This path gets get All Matches in the DB
 */
router.get("/getAllMatches", async (req, res, next) => {
  try {
    const matches = await match_utils.getAllMatches();
    res.status(201).send(matches);
  } catch (error) {
    next(error);
  }
});

// /**
//  * This path gets body with team_id and save this team in the favorites list of the logged-in user
//  */
// router.post("/favoriteTeam", async (req, res, next) => {
//   try {
//     const user_id = req.session.user_id;
//     const team_id = req.body.team_id;
//     await users_utils.markTeamAsFavorite(user_id, team_id);
//     res.status(201).send("The team successfully saved as favorite");
//   } catch (error) {
//     next(error);
//   }
// });

// /**
//  * This path returns the favorites teams that were saved by the logged-in user
//  */
// router.get("/favoriteTeam", async (req, res, next) => {
//   try {
//     const user_id = req.session.user_id;
//     let favorite_teams = {};
//     const team_ids = await users_utils.getFavoriteTeams(user_id);
//     let team_ids_array = [];
//     team_ids.map((element) => team_ids_array.push(element.team_id)); //extracting the team ids into array
//     const results = await teams_utils.getteamsInfo(team_ids_array);
//     res.status(200).send(results);
//   } catch (error) {
//     next(error);
//   }
// });

module.exports = router;

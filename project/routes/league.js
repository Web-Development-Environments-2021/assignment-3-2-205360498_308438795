var express = require("express");
var router = express.Router();
const league_utils = require("./utils/league_utils");

router.get("/getDetails", async (req, res, next) => {
  try {
    const league_details = await league_utils.getLeagueDetails();
    res.status(200).send(league_details);
  } catch (error) {
    next(error);
  }
});

// get all stage matches

router.get("/getSatgeMatches", async (req, res, next) => {
  try {
    const league_matches = await league_utils.getStageMatches();
    res.status(200).send(league_matches);
  } catch (error) {
    next(error);
  }
});


module.exports = router;

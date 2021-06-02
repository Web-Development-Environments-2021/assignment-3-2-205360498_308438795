var express = require("express");
var router = express.Router();
const search_utils = require("./utils/search_utils");
const teams_utils = require("./utils/teams_utils");
const players_utils = require("./utils/players_utils");

router.get("/team/:name", async (req, res, next) => {
  try {
    const results = await teams_utils.getTeamsByName(req.params.name);
    res.send(results);
  } catch (error) {
    next(error);
  }
});
router.get("/player/:name", async (req, res, next) => {
    try {
      const results = await players_utils.getplayersByName(req.params.name);
      res.send(results);
    } catch (error) {
      next(error);
    }
  });

module.exports = router;
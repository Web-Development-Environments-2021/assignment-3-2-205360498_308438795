var express = require("express");
var router = express.Router();
const search_utils = require("./utils/search_utils");
const teams_utils = require("./utils/teams_utils");
const players_utils = require("./utils/players_utils");


/**
 * this path used for search team by name in external API ( Superliga teams only!)
 */
router.get("/team/:name", async (req, res, next) => {
  try {
    const results = await teams_utils.getTeamsByName(req.params.name);
    if(results.length==0){
      res.status(204).send("the search didn't find results")
    }
    else{
    res.status(200).send(results);}
  } catch (error) {
    next(error);
  }
});

/**
 * this path used for search players by name in external API ( Superliga teams only!)
 */
router.get("/player/:name", async (req, res, next) => {
    try {
      const results = await players_utils.getplayersByName(req.params.name);
      if(results.length==0){
        res.status(204).send("the search didn't find results")
      }
      else{res.send(results);}
      
    } catch (error) {
      next(error);
    }
  });

module.exports = router;
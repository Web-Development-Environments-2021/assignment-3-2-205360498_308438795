var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const match_utils = require("./utils/match_utils")

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
      const user_id = req.session.user_id;
      // need to check if the user is auth to add match to DB
      const match_deatails = req.body;
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
      const user_id = req.session.user_id;
      // need to check if the user is auth to add match to DB
      const match_id = req.body.match_id;
      // need to check if the match exsist in db
      const match_deatails = req.body;
      await match_utils.updateMatchInDB(match_deatails);
      res.status(200).send("The match update successfully");
    } catch (error) {
      next(error);
    }
  });


module.exports = router;
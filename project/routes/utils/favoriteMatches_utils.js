const DButils = require("./DButils");
const axios = require("axios");

/*
  this function will remove from favoriteMatches table all the row that have the match that given
*/
async function removeMatchFromFavorite(match_id) {
    let matchExist = await checkiFMatchExistInFavorite(match_id);
    if(matchExist){
        await DButils.execQuery(
            `DELETE FROM dbo.FavoriteMatches WHERE MatchId = '${match_id}'`
          );
        return;
    }
  }

/*
  this function will check if match is in favorite of any user
*/
async function checkiFMatchExistInFavorite(match_id){
    // TODO - check if match exist in matches db.
  let checkIfExist = await DButils.execQuery(`SELECT TOP 1 1 FROM dbo.FavoriteMatches where MatchId='${match_id}'`);
  let match_id_array = [];
    checkIfExist.map((element) => match_id_array.push(element)); //extracting the match id into array for checking if exist
  if(match_id_array.length==0){
      return false;
  }
  return true;

}

/*
  this function will check if match is in favorite of the given user
*/
async function checkIfMatchInFavo(user_id,match_id){
    let checkIfExist = await DButils.execQuery(`SELECT TOP 1 1 FROM dbo.FavoriteMatches WHERE MatchId='${match_id}' AND user_id='${user_id}'`);
    let match_id_array = [];
      checkIfExist.map((element) => match_id_array.push(element)); //extracting the match id into array for checking if exist
    if(match_id_array.length==0){
        return false;
      
    }
    return true;
}

exports.checkIfMatchInFavo = checkIfMatchInFavo;
exports.removeMatchFromFavorite = removeMatchFromFavorite;
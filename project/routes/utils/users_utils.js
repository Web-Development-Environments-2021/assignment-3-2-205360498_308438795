const DButils = require("./DButils");

async function markPlayerAsFavorite(user_id, player_id) {
  await DButils.execQuery(
    `insert into dbo.FavoritePlayers values ('${user_id}',${player_id})`
  );
}

async function getFavoritePlayers(user_id) {
  const player_ids = await DButils.execQuery(
    `select player_id from dbo.FavoritePlayers where user_id='${user_id}'`
  );
  return player_ids;
}


async function markMatchAsFavorite(user_id, MatchId) {
  await DButils.execQuery(
    `insert into dbo.FavoriteMatches values ('${user_id}',${MatchId})`
  );
}

async function getFavoriteMatches(user_id) {
  const matches_ids = await DButils.execQuery(
    `select MatchId from dbo.FavoriteMatches where user_id='${user_id}'`
  );
  return matches_ids;
}

async function checkIfMatchInFavo(user_id,MatchId){
  let checkIfExist = await DB.execQuery(`SELECT TOP 1 1 FROM dbo.Fav where MatchID='${match_id} AND user_id='${user_id}'`);
  let match_id_array = [];
    checkIfExist.map((element) => match_id_array.push(element)); //extracting the match id into array for checking if exist
  if(match_id_array.length==0){
      return false;
    
  }
  return true;
}


// async function markTeamAsFavorite(user_id, team_id) {
//   await DButils.execQuery(
//     `insert into dbo.FavoriteTeams values ('${user_id}',${team_id})`
//   );
// }

// async function getFavoriteTeams(user_id) {
//   const team_ids = await DButils.execQuery(
//     `select team_id from dbo.FavoriteTeams where user_id='${user_id}'`
//   );
//   return team_ids;
// }

exports.markMatchAsFavorite = markMatchAsFavorite;
exports.getFavoriteMatches = getFavoriteMatches;
exports.markPlayerAsFavorite = markPlayerAsFavorite;
exports.getFavoritePlayers = getFavoritePlayers;

exports.checkIfMatchInFavo = checkIfMatchInFavo;

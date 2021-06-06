const DButils = require("./DButils");

/**
 * this function add player_id to user_id favorites players
 */
async function markPlayerAsFavorite(user_id, player_id) {
  await DButils.execQuery(
    `insert into dbo.FavoritePlayers values ('${user_id}',${player_id})`
  );
}

/**
 * this function returns all player_id that are in user_id favorites
 */
async function getFavoritePlayers(user_id) {
  const player_ids = await DButils.execQuery(
    `select player_id from dbo.FavoritePlayers where user_id='${user_id}'`
  );
  return player_ids;
}


/**
 * this function add MatchId to user_id favorites matches
 */
async function markMatchAsFavorite(user_id, MatchId) {
  await DButils.execQuery(
    `insert into dbo.FavoriteMatches values ('${user_id}',${MatchId})`
  );
}


/**
 * this function returns all MatchId that are in user_id favorites
 */
async function getFavoriteMatches(user_id) {
  const matches_ids = await DButils.execQuery(
    `select MatchId from dbo.FavoriteMatches where user_id='${user_id}'`
  );
  return matches_ids;
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

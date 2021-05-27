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
  // TODO - check if match exist in matches db.
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

exports.markMatchAsFavorite = markMatchAsFavorite;
exports.getFavoriteMatches = getFavoriteMatches;

exports.markPlayerAsFavorite = markPlayerAsFavorite;
exports.getFavoritePlayers = getFavoritePlayers;

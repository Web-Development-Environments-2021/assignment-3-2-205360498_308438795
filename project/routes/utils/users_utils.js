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

exports.markPlayerAsFavorite = markPlayerAsFavorite;
exports.getFavoritePlayers = getFavoritePlayers;


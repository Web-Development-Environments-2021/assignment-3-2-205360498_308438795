const DButils = require("./DButils");
const calender_utils = require("./calender_utils");

async function getNextGameDeatails(){
    let games = await DButils.execQuery(`SELECT * FROM dbo.matches WHERE Played = 0`); /// sql command to get games that dont played yet
    if(games.length==0){
        return null;
    }


    // we need to choose the nearest game

    let nextGame = games[0];

    for(let i =1;i<games.length;i++){
        if(games[i].MatchDate < nextGame.MatchDate){
            nextGame = games[i];
        }
    }
    return nextGame // check object ?!?!
}

async function addMatchToDB(match_deatails) {
    let home_team = match_deatails.home_team;
    let away_team = match_deatails.away_team;
    let date = match_deatails.date;
    let stadium = match_deatails.stadium;
    let referee = match_deatails.referee;
    let played = 0;
    await DButils.execQuery(
        `insert into dbo.matches (HomeTeamId, AwayTeamId, MatchDate, StadiumID, Played, Referee) 
        values ('${home_team}', '${away_team}','${date}','${stadium}','${played}','${referee}')`
      );
    console.log(match_deatails);
}

async function updateMatchInDB(match_deatails) {
    let match_id = match_deatails.match_id;
    let home_team_goals = match_deatails.home_team_goals;
    let away_team_goals = match_deatails.away_team_goals;
    let played = 1;
    await DButils.execQuery(
        `update dbo.matches
        set (HomeTeamGoals, AwayTeamGoals, Played) 
        values ('${home_team_goals}', '${away_team_goals}','${played}')
        where MatchId='${match_id}' `
      );
    console.log(match_deatails);
}


async function updateEventCalenderToMatch(match_deatails) {
    let match_id = match_deatails.match_id;
    let event_array = match_deatails.event_array;
    


    
    let played = 1;
    await DButils.execQuery(
        `update dbo.matches
        set (HomeTeamGoals, AwayTeamGoals, Played) 
        values ('${home_team_goals}', '${away_team_goals}','${played}')
        where MatchId='${match_id}' `
      );
    console.log(match_deatails);
}


async function getAllMatches(match_deatails) {
    const matches = await DButils.execQuery(
        `SELECT * FROM dbo.matches`
      );
    console.log(matches);
    return matches;
}
exports.getNextGameDeatails = getNextGameDeatails;
exports.addMatchToDB = addMatchToDB;
exports.updateMatchInDB = updateMatchInDB;
exports.updateEventCalenderToMatch = updateEventCalenderToMatch;
exports.getAllMatches = getAllMatches;
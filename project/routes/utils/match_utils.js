
const DButils = require("./DButils");
const axios = require("axios");
const { DateTime } = require("mssql");


async function createMatchPrev(Game){
  console.log(Game);
  console.log(Game.MatchDate)
  homeTeamName = await getTeamNameFromApi(Game.HomeTeamId);
  awayTeamName = await getTeamNameFromApi(Game.AwayTeamId);
  stadium = Game.StadiumID;
  gamehour = await geTimeFromDateTime(Game.MatchDate);
  gamedate = await getDateFromDateTime(Game.MatchDate);
  console.log(homeTeamName)
  console.log(awayTeamName)
  console.log(gamehour)
  console.log(gamedate)
  console.log(stadium);


  return{
    Date:gamedate,
    Hour:gamehour,
    HomeTeam:homeTeamName,
    AwayTeam:awayTeamName,
    Stadium:stadium

  }





}
// get all stage matches 
async function getCurrentStageMatches(){
  let futureMatches = await DB.execQuery(`SELECT HomeTeamID , AwayTeamId , MatchDate , StadiumID form dbo.matches WHERE Played = 0`)
  let pastMatches = await DB.execQuery(`SELECT * form dbo.matches WHERE Played = 1`)
  let resFutureMatches = []
  let resPastMatches = []
  
  // need to get at least 3 events in past matches
  for(let i =0;i<pastMatches.length;i++){
    // get events for each game in db
    let events = await DB.execQuery(`SELECT * FROM dbo.Events WHERE MatchId='${pastMatches[i].MatchId}'`);
    let resEvents = []
    for(let j =0;j<events.length;j++){
      jsonEvent = {
        Date:events[j].event_date,
        Hour:events[j].event_time,
        TimeInMatch:events[j].minute,
        EventDescription:events[j].game_event
      };
      resEvents.push(jsonEvent);

    }
    let CurMatch = createMatchPrev(pastMatches[i])
    CurMatch["HomeGoals"] = pastMatches[i].HomeTeamGoals;
    CurMatch["HomeGoals"] = pastMatches[i].AwayTeamGoals;
    CurMatch["EventCalender"] = resEvents;
    resPastMatches.push(CurMatch);



  }


  // future matches should represent as MatchPrev
  let i =0;
  for(i;i<futureMatches.length;i++){
    resFutureMatches.push(createMatchPrev(futureMatches[i]))

  }

  return{
    PreMatches:resPastMatches,
    FutureMatches:resFutureMatches
  }

}


// //get 3 next matches for show in home page
// async function getNext3Matches(user_id){
//   // get future games in favo
//   let teamFutureMatches = await DB.execQuery(`SELECT HomeTeamID , AwayTeamId , MatchDate , StadiumID form dbo.matches INNER JOIN  dbo.favoriteMatches ON dbo.matches.MatchId=dbo.favoriteMatches.MatchId WHERE user_id ='${user_id} AND played = 0' ORDER BY MatchDate DESC LIMIT 3`);
//   if(teamFutureMatches.length==0){
//     return
//   }
//   let resMatches = [];
//   for(let i=0;i<teamFutureMatches.length;i++){
//     resMatches.push(createMatchPrev(teamFutureMatches[i]));
//   }
//   return resMatches;

// }

async function getNextGameDetails(){
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
    matchPrev = await createMatchPrev(nextGame);
    return matchPrev // check object ?!?!
}

async function getTeamNameFromApi(teamId){

    let teamName = await axios.get(
        `https://soccer.sportmonks.com/api/v2.0/teams/${teamId}`,
        {
          params: {
            api_token: process.env.api_token,
          },
        })

    return teamName.data.data.name    
}

async function geTimeFromDateTime(datetime){
    let data= new Date(datetime)
    let hrs = data.getHours()
    let mins = data.getMinutes()
    if(hrs<=9)
       hrs = '0' + hrs
    if(mins<10)
      mins = '0' + mins
    const postTime= hrs + ':' + mins
    return postTime
}

async function getDateFromDateTime(datetime){
    let data= new Date(datetime)
    let years = data.getFullYear();
    let month = data.getMonth();
    let days = data.getDate();
    return days+':'+month+':'+years
}

async function checkiFMatchExist(match_id){
    // TODO - check if match exist in matches db.
  let checkIfExist = await DButils.execQuery(`SELECT TOP 1 1 FROM dbo.matches where MatchID='${match_id}'`);
  let match_id_array = [];
    checkIfExist.map((element) => match_id_array.push(element)); //extracting the match id into array for checking if exist
  if(match_id_array.length==0){
      return false;
    
  }
  return true;

}

async function getMatchesInfo(matches_ids_list) {
    //  let homePromises = [];
    //  let awayPromises = [];
    //  let matchDateTime = []
    // let matchesDetails = [];
    // let stadiums = [];
    matchesPrev = []
    for(let i =0;i<matches_ids_list.length;i++){
        let match = await DButils.execQuery(`SELECT HomeTeamId,AwayTeamId,MatchDate,StadiumID FROM dbo.matches where MatchId='${matches_ids_list[i]}'`);
        date = await getDateFromDateTime(match[0].MatchDate)
        homeTeam = await getTeamNameFromApi(match[0].HomeTeamId);
        awayTeam = await getTeamNameFromApi(match[0].AwayTeamId);
        matchtime = await geTimeFromDateTime(match[0].MatchDate);
        stadium = match[0].StadiumID;
        

        let matchDet = 
        {
            Date:date,
            Hour:matchtime,
            HomeTeam:homeTeam,
            AwayTeam:awayTeam,
            Staduim:stadium
            
         };
         matchesPrev.push(matchDet);


    }
    return matchesPrev;
  }


async function addMatchToDB(match_deatails) {
    let home_team = match_deatails.home_team;
    let away_team = match_deatails.away_team;
    let date = match_deatails.date;
    let stadium = match_deatails.stadium;
    let referee = match_deatails.referee;
    let played = 0;
    await DButils.execQuery(
        `insert into dbo.matches (HomeTeamId, AwayTeamId, MatchDate, StadiumID, Played, RefereeID) 
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
exports.addMatchToDB = addMatchToDB;
exports.updateMatchInDB = updateMatchInDB;
exports.updateEventCalenderToMatch = updateEventCalenderToMatch;
exports.getAllMatches = getAllMatches;
exports.getMatchesInfo = getMatchesInfo;
exports.getNextGameDetails = getNextGameDetails;
exports.checkiFMatchExist = checkiFMatchExist;

exports.getCurrentStageMatches  = getCurrentStageMatches;
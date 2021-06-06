
const DButils = require("./DButils");
const favoriteMatches_utils = require("./favoriteMatches_utils");
const events_utils = require("./events_utils");
const teams_utils = require("./teams_utils");
const referee_utils = require("./referee_utils");
const axios = require("axios");



async function createMatchPrev(Game){
  homeTeamName = await teams_utils.getTeamNameFromApi(Game.HomeTeam_Id);
  awayTeamName = await teams_utils.getTeamNameFromApi(Game.AwayTeam_Id);
  stadium = Game.Stadium_name;
  gamehour = await geTimeFromDateTime(Game.MatchDate);
  gamedate = await getDateFromDateTime(Game.MatchDate);
  referee_name = await referee_utils.getRefereeName(Game.RefereeID);
  return{
    Match_Id:Game.Match_Id,
    Date:gamedate,
    Hour:gamehour,
    HomeTeam_Id:Game.HomeTeam_Id,
    HomeTeam_name:homeTeamName,
    AwayTeam_Id:Game.AwayTeam_Id,
    AwayTeam_name:awayTeamName,
    Stadium:stadium,
    RefereeID:Game.RefereeID,
    Referee:referee_name
  };
}

// get all stage matches 
async function getCurrentStageMatches(){
  await updatePlayedMatchesInDB();
  let futureMatches = await DButils.execQuery(`SELECT HomeTeam_Id , AwayTeam_Id , MatchDate , Stadium_name form dbo.matches WHERE Played = 0`);
  let pastMatches = await DButils.execQuery(`SELECT * form dbo.matches WHERE Played = 1`);
  let resFutureMatches = [];
  let resPastMatches = [];
  
  // need to get at least 3 events in past matches
  for(let i =0;i<pastMatches.length;i++){
    // get events for each game in db
    let events = await events_utils.getAllMatchEvents(pastMatches[i].Match_Id);
    let CurMatch = createMatchPrev(pastMatches[i])
    CurMatch["HomeGoals"] = pastMatches[i].HomeTeamGoals;
    CurMatch["HomeGoals"] = pastMatches[i].AwayTeamGoals;
    CurMatch["EventCalender"] = events;
    resPastMatches.push(CurMatch);
  }

  // future matches should represent as MatchPrev
  let i =0;
  for(i;i<futureMatches.length;i++){
    resFutureMatches.push(createMatchPrev(futureMatches[i]));
  }
  return{
    PreMatches:resPastMatches,
    FutureMatches:resFutureMatches
  }
}

async function changePlayedTo1(match_id){
    await DButils.execQuery(`UPDATE dbo.matches SET Played=1
    WHERE Match_Id='${match_id}'`);
}

async function updatePlayedMatchesInDB(){
    let tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    let curr_date = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1)+"Z";
    let games = await DButils.execQuery(`SELECT * FROM dbo.matches WHERE Played = 0`);
    
    let matches_array = [];
    games.map((element) => matches_array.push(element)); //extracting the match id into array for checking if exist
    for(const match of matches_array){
      if(match.MatchDate.getTime() < new Date(curr_date).getTime()){
        await changePlayedTo1(match.Match_Id);
        await favoriteMatches_utils.removeMatchFromFavorite(match.Match_Id);
      }
    }
}

async function getNextGameDetails(){
  // update the db of matches that already played
    await updatePlayedMatchesInDB();

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
    return matchPrev;
}

async function geTimeFromDateTime(datetime){
    let data= new Date(datetime);
    let hrs = data.getHours();
    let mins = data.getMinutes();
    if(hrs<=9)
       hrs = '0' + hrs;
    if(mins<10)
      mins = '0' + mins;
    const postTime = hrs + ':' + mins;
    return postTime;
}

async function getDateFromDateTime(datetime){
    let data = new Date(datetime);
    let years = data.getFullYear();
    let month = data.getMonth();
    let days = data.getDate();
    return days + ':' + month + ':' + years;
}



async function checkiFMatchExist(match_id){
    // TODO - check if match exist in matches db.
  let checkIfExist = await DButils.execQuery(`SELECT TOP 1 1 FROM dbo.matches where Match_Id='${match_id}'`);
  let match_id_array = [];
    checkIfExist.map((element) => match_id_array.push(element)); //extracting the match id into array for checking if exist
  if(match_id_array.length==0){
      return false;
    
  }
  return true;

}

async function getMatchesInfo(matches_ids_list) {
    matchesPrev = []
    for(let i =0;i<matches_ids_list.length;i++){
        let match = await DButils.execQuery(`SELECT HomeTeam_Id,AwayTeam_Id,MatchDate,Stadium_name,RefereeID FROM dbo.matches where Match_Id='${matches_ids_list[i]}'`);
        let matchDet = await createMatchPrev(match[0]);
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
        `insert into dbo.matches (HomeTeam_Id, AwayTeam_Id, MatchDate, Stadium_name, RefereeID, Played) 
        values ('${home_team}', '${away_team}','${date}','${stadium}','${referee}','${played}')`
      );
    console.log(match_deatails);
}

async function updateMatchInDB(match_deatails) {
    let match_id = match_deatails.match_id;
    let home_team_goals = match_deatails.home_team_goals;
    let away_team_goals = match_deatails.away_team_goals;
    await DButils.execQuery(
        `UPDATE dbo.matches
        SET HomeTeamGoals=${home_team_goals}, AwayTeamGoals=${away_team_goals}, Played=1
        WHERE Match_Id='${match_id}'`
      );
}


// need to check
async function updateEventCalenderToMatch(match_id,eventCalender) {
  for(const event of eventCalender){
    await events_utils.addEventToMatch(match_id,event);
  }
}

async function dateOfTheMatchIsGood(match_date) {
  let tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
  let curr_date = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1)+"Z";
  let curr_date_time = new Date(curr_date).getTime();
  let match_data_time = new Date(match_date).getTime();
  if(match_data_time < curr_date_time){
    return false;
  }
  return true;
}

async function matchPastTheDate(match_id){
  let match = await DButils.execQuery(`SELECT * FROM dbo.matches where Match_Id='${match_id}'`);
  let match_in_array = [];
  match.map((element) => match_in_array.push(element));
  let match_date = match_in_array[0].MatchDate;
  const match_past = !(await dateOfTheMatchIsGood(match_date));
  return match_past;
}


exports.addMatchToDB = addMatchToDB;
exports.updateMatchInDB = updateMatchInDB;
exports.updateEventCalenderToMatch = updateEventCalenderToMatch;
exports.getMatchesInfo = getMatchesInfo;
exports.getNextGameDetails = getNextGameDetails;
exports.checkiFMatchExist = checkiFMatchExist;
exports.getCurrentStageMatches  = getCurrentStageMatches;
exports.dateOfTheMatchIsGood = dateOfTheMatchIsGood;
exports.matchPastTheDate = matchPastTheDate;

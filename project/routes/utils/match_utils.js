
const DButils = require("./DButils");
const favoriteMatches_utils = require("./favoriteMatches_utils");
const events_utils = require("./events_utils");
const teams_utils = require("./teams_utils");
const referee_utils = require("./referee_utils");
const axios = require("axios");


/*
  this function will create a match preview acording to the api
*/
async function createMatchPrev(Game){
  // get the json of team
  const homeTeam = await teams_utils.getTeamNameAndImgFromApi(Game.HomeTeam_Id);
  const awayTeam = await teams_utils.getTeamNameAndImgFromApi(Game.AwayTeam_Id);
  let homeTeamName = homeTeam.name;
  let awayTeamName = awayTeam.name;
  let homeTeamImg = homeTeam.img_url;
  let awayTeamImg = awayTeam.img_url;
  // create the perview of the teams
  let homeTeamPrev = {Team_Id:Game.HomeTeam_Id,
    Team_name:homeTeamName,
    Team_img:homeTeamImg
  };
  let awayTeamPrev = {Team_Id:Game.AwayTeam_Id,
    Team_name:awayTeamName,
    Team_img:awayTeamImg
  };

  stadium = Game.Stadium_name;
  // get format of time and date from dateTime
  gamehour = await geTimeFromDateTime(Game.MatchDate);
  gamedate = await getDateFromDateTime(Game.MatchDate);
  // get the referee preview
  referee = await referee_utils.getRefereeName(Game.RefereeID);
  return{
    Match_Id:Game.Match_Id,
    Date:gamedate,
    Hour:gamehour,
    HomeTeamPrev:homeTeamPrev,
    AwayTeamPrev:awayTeamPrev,
    Stadium:stadium,
    Referee:referee
  };
}

/*
  this function will create a match json acording to the api
*/
async function createMatch(match){
  const events = await events_utils.getAllMatchEvents(match.Match_Id);
  let CurMatch = await createMatchPrev(match);
  let return_match = {
    MatchDetails:CurMatch,
    HomeTeamGoals:match.HomeTeamGoals,
    AwayTeamGoals:match.AwayTeamGoals,
    EventCalender:events
  };
  return return_match;
}

/*
  this function will get all the matches in db
*/
async function getCurrentStageMatches(){
  await updatePlayedMatchesInDB();
  let futureMatches = await DButils.execQuery(`SELECT * FROM dbo.matches WHERE Played = 0`);
  let pastMatches = await DButils.execQuery(`SELECT * FROM dbo.matches WHERE Played = 1`);
  let resFutureMatches = [];
  let resPastMatches = [];
  
  // create match json for all the past games according to the api
  for(let i =0;i<pastMatches.length;i++){
    const CurMatch = await createMatch(pastMatches[i]);
    resPastMatches.push(CurMatch);
  }

  // create matchPrev json for all thefuture games according to the api
  let i =0;
  for(i;i<futureMatches.length;i++){
    resFutureMatches.push(await createMatchPrev(futureMatches[i]));
  }
  return{
    PreMatches:resPastMatches,
    FutureMatches:resFutureMatches
  }
}

/*
  this function will change the row played to 1 of a match in the db
*/
async function changePlayedTo1(match_id){
    await DButils.execQuery(`UPDATE dbo.matches SET Played=1
    WHERE Match_Id='${match_id}'`);
}

/*
  this function will make that all matches in db that
  there date was past will got remove from favorite table 
  and change thier status to played
*/
async function updatePlayedMatchesInDB(){
    // get the right date
    let tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    let curr_date = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1)+"Z";
    // get all the unplayed matches
    let games = await DButils.execQuery(`SELECT * FROM dbo.matches WHERE Played = 0`);
    
    let matches_array = [];
    games.map((element) => matches_array.push(element)); //extracting the match id into array for checking if exist
    for(const match of matches_array){
      // if the match date was past
      if(match.MatchDate.getTime() < new Date(curr_date).getTime()){
        // remove and change the match
        await changePlayedTo1(match.Match_Id);
        await favoriteMatches_utils.removeMatchFromFavorite(match.Match_Id);
      }
    }
}

/*
  this function will get the nearest game and show is details
*/
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

/*
  this function will get the time from DateTime value
*/
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

/*
  this function will get the date from DateTime value
*/
async function getDateFromDateTime(datetime){
    let data = new Date(datetime);
    let years = data.getFullYear();
    let month = data.getMonth()+1;
    let days = data.getDate();
    return days + '/' + month + '/' + years;
}


/*
  this function will check if match exist in db.
*/
async function checkiFMatchExist(match_id){
  let checkIfExist = await DButils.execQuery(`SELECT TOP 1 1 FROM dbo.matches where Match_Id='${match_id}'`);
  let match_id_array = [];
    checkIfExist.map((element) => match_id_array.push(element)); //extracting the match id into array for checking if exist
  if(match_id_array.length==0){
      return false;
  }
  return true;
}

/*
  this function will get all given matches info
*/
async function getMatchesInfo(matches_ids_list) {
    matchesPrev = []
    for(let i =0;i<matches_ids_list.length;i++){
        let match = await DButils.execQuery(`SELECT * FROM dbo.matches where Match_Id='${matches_ids_list[i]}'`);
        let matchDet = await createMatchPrev(match[0]);
         matchesPrev.push(matchDet);
    }
    return matchesPrev;
  }

/*
  this function will add a match to db
*/
async function addMatchToDB(match_deatails) {
    let home_team = match_deatails.home_team_id;
    let away_team = match_deatails.away_team_id;
    let date = new Date(match_deatails.date).toISOString();
    let stadium = match_deatails.stadium;
    let referee = match_deatails.referee_id;
    let played = 0;
    await DButils.execQuery(
        `insert into dbo.matches (HomeTeam_Id, AwayTeam_Id, MatchDate, Stadium_name, RefereeID, Played) 
        values ('${home_team}', '${away_team}','${date}','${stadium}','${referee}','${played}')`
      );
    console.log(match_deatails);
}

/*
  this function will add to a match the goals that scored
*/
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


/*
  this function will add to a match a eventCalender
*/
async function updateEventCalenderToMatch(match_id,eventCalender) {
  for(const event of eventCalender){
    await events_utils.addEventToMatch(match_id,event);
  }
}

/*
  this function will check if the date of the match
  is in future
*/
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

/*
  this function will check if the date of the match
  is already gone
*/
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
exports.createMatchPrev = createMatchPrev;
exports.createMatch = createMatch;
exports.getDateFromDateTime = getDateFromDateTime;
exports.geTimeFromDateTime = geTimeFromDateTime ; 
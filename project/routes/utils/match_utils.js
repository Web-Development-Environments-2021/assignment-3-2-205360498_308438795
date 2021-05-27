const DB = require("./DButils");
const axios = require("axios");
const { DateTime } = require("mssql");


async function getNextGameDetails(){
    let games = await DB.execQuery('SELECT') /// sql command to get games that dont played yet
    if(games.length==0){
        return null;
    }


    // we need to choose the nearest game

    let curDate = new DateTime();
    let nextGame = games[0];

    for(let i =1;i<games.length;i++){
        if(games[i].MatchDate < nextGame){
            nextGame = games[i];
        }
    }
    return nextGame // check object ?!?!
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
  let checkIfExist = await DB.execQuery(`SELECT TOP 1 1 FROM dbo.matches where MatchID='${match_id}'`);
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
        let match = await DB.execQuery(`SELECT HomeTeamId,AwayTeamId,MatchDate,StadiumID FROM dbo.matches where MatchId='${matches_ids_list[i]}'`);
        date = getDateFromDateTime(match[0].MatchDate)
        homeTeam = getTeamNameFromApi(match[0].HomeTeamId);
        awayTeam = getTeamNameFromApi(match[0].AwayTeamId);
        matchtime = geTimeFromDateTime(match[0].MatchDate);
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

//   params: {
//     api_token: process.env.api_token,
//     include: "team",
//   },
//   axios.get(`${api_domain}/players/${id}`
exports.getMatchesInfo = getMatchesInfo;
exports.getNextGameDetails = getNextGameDetails;

exports.checkiFMatchExist = checkiFMatchExist;
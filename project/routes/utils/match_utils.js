const DB = require("./DButils");
const axios = require("axios");
const { DateTime } = require("mssql");

async function getNextGameDeatails(){
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

    return teamName    
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

async function getMatchesInfo(matches_ids_list) {
     let homePromises = [];
     let awayPromises = [];
     let matchDateTime = []
    let matchesDetails = [];
    let stadiums = [];
    for(let i =0;i<matches_ids_list.length;i++){
        let match = await DB.execQuery(`SELECT HomeTeamId,AwayTeamId,MatchDate,StadiumID AS homeTeam,guestTeam,fulldate,stadium FROM dbo.matches where MatchId='${matches_ids_list[i]}'`);
        homePromises.push(match.homeTeam);
        awayPromises.push(match.guesteam);
        matchDateTime.push(match.fulldate);
        stadiums.push(match.stadium);


    }
     

    matches_ids_list.map((id) =>
      promises.push(
        
      )
    );
    // let players_info = await Promise.all(promises);
    return extractRelevantPlayerData(players_info);
  }

//   params: {
//     api_token: process.env.api_token,
//     include: "team",
//   },
//   axios.get(`${api_domain}/players/${id}`
exports.getMatchesInfo = getMatchesInfo;
exports.getNextGameDeatails = getNextGameDeatails;
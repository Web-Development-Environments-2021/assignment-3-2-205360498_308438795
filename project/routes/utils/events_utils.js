const DButils = require("./DButils");
const axios = require("axios");



async function addEventToMatch(team_id,event){
    let date = event.event_date;
    let time = event.event_time;
    let minute = event.minute;
    let game_event = event.game_event;
    await DButils.execQuery(
        `insert into dbo.Events (event_date, event_time, minute, game_event) 
        values ('${date}', '${time}','${minute}','${game_event}')`
    );
}

exports.addEventToMatch = addEventToMatch;
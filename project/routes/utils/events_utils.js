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
async function getAllMatchEvents(match_id){
    const eventCalender = [];
    const events = await DButils.execQuery(`SELECT * FROM dbo.Events where MatchId='${match_id}'`);
    for(const event of events){
        let event_json ={
            Event_Id:event.Event_Id,
            event_date:event.event_date,
            event_time:event.event_time,
            minute:event.minute,
            game_event:event.game_event 
        };
        eventCalender.push(event_json);
    }
    return eventCalender;
}

exports.getAllMatchEvents = getAllMatchEvents;
exports.addEventToMatch = addEventToMatch;
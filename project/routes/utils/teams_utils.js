const axios = require("axios");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";
const LEAGUE_ID = 271;


async function getTeamsByName(name) {
    let teams_list = [];
    const teams = await axios.get(`${api_domain}/teams/search/${name}`, {
      params: {
        api_token: process.env.api_token,
        include: "league",
      },
    });
    teams.data.data.forEach(team => {
        if(team.league && team.league.data.id === LEAGUE_ID){
          teams_list.push({"team_name": team.name, "logo_path": team.logo_path})  
        }
    });
    return teams_list;
  }

exports.getTeamsByName = getTeamsByName;
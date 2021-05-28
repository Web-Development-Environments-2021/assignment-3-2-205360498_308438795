const axios = require("axios");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";


async function getTeamsByName(name) {
    let teams_list = [];
    const teams = await axios.get(`${api_domain}/teams/search/${name}`, {
      params: {
        api_token: process.env.api_token,
      },
    });
    teams.data.data.forEach(team => {
        teams_list.push({"team_name": team.name, "logo_path": team.logo_path})  
    });
    return teams_list;
  }

exports.getTeamsByName = getTeamsByName;
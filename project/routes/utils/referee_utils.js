const DButils = require("./DButils");

async function addRefereeToDB(first_name,last_name){
    await DButils.execQuery(
        `insert into dbo.Referees (first_name, last_name) 
        values ('${first_name}', '${last_name}')`
      );
  }

  async function checkIfRefereeExistWithSameName(ref_first_name,ref_last_name){
    // TODO - check if match exist in matches db.
    let checkIfExist = await DButils.execQuery(`SELECT TOP 1 1 FROM dbo.Referees 
                WHERE (first_name = '${ref_first_name}') AND (last_name = '${ref_last_name}')`);
    let match_id_array = [];
      checkIfExist.map((element) => match_id_array.push(element)); //extracting the match id into array for checking if exist
    if(match_id_array.length==0){
        return false;
      
    }
    return true;
    
  }

  async function checkIfRefereeExist(referee_id){
    // TODO - check if match exist in matches db.
    let checkIfExist = await DButils.execQuery(`SELECT TOP 1 1 FROM dbo.Referees 
                WHERE referee_id = '${referee_id}'`);
    let match_id_array = [];
      checkIfExist.map((element) => match_id_array.push(element)); //extracting the match id into array for checking if exist
    if(match_id_array.length==0){
        return false;
      
    }
    return true;
  }


exports.addRefereeToDB = addRefereeToDB;
exports.checkIfRefereeExistWithSameName = checkIfRefereeExistWithSameName;
exports.checkIfRefereeExist = checkIfRefereeExist;
const DButils = require("./DButils");

async function userIsAssociationMember_utils(user_id) {

    const user_permissions = (await DButils.execQuery(`SELECT permission_char FROM dbo.Permissions WHERE user_id = '${user_id}'`));
    for(const permission of user_permissions){
        if(permission.permission_char === 'A'){
            return true;
        }
    }
    return false;
    // .then((permissons) => {
    //   if (permissons.find((x) => x.permission_char === 'A')) {
    //     return true;
    //   }
    //   else{
    //     return false;
    //   }
    // })
}

exports.userIsAssociationMember_utils = userIsAssociationMember_utils;
const USER_MODEL = require("../models/user.model");

module.exports.splitDate = (date) => {
    //@year-mouth-day
    let dateGet = date.split("-");
    return {
        day: Number(dateGet[2]),
        mouth: Number(dateGet[1]),
        year: Number(dateGet[0])
    }
}

module.exports.ConvertIDToDataJSON = async (IdLists, model) => {
    let res;
    let result = new Array();

    if(Array.isArray(IdLists)) {
        for(let i = 0; i < IdLists.length; i++) {
            try { 
                res = JSON.stringify(await model.findOne({_id: IdLists[i]}));
            }
            catch(err) {
                res = null;
            }
            result.push(res);
        }
    }
    else {
        try { 
            res = JSON.stringify(await model.findOne({_id: IdLists}));
        }
        catch(err) {
            return new Array();
        }
        result = res;
    }
    
    return result;
}

//Convert ID of user author to object data user author
module.exports.AuthorJSON = async (author) => {
    let auth = JSON.parse(await this.ConvertIDToDataJSON(author, USER_MODEL));
    return JSON.stringify({
        _id: auth._id,
        username: auth.username,
        firstname: auth.firstname,
        lastname: auth.lastname,
        email: auth.email,
        address: auth.address,
        number_phone: auth.number_phone
    });
}

module.exports.convertURL = (url) => {
    let newUrl;
    url = url.replace(/A/g,"a");
    url = url.replace(/Ă/g, "a")
}

//Calculate the promotion price
module.exports.CaltheProPrice = (money, promotion, transportFee) => {
    return money - ( money * ( promotion / 100 ) ) + transportFee;
}
const axios = require("axios");

module.exports.Delete = (url, key, model) => {
    axios({
        method: "DELETE",
        url: `${url}/${key}`
    }).then((response) => {
        if(response.status) {
            console.log("passed");
        }
    }).catch((err) => {
        console.err(err);
    })
}
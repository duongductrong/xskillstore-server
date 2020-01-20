const bcrypt = require("bcryptjs");

module.exports = async (salt, password) => {
    // bcrypt.genSalt(salt,(err, salt) => {
    //     bcrypt.hash(password, salt, (err, hash) => {
    //         return hash;
    //     })
    // })
    // hash password
    let newSalt = bcrypt.genSaltSync(salt);
    let hash = bcrypt.hashSync(password, newSalt);
    return hash;
}
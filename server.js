const http = require("http");
const app = require("./app");
const server = http.createServer(app);
require('dotenv').config()

server.listen(process.env.PORT, () => {
    console.log("Create Server Successfully with " + process.env.PORT);
})

const makeAsync = require("./async");
const makeSync = require("./sync");

makeSync.async = makeAsync;
module.exports = makeSync;

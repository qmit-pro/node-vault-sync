const makeAsync = require("./async");

function rpcWorker() {
    return function ([f, o]) {
        try {
            if (typeof f == "string") {
                f = eval(f);
            }
        } catch {}
        return makeAsync(f, o);
    }
}

module.exports = rpcWorker;

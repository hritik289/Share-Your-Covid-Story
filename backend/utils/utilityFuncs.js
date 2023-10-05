const { model } = require("@tensorflow/tfjs");

module.exports.checkifhaskeys = (obj, keys) => {
    let r = true;
    for (e of keys) {
        r = r && Boolean(obj[e]);
    }
    return r
} 


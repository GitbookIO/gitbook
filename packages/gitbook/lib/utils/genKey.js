var lastKey = 0;

/*
    Generate a random key
    @return {String}
*/
function generateKey() {
    lastKey += 1;
    var str = lastKey.toString(16);
    return '00000'.slice(str.length) + str;
}

module.exports = generateKey;

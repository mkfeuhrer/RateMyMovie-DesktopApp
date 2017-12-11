const imdb = require("./lib/imdb.js");

imdb.search({"title": "foo"}, {"apiKey": "3c4ea31f"}).then(function (data) {
    console.log(data);
    return data.next();
}).then(console.log).catch(console.log);

"use strict";
exports.__esModule = true;
function isError(response) {
    return response.Response === "False";
}
exports.isError = isError;
function isTvshow(response) {
    return response.Type === "series";
}
exports.isTvshow = isTvshow;
function isMovie(response) {
    return response.Type === "movie";
}
exports.isMovie = isMovie;
function isEpisode(response) {
    return response.Type === "episode";
}
exports.isEpisode = isEpisode;
//# sourceMappingURL=interfaces.js.map
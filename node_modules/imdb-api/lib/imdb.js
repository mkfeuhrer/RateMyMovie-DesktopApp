"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var util_1 = require("./util");
var interfaces_1 = require("./interfaces");
var es6promise = require("es6-promise");
var rp = require("request-promise");
var Promise = es6promise.Promise;
var omdbapi = "https://www.omdbapi.com/";
function reqtoqueryobj(req, apikey, page) {
    return {
        apikey: apikey,
        page: page,
        r: "json",
        s: req.title,
        type: req.reqtype,
        y: req.year
    };
}
var trans_table = new util_1.Inverter({
    genres: "Genre",
    languages: "Language",
    rating: "imdbRating",
    votes: "imdbVotes"
});
var Episode = (function () {
    function Episode(obj, season) {
        this.season = season;
        for (var attr in obj) {
            if (attr === "Released") {
                var _a = obj[attr].split("-"), year = _a[0], month = _a[1], day = _a[2];
                this.released = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
            }
            else if (attr === "Rating") {
                this[attr.toLowerCase()] = parseFloat(obj[attr]);
            }
            else if (attr === "Episode" || attr === "Season") {
                this[attr.toLowerCase()] = parseInt(obj[attr], 10);
            }
            else if (attr === "Title") {
                this.name = obj[attr];
            }
            else if (trans_table.get(attr) !== undefined) {
                this[trans_table.get(attr)] = obj[attr];
            }
            else {
                this[attr.toLowerCase()] = obj[attr];
            }
        }
    }
    return Episode;
}());
exports.Episode = Episode;
var Movie = (function () {
    function Movie(obj) {
        for (var attr in obj) {
            if (attr === "year" || attr.toLowerCase() === "year") {
                this._year_data = obj[attr];
                if (!obj[attr].match(/\d{4}[\-–]\d{4}/)) {
                    this[attr.toLowerCase()] = parseInt(obj[attr], 10);
                }
            }
            else if (attr === "Released") {
                this.released = new Date(obj[attr]);
            }
            else if (attr === "Rating") {
                this[attr.toLowerCase()] = parseFloat(obj[attr]);
            }
            else if (trans_table.get(attr) !== undefined) {
                this[trans_table.get(attr)] = obj[attr];
            }
            else {
                this[attr.toLowerCase()] = obj[attr];
            }
        }
        this.series = this.type === "movie" ? false : true;
        this.imdburl = "https://www.imdb.com/title/" + this.imdbid;
    }
    return Movie;
}());
exports.Movie = Movie;
var TVShow = (function (_super) {
    __extends(TVShow, _super);
    function TVShow(object, opts) {
        var _this = _super.call(this, object) || this;
        _this._episodes = [];
        var years = _this._year_data.split("-");
        _this.start_year = parseInt(years[0], 10) ? parseInt(years[0], 10) : null;
        _this.end_year = parseInt(years[1], 10) ? parseInt(years[1], 10) : null;
        _this.totalseasons = parseInt(_this.totalseasons, 10);
        _this.opts = opts;
        return _this;
    }
    TVShow.prototype.episodes = function (cb) {
        if (this._episodes.length !== 0) {
            return cb(undefined, this._episodes);
        }
        var tvShow = this;
        var funcs = [];
        for (var i = 1; i <= tvShow.totalseasons; i++) {
            var reqopts = {
                json: true,
                qs: {
                    Season: i,
                    apikey: tvShow.opts.apiKey,
                    i: tvShow.imdbid,
                    r: "json"
                },
                timeout: undefined,
                url: omdbapi
            };
            if ("timeout" in this.opts) {
                reqopts.timeout = this.opts.timeout;
            }
            funcs.push(rp(reqopts));
        }
        var prom = Promise.all(funcs)
            .then(function (ep_data) {
            var eps = [];
            for (var key in ep_data) {
                if (ep_data.hasOwnProperty(key)) {
                    var datum = ep_data[key];
                    if (interfaces_1.isError(datum)) {
                        var err = new ImdbError(datum.Error);
                        if (cb) {
                            return cb(err, undefined);
                        }
                        return Promise.reject(err);
                    }
                    else {
                        var season = parseInt(datum.Season, 10);
                        for (var ep in datum.Episodes) {
                            if (datum.Episodes.hasOwnProperty(ep)) {
                                eps.push(new Episode(datum.Episodes[ep], season));
                            }
                        }
                    }
                }
            }
            tvShow._episodes = eps;
            if (cb) {
                return cb(undefined, eps);
            }
            return Promise.resolve(eps);
        });
        if (cb) {
            prom["catch"](function (err) {
                return cb(err, undefined);
            });
        }
        else {
            return prom;
        }
    };
    return TVShow;
}(Movie));
exports.TVShow = TVShow;
var SearchResult = (function () {
    function SearchResult(obj) {
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) {
                if (attr === "Year") {
                    this.year = parseInt(obj[attr], 10);
                }
                else {
                    this[attr.toLowerCase()] = obj[attr];
                }
            }
        }
    }
    return SearchResult;
}());
exports.SearchResult = SearchResult;
var SearchResults = (function () {
    function SearchResults(obj, page, opts, req) {
        this.results = [];
        this.page = page;
        this.req = req;
        this.opts = opts;
        for (var attr in obj) {
            if (attr === "Search") {
                for (var _i = 0, _a = obj.Search; _i < _a.length; _i++) {
                    var result = _a[_i];
                    this.results.push(new SearchResult(result));
                }
            }
            else {
                this[attr.toLowerCase()] = obj[attr];
            }
        }
    }
    SearchResults.prototype.next = function () {
        return search(this.req, this.opts, this.page + 1);
    };
    return SearchResults;
}());
exports.SearchResults = SearchResults;
var ImdbError = (function () {
    function ImdbError(message) {
        this.message = message;
        this.name = "imdb api error";
    }
    return ImdbError;
}());
exports.ImdbError = ImdbError;
function getReq(req, cb) {
    if (req.opts === undefined || !req.opts.hasOwnProperty("apiKey")) {
        var err = new ImdbError("Missing api key in opts");
        if (cb) {
            return cb(err, undefined);
        }
        else {
            return Promise.reject(err);
        }
    }
    var qs = {
        apikey: req.opts.apiKey,
        i: undefined,
        plot: "full",
        r: "json",
        t: undefined,
        y: req.year
    };
    if (req.name) {
        qs.t = req.name;
    }
    else if (req.id) {
        qs.i = req.id;
    }
    var reqopts = {
        json: true,
        qs: qs,
        timeout: undefined,
        url: omdbapi
    };
    if ("timeout" in req.opts) {
        reqopts.timeout = req.opts.timeout;
    }
    var prom = rp(reqopts).then(function (data) {
        var ret;
        if (interfaces_1.isError(data)) {
            var err = new ImdbError(data.Error + ": " + (req.name ? req.name : req.id));
            if (cb) {
                return cb(err, undefined);
            }
            else {
                return Promise.reject(err);
            }
        }
        else {
            if (interfaces_1.isMovie(data)) {
                ret = new Movie(data);
            }
            else if (interfaces_1.isTvshow(data)) {
                ret = new TVShow(data, req.opts);
            }
            else if (interfaces_1.isEpisode(data)) {
                ret = new Episode(data, 30);
            }
            else {
                var err = new ImdbError("type: " + data.Type + " not valid");
                if (cb) {
                    return cb(err, undefined);
                }
                else {
                    return Promise.reject(err);
                }
            }
            if (cb) {
                return cb(undefined, ret);
            }
            return Promise.resolve(ret);
        }
    });
    if (cb) {
        prom["catch"](function (err) {
            cb(err, undefined);
        });
    }
    else {
        return prom;
    }
}
exports.getReq = getReq;
function get(name, opts, cb) {
    return getReq({ id: undefined, opts: opts, name: name }, cb);
}
exports.get = get;
function getById(imdbid, opts, cb) {
    return getReq({ id: imdbid, opts: opts, name: undefined }, cb);
}
exports.getById = getById;
function search(req, opts, page) {
    if (page === undefined) {
        page = 1;
    }
    var qs = reqtoqueryobj(req, opts.apiKey, page);
    var reqopts = { qs: qs, url: omdbapi, json: true, timeout: undefined };
    if ("timeout" in opts) {
        reqopts.timeout = opts.timeout;
    }
    var prom = rp(reqopts).then(function (data) {
        if (interfaces_1.isError(data)) {
            var err = new ImdbError(data.Error + ": " + req.title);
            return Promise.reject(err);
        }
        else {
            return Promise.resolve(new SearchResults(data, page, opts, req));
        }
    });
    return prom;
}
exports.search = search;
//# sourceMappingURL=imdb.js.map
import { OmdbEpisode, OmdbMovie, OmdbSearch, OmdbSearchResult, OmdbTvshow } from "./interfaces";
export interface MovieOpts {
    apiKey: string;
    timeout?: number;
}
export interface MovieRequest {
    name?: string;
    id?: string;
    year?: number;
    opts: MovieOpts;
}
export declare type RequestType = "movie" | "series" | "episode" | "game";
export interface SearchRequest {
    title: string;
    reqtype?: RequestType;
    year?: number;
}
export declare class Episode {
    season: number;
    name: string;
    episode: number;
    released: Date;
    imdbid: string;
    rating: number;
    constructor(obj: OmdbEpisode, season: number);
}
export declare class Movie {
    imdbid: string;
    imdburl: string;
    genres: string;
    languages: string;
    country: string;
    votes: string;
    series: boolean;
    rating: number;
    runtime: string;
    title: string;
    year: number;
    type: string;
    poster: string;
    metascore: string;
    plot: string;
    rated: string;
    director: string;
    writer: string;
    actors: string;
    released: Date;
    protected _year_data: string;
    constructor(obj: OmdbMovie);
}
export declare class TVShow extends Movie {
    start_year: any;
    end_year: any;
    totalseasons: any;
    private _episodes;
    private opts;
    constructor(object: OmdbTvshow, opts: MovieOpts);
    episodes(cb?: (err: Error, data: Episode[]) => any): Promise<Episode[]>;
}
export declare class SearchResult {
    title: string;
    year: number;
    imdbid: string;
    type: RequestType;
    poster: string;
    constructor(obj: OmdbSearchResult);
}
export declare class SearchResults {
    results: SearchResult[];
    totalresults: number;
    private page;
    private opts;
    private req;
    constructor(obj: OmdbSearch, page: number, opts: MovieOpts, req: SearchRequest);
    next(): Promise<SearchResults>;
}
export declare class ImdbError {
    message: string;
    name: string;
    constructor(message: string);
}
export declare function getReq(req: MovieRequest, cb?: (err: Error, data: Movie | Episode) => any): Promise<Movie>;
export declare function get(name: string, opts: MovieOpts, cb?: (err: Error, data: Movie) => any): Promise<Movie>;
export declare function getById(imdbid: string, opts: MovieOpts, cb?: (err: Error, data: Movie) => any): Promise<Movie>;
export declare function search(req: SearchRequest, opts: MovieOpts, page?: number): Promise<SearchResults>;

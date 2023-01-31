import MongoBaseService from './mongo.service.js';
import {Event} from '../models/event.js';

export default class EventsService {
    #mongoBaseService;
    // #authBaseService;
    constructor() {
        this.#mongoBaseService = new MongoBaseService(Event);
        // this.#authBaseService = new AuthBaseService(User);
    }

    async create(req, res) {
        return await this.#mongoBaseService.create(req, res);
    }

    async getOne(req, res) {
        return await this.#mongoBaseService.getOne(req, res);
    }

    async getMany(req, res) {
        return await this.#mongoBaseService.getMany(req, res);
    }

};


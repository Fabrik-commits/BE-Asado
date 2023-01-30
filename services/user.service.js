import MongoBaseService from './mongo.service.js';
import User from '../models/user.js';

export default class UsersService {
    #mongoBaseService;
    // #authBaseService;
    constructor() {
        this.#mongoBaseService = new MongoBaseService(User);
        // this.#authBaseService = new AuthBaseService(User);
    }

    async create(req, res) {
        console.log('Creé una cuenta');
        return await this.#mongoBaseService.createUser(req, res);
    }

    async getOne(req, res) {
        return await this.#mongoBaseService.getOne(req, res);
    }

    async getMany(req, res) {
        return await this.#mongoBaseService.getMany(req, res);
    }

}

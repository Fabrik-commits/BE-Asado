import MongoBaseService from './mongo.service.js';
import {TransferReceipt} from '../models/transferReceipt.js';

export default class TransferReceiptService {
    #mongoBaseService;
    // #authBaseService;
    constructor() {
        this.#mongoBaseService = new MongoBaseService(TransferReceipt);
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


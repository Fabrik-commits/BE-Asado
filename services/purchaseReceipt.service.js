import MongoBaseService from './mongo.service.js';
import {PurchaseReceipt} from '../models/purchaseReceipt.js';

export default class PurchaseReceiptService {
    #mongoBaseService;
    // #authBaseService;
    constructor() {
        this.#mongoBaseService = new MongoBaseService(PurchaseReceipt);
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


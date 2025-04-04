"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const stock_1 = require("../models/stock");
const router = express_1.default.Router();
exports.router = router;
/* ホームページ */
router.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const results = yield stock_1.Stock.findAll({ order: [["id", "ASC"]] });
        const availableStock = results.filter((product) => product.getDataValue("stock") > 0);
        const total = yield stock_1.Stock.sum("stock");
        res.render("index", {
            products: availableStock,
            sum: total
        });
    }
    catch (error) {
        res.status(500).send("エラーが発生しました");
        console.log(`エラー: ${error}`);
    }
}));
router.get('/usage', (req, res, next) => {
    res.render('usage');
});

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
const get_basefood_info_1 = require("../get-basefood-info");
const stock_1 = require("../models/stock");
const sequelize_loader_1 = require("../models/sequelize-loader");
const router = express_1.default.Router();
exports.router = router;
/* 個数を取得し表示する */
router.get('/add-stocks', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield (0, get_basefood_info_1.getBaseInfo)();
        for (const product of products) {
            const results = yield stock_1.stock.findOne({ where: { name: product.name } });
            if (!results) {
                yield stock_1.stock.create({ name: product.name, stock: product.stock });
            }
            else {
                yield stock_1.stock.update({ stock: product.stock }, { where: { name: product.name } });
            }
        }
        res.redirect("/");
    }
    catch (error) {
        // エラーハンドリング
        res.status(500).send("エラーが発生しました");
        console.log(`エラー: ${error}`);
    }
}));
/* 在庫管理（在庫を1つ減らす） */
router.post('/update-stock', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield stock_1.stock.update({ stock: sequelize_loader_1.sqlZ.literal('stock - 1') }, { where: { code: req.body.verifyCode } });
        res.redirect("/");
    }
    catch (error) {
        // エラーハンドリング
        res.status(500).send("エラーが発生しました");
        console.log(`エラー: ${error}`);
    }
}));
router.post('/register-code', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const registeredInfo = req.body.registeredInfo;
    const productCode = registeredInfo.split(" ")[0]; // バーコード
    const productName = registeredInfo.split(" ")[1]; // 商品名
    try {
        const result = yield stock_1.stock.findOne({ where: { name: productName } });
        if (!result) {
            res.status(404).send("登録対象の商品が見つかりませんでした");
            return;
        }
        yield stock_1.stock.update({ code: productCode }, { where: { name: productName } });
        res.redirect("/");
    }
    catch (error) {
        // エラーハンドリング
        res.status(500).send("エラーが発生しました");
        console.log(`エラー: ${error}`);
    }
}));
router.post('/api/update-stock', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { products } = req.body;
        if (!Array.isArray(products)) {
            return res.status(400).json({ error: 'Invalid format' });
        }
        for (const product of products) {
            yield stock_1.stock.create({
                name: product.name,
                stock: parseInt(product.stock, 10),
                code: product.code,
            });
        }
        res.status(200).send('保存完了');
    }
    catch (err) {
        console.error('保存時エラー:', err);
        res.status(500).send('サーバーエラー');
    }
}));

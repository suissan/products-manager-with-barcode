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
const sequelize_loader_1 = require("../models/sequelize-loader");
const Pushover = require("pushover-notifications");
const router = express_1.default.Router();
exports.router = router;
const pushover = new Pushover({
    token: process.env.PUSHOVER_TOKEN,
    user: process.env.PUSHOVER_USER_KEY
});
// pushoverで通知する際のデータセット
const pushData = {
    message: "", // required
    title: "ベースフード利用通知", //required
    sound: "kiai",
    device: "itaipuBlue",
    url: "https://products-manager-with-barcode.onrender.com/",
    url_title: "詳細ページ",
    priority: 1
};
/* 個数を取得し表示する */
router.post('/add-stocks', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { products } = req.body;
    if (!Array.isArray(products)) {
        return res.status(400).json({ error: 'Invalid format' });
    }
    try {
        for (const product of products) {
            const existing = yield stock_1.Stock.findOne({ where: { name: product.name } });
            if (existing) {
                // すでに存在していたら、在庫だけ更新
                yield stock_1.Stock.update({ stock: parseInt(product.stock, 10) }, { where: { name: product.name } });
            }
            else {
                // 存在しない場合は新規作成
                yield stock_1.Stock.create({
                    name: product.name,
                    stock: parseInt(product.stock, 10),
                    code: (_a = product.code) !== null && _a !== void 0 ? _a : null,
                });
            }
        }
        res.status(200).send('保存完了');
    }
    catch (err) {
        console.error('保存エラー:', err);
        res.status(500).send('サーバーエラー');
    }
}));
/* 在庫管理（在庫を1つ減らす） */
router.post('/update-stock', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // anyとなっている部分は妥協点。直す。
        const product = yield stock_1.Stock.findOne({ where: { code: req.body.verifyCode } });
        if (!product) {
            return res.status(404).send('商品が見つかりませんでした');
        }
        // 在庫が0以下なら減らさない
        if (product.stock <= 0) {
            return res.status(400).send('在庫がありません');
        }
        yield stock_1.Stock.update({ stock: sequelize_loader_1.sqlZ.literal('stock - 1') }, { where: { code: req.body.verifyCode } });
        pushData.message = `${product.name}の利用がありました。`;
        pushover.send(pushData, (err, result) => {
            if (err) {
                throw err;
            }
            else {
                console.log(`Notification sent: ${result}`);
            }
            ;
        });
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
        const result = yield stock_1.Stock.findOne({ where: { name: productName } });
        if (!result) {
            res.status(404).send("登録対象の商品が見つかりませんでした");
            return;
        }
        yield stock_1.Stock.update({ code: productCode }, { where: { name: productName } });
        res.redirect("/");
    }
    catch (error) {
        // エラーハンドリング
        res.status(500).send("エラーが発生しました");
        console.log(`エラー: ${error}`);
    }
}));

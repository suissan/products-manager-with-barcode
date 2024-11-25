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
exports.getBaseInfo = getBaseInfo;
const puppeteer_1 = __importDefault(require("puppeteer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const LOGIN_URL = process.env.LOGIN_URL;
const REGISTER_MAIL_ADDRESS = process.env.REGISTER_MAIL_ADDRESS;
const REGISTER_PASSWORD = process.env.REGISTER_PASSWORD;
const TARGET_URL = process.env.TARGET_URL;
function getBaseInfo() {
    return __awaiter(this, void 0, void 0, function* () {
        const browser = yield puppeteer_1.default.launch({
            args: [
                "--disable-setuid-sandbox",
                "--no-sandbox",
                "--single-process",
                "--no-zygote",
            ],
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH
        });
        try {
            const page = yield browser.newPage();
            yield page.setDefaultNavigationTimeout(0); // タイムアウトを阻止
            yield page.goto(LOGIN_URL);
            yield page.type("#CustomerEmail", REGISTER_MAIL_ADDRESS);
            yield page.type("#CustomerPassword", REGISTER_PASSWORD);
            yield page.click('button[form="login"]');
            yield page.waitForNavigation();
            yield page.goto(TARGET_URL);
            yield page.waitForSelector('.mypage__products');
            console.log("対象ページの取得が完了");
            const createProductsInfo = yield page.evaluate(() => {
                const productsList = [];
                const productElements = Array.from(document.querySelectorAll('.NextDelivery_subscriptionProducts__aEkj8')); // 商品一覧
                const selectElements = Array.from(document.querySelectorAll('select')); // <select>要素を取得
                const loopLength = productElements[0].children.length + 2; // 2はセレクトタグ取得で購入数のプルダウンが始まる位置
                for (let i = 0; i < loopLength; i++) {
                    if (i <= 1) {
                        continue;
                    }
                    const productElement = productElements[0].children[i - 2].querySelector("span");
                    const productName = productElement ? productElement.innerHTML.trim().split("\n")[0] : "不明"; // 商品の名前;
                    const matchResult = selectElements[i].options[selectElements[i].selectedIndex].innerText.match(/\d+/); // 買った個数
                    const productStock = matchResult ? matchResult[0] : "0"; // 在庫数
                    if (productStock !== "0") {
                        const productInfo = {
                            name: productName,
                            stock: productStock
                        };
                        productsList.push(productInfo);
                    }
                }
                return productsList;
            });
            yield browser.close();
            return createProductsInfo;
        }
        catch (error) {
            console.log(`puppeteerのエラー: ${error}`);
            throw error;
        }
    });
}

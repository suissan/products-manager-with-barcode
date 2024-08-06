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
            yield page.goto("https://shop.basefood.co.jp/account/login");
            yield page.type("#CustomerEmail", "suiMox7.sg@gmail.com");
            yield page.type("#CustomerPassword", "u6e67u958b");
            yield page.click('button[form="login"]');
            yield page.waitForNavigation();
            yield page.goto("https://shop.basefood.co.jp/mypage/subscription");
            yield page.waitForSelector('.mypage__products');
            console.log("対象ページの取得が完了");
            const createProductsInfo = yield page.evaluate(() => {
                const productsList = [];
                const productElements = Array.from(document.querySelectorAll('.mypage__products')); // 商品一覧
                const selectElements = Array.from(document.querySelectorAll('select')); // <select>要素を取得
                selectElements.forEach((ele, index) => {
                    if (index <= 1) {
                        return;
                    }
                    const productName = productElements[index - 2].children[1].innerHTML.trim().split("\n")[0]; // 商品の名前
                    const productStock = ele.options[ele.selectedIndex].innerText.match(/\d+/)[0]; // 買った個数
                    if (productStock !== "0") {
                        const productInfo = {
                            name: productName,
                            stock: productStock
                        };
                        productsList.push(productInfo);
                    }
                });
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

import puppeteer from "puppeteer";
import dotenv from "dotenv";

dotenv.config();

interface BaseInfo {
    name: string;
    stock: string;
}

const LOGIN_URL = process.env.LOGIN_URL as string;
const REGISTER_MAIL_ADDRESS = process.env.REGISTER_MAIL_ADDRESS as string;
const REGISTER_PASSWORD = process.env.REGISTER_PASSWORD as string;
const TARGET_URL = process.env.TARGET_URL as string;

async function getBaseInfo(): Promise<BaseInfo[]> {
    const browser = await puppeteer.launch({
        args: [
            "--disable-setuid-sandbox",
            "--no-sandbox",
            "--single-process",
            "--no-zygote",
        ],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH
    });

    try {
        const page = await browser.newPage();
        await page.setDefaultNavigationTimeout(0); // タイムアウトを阻止
        await page.goto(LOGIN_URL);
        await page.type("#CustomerEmail", REGISTER_MAIL_ADDRESS);
        await page.type("#CustomerPassword", REGISTER_PASSWORD);
        await page.click('button[form="login"]');
        await page.waitForNavigation();
        await page.goto(TARGET_URL);
        await page.waitForSelector('.mypage__products');

        console.log("対象ページの取得が完了");

        const createProductsInfo = await page.evaluate(() => {
            const productsList: BaseInfo[] = [];
            const productElements: HTMLElement[] | null = Array.from(document.querySelectorAll('.NextDelivery_subscriptionProducts__aEkj8')); // 商品一覧
            const selectElements: HTMLSelectElement[] | null = Array.from(document.querySelectorAll('select')); // <select>要素を取得

            const loopLength = productElements[0].children.length + 2; // 2はセレクトタグ取得で購入数のプルダウンが始まる位置
            for (let i = 0; i < loopLength; i++) {
                if (i <= 1) {
                    continue;
                }
                
                const productElement = productElements[0].children[i - 2].querySelector("span");
                const productName: string = productElement ? productElement.innerHTML.trim().split("\n")[0] : "不明"; // 商品の名前;
                const matchResult = selectElements[i].options[selectElements[i].selectedIndex].innerText.match(/\d+/); // 買った個数
                const productStock: string = matchResult? matchResult[0] : "0"; // 在庫数
                if (productStock !== "0") {
                    const productInfo: BaseInfo = {
                        name: productName,
                        stock: productStock
                    };
                    productsList.push(productInfo);
                }
            }
            return productsList;
        });
        await browser.close();

        return createProductsInfo;

    } catch (error) {
        console.log(`puppeteerのエラー: ${error}`);
        throw error;
    }
}

export { getBaseInfo, BaseInfo }
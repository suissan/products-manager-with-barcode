import puppeteer from "puppeteer";
import dotenv from "dotenv";

dotenv.config();

interface BaseInfo {
    name: string;
    stock: string;
}

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
        await page.goto("https://shop.basefood.co.jp/account/login");
        await page.type("#CustomerEmail", "suiMox7.sg@gmail.com");
        await page.type("#CustomerPassword", "u6e67u958b");
        await page.click('button[form="login"]');
        await page.waitForNavigation();
        await page.goto("https://shop.basefood.co.jp/mypage/subscription");
        await page.waitForSelector('.mypage__products');

        console.log("対象ページの取得が完了");

        const createProductsInfo = await page.evaluate(() => {
            const productsList: BaseInfo[] = [];
            const productElements: HTMLElement[] = Array.from(document.querySelectorAll('.mypage__products')); // 商品一覧
            const selectElements: HTMLSelectElement[] = Array.from(document.querySelectorAll('select')); // <select>要素を取得
            selectElements.forEach((ele: any, index: number) => {
                if (index <= 1) {
                    return;
                }
                const productName: string = productElements[index - 2].children[1].innerHTML.trim().split("\n")[0]; // 商品の名前
                const productStock: string = ele.options[ele.selectedIndex].innerText.match(/\d+/)[0]; // 買った個数
                if (productStock !== "0") {
                    const productInfo: BaseInfo = {
                        name: productName,
                        stock: productStock
                    };
                    productsList.push(productInfo);
                }
            });
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
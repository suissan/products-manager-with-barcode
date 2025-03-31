const puppeteer = require("puppeteer");
require("dotenv").config();

async function getBaseInfo() {
  const LOGIN_URL = process.env.LOGIN_URL;
  const REGISTER_MAIL_ADDRESS = process.env.REGISTER_MAIL_ADDRESS;
  const REGISTER_PASSWORD = process.env.REGISTER_PASSWORD;
  const TARGET_URL = process.env.TARGET_URL;

  const browser = await puppeteer.launch({
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ],
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
  });

  try {
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);
    await page.goto(LOGIN_URL);
    await page.type("#CustomerEmail", REGISTER_MAIL_ADDRESS);
    await page.type("#CustomerPassword", REGISTER_PASSWORD);
    await page.click('button[form="login"]');
    await page.waitForNavigation();
    await page.goto(TARGET_URL);
    await page.waitForSelector('.NextDelivery_subscriptionProducts__aEkj8');

    const products = await page.evaluate(() => {
      const productsList = [];
      const productElements = Array.from(document.querySelectorAll('.NextDelivery_subscriptionProducts__aEkj8'));
      const selectElements = Array.from(document.querySelectorAll('select'));

      const loopLength = productElements[0].children.length + 2;
      for (let i = 0; i < loopLength; i++) {
        if (i <= 1) continue;

        const productElement = productElements[0].children[i - 2].querySelector("span");
        const productName = productElement ? productElement.innerHTML.trim().split("\n")[0] : "不明";
        const matchResult = selectElements[i].options[selectElements[i].selectedIndex].innerText.match(/\d+/);
        const productStock = matchResult ? matchResult[0] : "0";

        if (productStock !== "0") {
          productsList.push({ name: productName, stock: productStock });
        }
      }

      return productsList;
    });

    await browser.close();
    return products;

  } catch (error) {
    await browser.close();
    console.error("puppeteerエラー:", error);
    throw error;
  }
}

module.exports = { getBaseInfo };

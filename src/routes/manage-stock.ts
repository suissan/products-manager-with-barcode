import express, { NextFunction, Request, Response } from "express";
import { Stock } from "../models/stock";
import { sqlZ } from "../models/sequelize-loader";
const Pushover = require("pushover-notifications");

const router = express.Router();

const pushover = new Pushover({
    token: process.env.PUSHOVER_TOKEN,
    user: process.env.PUSHOVER_USER_KEY
});

// pushoverで通知する際のデータセット
const pushData = {
    message: "",	// required
    title: "ベースフード利用通知", //required
    sound: "kiai",
    device: "itaipuBlue",
    url: "https://products-manager-with-barcode.onrender.com/",
    url_title: "詳細ページ",
    priority: 1
}

/* 個数を取得し表示する */
router.post('/add-stocks', async (req: Request, res: Response, next: NextFunction) => {

    const { products } = req.body;

    if (!Array.isArray(products)) {
        return res.status(400).json({ error: 'Invalid format' });
    }

    try {
        for (const product of products) {
            const existing = await Stock.findOne({ where: { name: product.name } });

            if (existing) {
                // すでに存在していたら、在庫だけ更新
                await Stock.update(
                    { stock: parseInt(product.stock, 10) },
                    { where: { name: product.name } }
                );
            } else {
                // 存在しない場合は新規作成
                await Stock.create({
                    name: product.name,
                    stock: parseInt(product.stock, 10),
                    code: product.code ?? null,
                });
            }
        }

        res.status(200).send('保存完了');
    } catch (err) {
        console.error('保存エラー:', err);
        res.status(500).send('サーバーエラー');
    }

});

/* 在庫管理（在庫を1つ減らす） */
router.post('/update-stock', async (req: Request, res: Response, next: NextFunction) => {
    try {

        // anyとなっている部分は妥協点。直す。
        const product = await Stock.findOne({ where: { code: req.body.verifyCode } });

        if (!product) {
            return res.status(404).send('商品が見つかりませんでした');
          }
      
        // 在庫が0以下なら減らさない
        if (product.stock <= 0) {
            return res.status(400).send('在庫がありません');
        }

        await Stock.update({ stock: sqlZ.literal('stock - 1') }, { where: { code: req.body.verifyCode } });

        pushData.message = `${product.name}の利用がありました。`;
        pushover.send(pushData, (err: Error, result: any) => {
            if (err) {
                throw err
    
            } else {
                console.log(`Notification sent: ${result}`)
            };
        });

        res.redirect("/");

    } catch (error) {

        // エラーハンドリング
        res.status(500).send("エラーが発生しました");
        console.log(`エラー: ${error}`);
    }
});

router.post('/register-code', async (req: Request, res: Response, next: NextFunction) => {
    const registeredInfo: string = req.body.registeredInfo;
    const productCode: string = registeredInfo.split(" ")[0]; // バーコード
    const productName: string = registeredInfo.split(" ")[1]; // 商品名

    try {
        const result: object | null = await Stock.findOne({ where: { name: productName } });

        if (!result) {
            res.status(404).send("登録対象の商品が見つかりませんでした");
            return;
        }
        await Stock.update({ code: productCode }, { where: { name: productName } });

        res.redirect("/");

    } catch (error) {

        // エラーハンドリング
        res.status(500).send("エラーが発生しました");
        console.log(`エラー: ${error}`);
    }
});

export { router }

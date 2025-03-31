import express, { NextFunction, Request, Response } from "express";
import { getBaseInfo, BaseInfo } from "../get-basefood-info";
import { stock as Stock } from "../models/stock";
import { sqlZ } from "../models/sequelize-loader";


const router = express.Router();

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
        await Stock.update({ stock: sqlZ.literal('stock - 1') }, { where: { code: req.body.verifyCode } });

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

router.post('/api/update-stock', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { products } = req.body;

        if (!Array.isArray(products)) {
            return res.status(400).json({ error: 'Invalid format' });
        }

        for (const product of products) {
            await Stock.create({
                name: product.name,
                stock: parseInt(product.stock, 10),
                code: product.code,
            });
        }

        res.status(200).send('保存完了');
    } catch (err) {
        console.error('保存時エラー:', err);
        res.status(500).send('サーバーエラー');
    }

});

export { router }

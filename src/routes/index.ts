import express, { NextFunction, Request, Response } from "express";
import { stock as Stock } from "../models/stock";
const router = express.Router();

/* ホームページ */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const results = await Stock.findAll({ order: [["id", "ASC"]] });
    const total = await Stock.sum("stock");
    res.render("index", {
      products: results,
      sum: total
    });

  } catch (error) {
    res.status(500).send("エラーが発生しました");
    console.log(`エラー: ${error}`);
  }
});

router.get('/usage', (req: Request, res: Response, next: NextFunction) => {
  res.render('usage');
});

export { router }
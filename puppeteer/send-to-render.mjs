import fetch from "node-fetch";
import { getBaseInfo } from "./get-basefood-info.js";

(async () => {
  try {
    const products = await getBaseInfo();

    const res = await fetch("https://products-manager-with-barcode.onrender.com/products/add-stocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ products }),
    });

    const text = await res.text();
    console.log("Renderからの返答:", text);
  } catch (error) {
    console.error("送信エラー:", error);
  }
})();

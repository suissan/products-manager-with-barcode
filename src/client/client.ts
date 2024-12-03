'use strict';

const modeManage: HTMLElement | null = document.getElementById("manage");
const modeRegister: HTMLElement | null = document.getElementById("register");
const manageForm: HTMLElement | null = document.getElementById("manageForm");
const registerForm: HTMLElement | null = document.getElementById("registerForm");
const getProducts: NodeListOf<Element> | [] = document.querySelectorAll(".productDisplay");
const styleSheet: any = document.styleSheets[0]; // /public/stylesheets/style.css

// cdnはwindowオブジェクトに格納される
interface Window {
    Quagga: any;
}

/* 読み込みのたびに実行 */
(() => {
    /* バーコード登録済みの商品のリストを塗りつぶす */
    for (let product of getProducts) {
        if (product.lastElementChild?.hasAttribute('value')) {
            product.classList.add('registered');
            styleSheet.insertRule(
                '.registered::marker {color: #04e69b}',
            )
        }
    }

    /* 状況に応じてラジオボタンのデフォルト値を決定 */
    const getRegistered: NodeListOf<Element> | null = document.querySelectorAll(".registered");
    if (getRegistered.length !== getProducts.length) {
        (modeRegister as HTMLInputElement).checked = true;
    } else {
        (modeManage as HTMLInputElement).checked = true;
    }

    handleRadioChange();

})();

/* バーコードリーダーの設定 */
window.Quagga.init({
    inputStream: {
        type: "LiveStream",
        target: document.querySelector('#cameraCanvas'),
        constraints: {
            facingMode: "user"
        },
    },
    decoder: {
        readers: ["ean_reader"]
    }
},
    (err: Error) => {
        if (err) {
            console.log(err);
            return;
        }
        console.log("Initialization finished. Ready to start");
        window.Quagga.start();
    });

/* バーコードを読み取ったあとの処理（枠で囲う等） */
window.Quagga.onProcessed((result: any) => {
    let ctx = window.Quagga.canvas.ctx.overlay;
    let canvas = window.Quagga.canvas.dom.overlay;

    ctx.clearRect(0, 0, parseInt(canvas.width), parseInt(canvas.height));

    if (result) {
        if (result.box) {
            console.log(JSON.stringify(result.box));
            window.Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, ctx, { color: 'blue', lineWidth: 2 });
        }
    }

});

/* バーコードを完全に読み取った後の処理（読み取ったコード・商品名を表示等） */
let code: string;
let count = 0;
window.Quagga.onDetected((result: any) => {
    if (code == result.codeResult.code) {
        count++;
    } else {
        count = 0;
        code = result.codeResult.code;
    }
    if (count >= 3 && /^45/.test(code)) {
        if (!(modeManage as HTMLInputElement).checked) {
            (document.getElementById("registerCodeInput") as HTMLInputElement).value = code;
            return;
        }
        (document.getElementById("verifyCodeInput") as HTMLInputElement).value = code;
        (document.getElementById("productName") as HTMLElement).textContent = getProductName(code);

    }
});

/**
 * 商品名を返す関数
 * @param {String} code リーダーで読み取ったコード
 * @returns 商品名
 */
function getProductName(code: string): string | null {
    for (let product of getProducts) {
        if (product.lastElementChild && (product.lastElementChild as HTMLInputElement).value == code) {
            const productName = product.firstChild?.textContent?.split(":")[0]; // 商品名を取得
            return productName ?? null;
        }
    }
    return null;
}

/* ラジオボタンでどのフォームを表示するか決定する */
function handleRadioChange() {
    if ((modeManage as HTMLInputElement).checked) {
        manageForm ? manageForm.style.visibility = "visible" : "";
        registerForm ? registerForm.style.visibility = "hidden" : "";
    } else if ((modeRegister as HTMLInputElement).checked) {
        registerForm ? registerForm.style.visibility = "visible" : "";
        manageForm ? manageForm.style.visibility = "hidden" : "";
    }
}

/* ラジオボタンで在庫管理フォームの表示 */
modeManage?.addEventListener("change", handleRadioChange);

/* ラジオボタンでバーコード登録フォームを表示 */
modeRegister?.addEventListener("change", handleRadioChange);

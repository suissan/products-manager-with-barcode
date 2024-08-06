module.exports = {
    entry: "./dist/client/client.js",
    output: {
        filename: "bundle.js", // バンドルファイル名
        path: `${__dirname}/public/javascripts` // 出力先ディレクトリ
    },
    resolve: {
        extensions: ["ts", "js"] // バンドル元でファイルを読み込んでいる場合その拡張子を省略できる
    },
    mode: "production", // ディベロップメントビルド
}
# yakuzen-cube LP 画像配置ガイド

`yakuzen-cube/index.html` の Gallery セクションでは、以下 4 枚の実写画像を
このフォルダに配置することで SVG から差し替えられる構成になっています。

## 必要な画像ファイル

| ファイル名 | 内容 | 想定アスペクト比 |
|---|---|---|
| `leaflet-cover.jpg` | リーフレット表紙（白地＋黄色のブロブ、惑星＋手のアイコン、YAKUZEN CUBE ロゴ） | 3 : 4 推奨 |
| `leaflet-info.jpg` | 原材料・使用量が書かれた黄色いリーフレット | 3 : 4 推奨 |
| `leaflet-herbs.jpg` | 「6種の生薬」ページ（薬膳キューブの拡大写真付き） | 3 : 4 推奨 |
| `leaflet-concept.jpg` | 「薬膳料理とは」コンセプト・作り手紹介ページ | 3 : 4 推奨 |

## 配置方法

上記ファイル名で `yakuzen-cube/images/` 配下に保存するだけで OK です。

```
yakuzen-cube/
├── index.html
└── images/
    ├── ![leaflet-cover](https://github.com/user-attachments/assets/92897ebe-5490-490d-99c3-97f7e539eacb)
    ├── ![leaflet-info](https://github.com/user-attachments/assets/9f44a4ff-48f0-484a-953c-c0371c973d8d)
    ├── ![leaflet-herbs](https://github.com/user-attachments/assets/cc44f46e-27c2-4a8a-8574-cb56c19aab27)
    └── ![leaflet-info](https://github.com/user-attachments/assets/22ea2738-4a95-4675-922e-16546e52c9fc)
```

HTML 側の `<img src="./images/xxx.jpg">` は変更不要。ブラウザをリロードすれば
画像が表示されます。

## 画像仕様の目安

- **形式**: JPG / PNG / WebP いずれでも可（拡張子を変えた場合は HTML の `src` も
  対応する拡張子に書き換えてください）
- **解像度**: 長辺 1200px 程度あれば十分綺麗に表示されます
- **容量**: 1 枚あたり 300KB 以下が理想（ページ全体の読込速度のため）
- **アスペクト比**: 3:4 前後推奨。ただし `object-fit: cover` で中央寄せトリミング
  されるため、多少違っても破綻しません

## 画像が未配置のとき

`<img>` の読込に失敗している状態でも、`.gallery-item::before` のプレースホルダー
「画像準備中」が下地に表示されるのでレイアウトは崩れません。

## 未使用の SVG について

Gallery 以外の箇所（ヒーローのパッケージ、生薬アイコン、作り手アバター等）は
引き続きインライン SVG のままです。これらも実写画像に差し替えたい場合は、
同様にこのフォルダに以下のような名前で画像を配置し、対応する `<svg>` ブロックを
`<img>` タグに書き換えてください：

- `package.jpg` — 商品パッケージ
- `cube-closeup.jpg` — キューブ拡大写真
- `maker-honjima.jpg` / `maker-isoda.jpg` — 作り手の顔写真

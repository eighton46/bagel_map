# BagelMap（ベーグルマップ）

![screenshot](app/assets/images/ogp_bagel.png)

## 🔍 サービス概要

**BagelMap** は、ベーグル専門店を地図上で簡単に検索できるWebアプリです。現在地や指定したエリア周辺のベーグル専門店を地図上ですぐに確認でき、ベーグル好きの方が「行ってみたい！」と思えるお店を探すお手伝いをします。

---

## 💡 サービスを作った背景

ベーグルにハマった母と一緒に専門店を探していたとき、「普通の地図アプリでは見つけづらい」「情報が少ない」と感じたのがきっかけです。

Googleマップでは検索がうまくヒットしないことも多く、ベーカリーやカフェが混ざってしまうことも……。「それならベーグル専門店だけに絞った検索ができるアプリを作ろう！」と思い立ち、開発に至りました。

---

## 👤 想定ユーザー

- ベーグルが好きな人
- ベーグル専門店をめぐってみたい人
- 健康志向の人や卵・乳製品を控えたい人（ベーグルは卵・バター・ミルク不使用が多め）

---

## 🚀 実装機能

- GoogleMapsによる地図表示
- 現在地取得 & 周辺の店舗表示
- キーワード検索機能（店名・住所）
- GoogleMapの評価やレビュー数による絞り込み
- 検索結果一覧と地図上のピン表示
- 営業中／閉店中アイコンの色分け
- 店舗の基本情報表示（評価、住所、営業時間など）

---

## 📸 実際の画面と機能紹介

| 現在地取得・周辺店舗の表示 |
| :---: |
| [![Image from Gyazo](https://i.gyazo.com/f5f38ee2caae966dc8d6c4ff693fc857.gif)](https://gyazo.com/f5f38ee2caae966dc8d6c4ff693fc857) |
| <p align="left">「現在地を取得」ボタンをクリックすると、現在位置を中心に地図が表示されます。地図にはベーグル専門店が表示されていて、現在地周辺の店舗を検索できます。</p> |
<br>

| キーワード検索と地図上での詳細遷移 | |
| :---: | :---: |
| 地図からアクセス | 一覧からアクセス |
| [![Image from Gyazo](https://i.gyazo.com/11c596da2597b82e97a1fd6c67d02b21.gif)](https://gyazo.com/11c596da2597b82e97a1fd6c67d02b21) | [![Image from Gyazo](https://i.gyazo.com/4f98914965942a313ebc9df25f75f1be.gif)](https://gyazo.com/4f98914965942a313ebc9df25f75f1be) |
| <p align="left">店名や住所で検索を行うと、地図上に該当店舗が表示され、ピンをクリックすることで詳細ページにアクセスできます。</p> | <p align="left">検索結果は地図とともにリストとしても表示され、そこから店舗の詳細ページにアクセスすることも可能です。</p> |
<br>

| 絞り込み検索（評価・レビュー数） |
| :---: |
| [![Image from Gyazo](https://i.gyazo.com/308f0a486bc9658fa0083aa5a9dfab80.gif)](https://gyazo.com/308f0a486bc9658fa0083aa5a9dfab80) |
| <p align="left">Googleの評価・レビュー数で店舗を絞り込むことができ、高評価のお店を見つけやすくします。</p> |
<br>

| ソート機能（評価・レビュー数） |
| :---: |
| [![Image from Gyazo](https://i.gyazo.com/d14f7392ddba7c2c3e26a9da8944411f.gif)](https://gyazo.com/d14f7392ddba7c2c3e26a9da8944411f) |
| <p align="left">評価やレビュー数順で並び替えができ、条件に合うお店を見つけやすくなります。</p> |
<br>

| 地図のリセット・現在地の再取得 | |
| :---: | :---: |
| [![Image from Gyazo](https://i.gyazo.com/f0bb213191a137c74720c5b70cc95194.gif)](https://gyazo.com/f0bb213191a137c74720c5b70cc95194) | [![Image from Gyazo](https://i.gyazo.com/bbb43a07783afb675b8bb0ec55c7eefc.gif)](https://gyazo.com/bbb43a07783afb675b8bb0ec55c7eefc) |
| <p align="left">リセットボタンで地図と検索結果を初期状態に戻すことができます。</p> | <p align="left">現在地取得ボタンで再度現在地を取得することができます。</p> |
<br>

| 営業状況によるピンの色分け |
| :---: |
| [![Image from Gyazo](https://i.gyazo.com/eb8e7aae9153e78f86594c1093200eab.gif)](https://gyazo.com/eb8e7aae9153e78f86594c1093200eab) |
| <p align="left">営業中の店舗は茶色、閉店中はグレーで表示され、直感的に開いているお店がわかるよう工夫しています。</p> |
<br>

| GoogleMaps連携 | |
| ルート検索 | GoogleMapsの店舗情報にアクセス |
| :---: | :---: |
| [![Image from Gyazo](https://i.gyazo.com/93223bfb9498627c25ae2947c13d1ca1.gif)](https://gyazo.com/93223bfb9498627c25ae2947c13d1ca1) | [![Image from Gyazo](https://i.gyazo.com/93b7102f695e4a8d27077ea0e1159d5d.gif)](https://gyazo.com/93b7102f695e4a8d27077ea0e1159d5d) |
| <p align="left">各店舗ページにはGoogleMapsのルート検索へのリンクがあり、ナビとして活用できます。</p> | <p align="left">各店舗ページにはGoogleMapsの店舗情報へのリンクがあり、店舗情報を取得できます。</p> |

---

## 🖥 技術スタック

| 分類 | 技術 |
|------|------|
| フロントエンド | HTML / CSS / JavaScript |
| バックエンド | Ruby / Ruby on Rails |
| インフラ | Fly.io |
| 外部API | Google Maps Platform（Places API / Maps API） |

---

## 🗺 地図・位置情報のこだわりポイント

- Google Maps API を用いたピンの表示
- 営業時間を自動判定して色分け（営業中：茶色／営業時間外：グレー）
- ピンをクリックで画像＋詳細情報を表示

---

## 📌 ER図

```mermaid
erDiagram

  BAGELSHOPS {
    integer id PK
    string name
    string address
    float latitude
    float longitude
    string place_id
    string opening_hours
    string photo_references
    integer rating
    integer user_ratings_total
    string website
    string formatted_phone_number
    datetime created_at
    datetime updated_at
  }
```

---

## 🗒 補足：プロジェクト開始当初のREADME

プロジェクトの構想段階で作成した初期READMEも、開発の背景や思考過程を知る参考として以下に掲載しています。

➡ [Start_README.md を読む](./Start_README.md)

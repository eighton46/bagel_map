let map, geocoder, centerPin, infoWindow, bagelShops, searchBagelShops, mode;
let markers = [];
const apiKey = gon.api_key;

const display = document.getElementById("display");

// デフォルト値（東京駅）
const defaultCenter = { lat: 35.6812, lng: 139.7671 };
const defaultZoom = 15;

// 保存された値を取得
let savedCenter = localStorage.getItem("lastCenter");
let savedZoom = localStorage.getItem("lastZoom");

// 取得できた場合は変換して適用
let initialCenter = savedCenter ? JSON.parse(savedCenter) : defaultCenter;
let initialZoom = savedZoom ? parseInt(savedZoom) : defaultZoom;

// 地図表示関数の定義部分
function initMap() {
  if (initialCenter) {
    console.log("initMap実行時中心座標：", initialCenter);
  }
  if (initialZoom) {
    console.log("initMap実行時Zoom：", initialZoom);
  }

  // ページのロードがTurboだったらreturn
  document.addEventListener("turbo:load", function () {
    console.log("ページがロードされました（turbo:load）");
    return;
  });

  // initMapが実行されたことを表示
  console.log("initMapが実行されました");

  geocoder = new google.maps.Geocoder();
  const mapElement = document.getElementById("map");
  if (!mapElement) {
    console.error("Map element not found.");
    return;
  }

  // マーカー初期化
  clearMarkers();

  // ピンに使用するアイコンの設定
  const icons = {
    opening_shop: {
      url: gon.opening_shop_icon,
      scaledSize: new google.maps.Size(52, 52),
    },
    closed_shop: {
      url: gon.closed_shop_icon,
      scaledSize: new google.maps.Size(52, 52),
    },
  };

  // 地図の取得を開始する前にローディングを表示
  const loadingElement = document.getElementById("loading");
  mapElement.classList.add("loading");
  loadingElement.style.display = "flex";

  // 地図に表示する店舗の条件分岐
  if (
    !gon.search_bagel_shops && !gon.reset_button_clicked
  ) {
    mode = "currentLocation"; // ①検索結果なし、リセットfalse
    console.log("mode：", mode);
  } else if (
    gon.search_bagel_shops && !gon.reset_button_clicked
  ) {
    mode = "search"; // ②検索結果あり、リセットfalse
    console.log("mode：", mode);
  } else {
    mode = "reset"; // ③リセットtrue
    console.log("mode：", mode);
  }

  // mapの定義と基本設定（現在地取得できなかったとき）
  map = new google.maps.Map(document.getElementById("map"), {
    center: initialCenter,
    zoom: mode === "currentLocation"
      ? 15
      : initialZoom,
    streetViewControl: false, // ストリートビューのボタン非表示
    mapTypeControl: false, // 地図、航空写真のボタン非表示
    fullscreenControl: false, // フルスクリーンボタン非表示
  });

  // ズームレベルを動的に保存
  google.maps.event.addListener(map, "zoom_changed", function () {
    let lastZoom = map.getZoom();
    localStorage.setItem("lastZoom", lastZoom); // ズームレベルを保存
    console.log("ズームレベルを保存しました：", lastZoom);
  });

  // 中心座標を動的に保存
  google.maps.event.addListener(map, "center_changed", function () {
    let center = map.getCenter();
    let lastCenter = { lat: center.lat(), lng: center.lng() };
    localStorage.setItem("lastCenter", JSON.stringify(lastCenter)); // 中心座標を保存
    console.log("中心座標を保存しました：", lastCenter);
  });

  // infoWindowを作成
  infoWindow = new google.maps.InfoWindow({
    pixelOffset: new google.maps.Size(0, -50),
    maxWidth: 300,
  });

  switch (mode) {
    case "currentLocation":
      // 現在地取得の場合
      console.log("現在地取得");

      bagelShops = gon.bagel_shops;
      showCurrentLocation();

      // Railsから保存された店舗情報を取得して地図上にマーカーを表示
      bagelShops.forEach(function (shop) {
        let markerLatLng = { lat: shop.latitude, lng: shop.longitude }; // 緯度経度のデータ作成
        let operatingHours = "";
        let icon = icons["closed_shop"]; // デフォルトでは「閉店中」のアイコン
        let storeStatus = "準備中または不定期";

        if (shop.opening_hours) {
          // 営業時間情報があれば営業時間をパース
          operatingHours = parseOperatingHours(shop.opening_hours);

          // 営業時間がパースできたら、営業中かどうかを判断
          if (isOpen(operatingHours)) {
            icon = icons["opening_shop"]; // 営業中の場合は「営業中」のアイコン
            storeStatus = "営業中";
          }
        }

        const marker = new google.maps.Marker({
          position: markerLatLng,
          map: map,
          icon: icon,
        });
        markers.push(marker);

        // マーカーがクリックされたときに情報ウィンドウを表示
        marker.addListener("click", function () {
          // photo_referenceをカンマで分割して最初の画像を使用
          if (shop.photo_references) {
            // 画像がある場合
            const photoReferences = shop.photo_references.split(",");
            // const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoReferences[0]}&key=${apiKey}`;
            const photoUrl = `/photos/${photoReferences[0]}`;

            // infoWindowの内容を更新
            infoWindow.setContent(`
            <div class="custom-info">
            <div class="custom-info-item store_status">${storeStatus}</div>
            <div class="custom-info-item photo">
            <img src="${photoUrl}" alt="${
              shop.name
            }" style="width:100%;height:auto;">
              </div>
              <div class="custom-info-item name">${shop.name}</div>
              <div class="custom-info-item address">${shop.address}</div>
              <div class="custom-info-item rating">⭐${
                shop.rating
                  ? `${shop.rating} (${shop.user_ratings_total})`
                  : "評価なし"
              }</div>
                <div class="custom-info-item link_to_detail">
                <a href="/bagel_shops/${shop.id}" >店舗詳細</a>
                </div>
                </div>
                `);
          } else {
            // 画像がない場合
            // infoWindowの内容を更新
            infoWindow.setContent(`
            <div class="custom-info">
            <div class="custom-info-item store_status">${storeStatus}</div>
            <div class="custom-info-item name">${shop.name}</div>
            <div class="custom-info-item address">${shop.address}</div>
            <div class="custom-info-item rating">⭐${
              shop.rating
                ? `${shop.rating} (${shop.user_ratings_total})`
                : "評価なし"
            }</div>
              <div class="custom-info-item link_to_detail">
              <a href="/bagel_shops/${shop.id}" >店舗詳細</a>
              </div>
              </div>
          `);
          }

          // infoWindowを指定したマーカーの位置に表示
          infoWindow.open(map, marker);
        });
      });
      break;

    case "search":
      // ワード検索 or 絞り込み検索の場合
      console.log("ワード検索 or 絞り込み検索");

      //検索ワードがある場合
      searchBagelShops = gon.search_bagel_shops || [];
      let bounds = new google.maps.LatLngBounds(); // 検索結果が1つ以上の場合に地図の範囲を調整するためのBoundsオブジェクトを作成

      console.log("boundsの内容確認：", bounds);
      console.log("検索結果の店舗データ:", searchBagelShops);

      // Railsから保存された店舗情報を取得して地図上にマーカーを表示
      searchBagelShops.forEach(function (shop) {
        if (shop.latitude && shop.longitude) {
          // 緯度経度があるかチェック
          let markerLatLng = new google.maps.LatLng(
            parseFloat(shop.latitude),
            parseFloat(shop.longitude)
          ); // 緯度経度のデータ作成
          let operatingHours = ""; // 営業時間のデータ
          let icon = icons["closed_shop"]; // デフォルトでは「閉店中」のアイコン
          let storeStatus = "準備中または不定期"; // 店舗の営業状況、デフォルトでは「準備中または不定期」

          // boundsに検索結果の緯度経度をプッシュ
          // console.log(markerLatLng)
          bounds.extend(markerLatLng);

          if (shop.opening_hours) {
            // 営業時間情報があれば営業時間をパース
            operatingHours = parseOperatingHours(shop.opening_hours);

            // 営業時間がパースできたら、営業中かどうかを判断
            if (isOpen(operatingHours)) {
              icon = icons["opening_shop"]; // 営業中の場合は「営業中」のアイコン
              storeStatus = "営業中";
            }
          }

          const marker = new google.maps.Marker({
            position: markerLatLng,
            map: map,
            icon: icon,
          });
          markers.push(marker);

          // マーカーがクリックされたときに情報ウィンドウを表示
          marker.addListener("click", function () {
            // photo_referenceをカンマで分割して最初の画像を使用
            if (shop.photo_references) {
              // 画像がある場合
              const photoReferences = shop.photo_references.split(",");
              // const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoReferences[0]}&key=${apiKey}`;
              const photoUrl = `/photos/${photoReferences[0]}`;

              // infoWindowの内容を更新
              infoWindow.setContent(`
              <div class="custom-info">
              <div class="custom-info-item store_status">${storeStatus}</div>
              <div class="custom-info-item photo">
              <img src="${photoUrl}" alt="${
                shop.name
              }" style="width:100%;height:auto;">
              </div>
              <div class="custom-info-item name">${shop.name}</div>
              <div class="custom-info-item address">${shop.address}</div>
              <div class="custom-info-item rating">⭐${
                shop.rating
                  ? `${shop.rating} (${shop.user_ratings_total})`
                  : "評価なし"
              }</div>
              <div class="custom-info-item link_to_detail">
              <a href="/bagel_shops/${shop.id}" >店舗詳細</a>
              </div>
              </div>
            `);
            } else {
              // 画像がない場合
              // infoWindowの内容を更新
              infoWindow.setContent(`
              <div class="custom-info">
              <div class="custom-info-item store_status">${storeStatus}</div>
              <div class="custom-info-item name">${shop.name}</div>
              <div class="custom-info-item address">${shop.address}</div>
              <div class="custom-info-item rating">⭐${
                shop.rating
                  ? `${shop.rating} (${shop.user_ratings_total})`
                  : "評価なし"
              }</div>
              <div class="custom-info-item link_to_detail">
              <a href="/bagel_shops/${shop.id}" >店舗詳細</a>
              </div>
              </div>
            `);
            }

            // infoWindowを指定したマーカーの位置に表示
            infoWindow.open(map, marker);
          });
        } else {
          console.warn(`Invalid coordinates for shop: ${shop.name}`, shop);
        }
      });

      // `bounds` のデバッグ用ログ
      console.log("Bounds object:", bounds);
      console.log(
        "Bounds instanceof LatLngBounds:",
        bounds instanceof google.maps.LatLngBounds
      );

      // 引数に指定した矩形領域を地図に収める
      google.maps.event.addListenerOnce(map, "idle", function () {
        if (!bounds.isEmpty()) {
          map.fitBounds(bounds);

          // ズームレベルの制限
          const minZoomLevel = 17; // ズームレベル17以上にしない
          if (map.getZoom() > minZoomLevel) {
            map.setZoom(minZoomLevel);
          }

        } else {
          console.warn("No valid locations to fitBounds.");
        }
      });

      // 位置情報が取得できたらローディングを非表示
      document.getElementById("loading").style.display = "none";
      document.getElementById("map").classList.remove("loading");
      break;

    case "reset":
      //リセットボタンの場合
      console.log("リセット");

      bagelShops = gon.bagel_shops;

      // Railsから保存された店舗情報を取得して地図上にマーカーを表示
      bagelShops.forEach(function (shop) {
        let markerLatLng = { lat: shop.latitude, lng: shop.longitude }; // 緯度経度のデータ作成
        let operatingHours = "";
        let icon = icons["closed_shop"]; // デフォルトでは「閉店中」のアイコン
        let storeStatus = "準備中または不定期";

        if (shop.opening_hours) {
          // 営業時間情報があれば営業時間をパース
          operatingHours = parseOperatingHours(shop.opening_hours);

          // 営業時間がパースできたら、営業中かどうかを判断
          if (isOpen(operatingHours)) {
            icon = icons["opening_shop"]; // 営業中の場合は「営業中」のアイコン
            storeStatus = "営業中";
          }
        }

        const marker = new google.maps.Marker({
          position: markerLatLng,
          map: map,
          icon: icon,
        });
        markers.push(marker);

        // マーカーがクリックされたときに情報ウィンドウを表示
        marker.addListener("click", function () {
          // photo_referenceをカンマで分割して最初の画像を使用
          if (shop.photo_references) {
            // 画像がある場合
            const photoReferences = shop.photo_references.split(",");
            // const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoReferences[0]}&key=${apiKey}`;
            const photoUrl = `/photos/${photoReferences[0]}`;

            // infoWindowの内容を更新
            infoWindow.setContent(`
            <div class="custom-info">
            <div class="custom-info-item store_status">${storeStatus}</div>
            <div class="custom-info-item photo">
            <img src="${photoUrl}" alt="${
              shop.name
            }" style="width:100%;height:auto;">
              </div>
              <div class="custom-info-item name">${shop.name}</div>
              <div class="custom-info-item address">${shop.address}</div>
              <div class="custom-info-item rating">⭐${
                shop.rating
                  ? `${shop.rating} (${shop.user_ratings_total})`
                  : "評価なし"
              }</div>
                <div class="custom-info-item link_to_detail">
                <a href="/bagel_shops/${shop.id}" >店舗詳細</a>
                </div>
                </div>
                `);
          } else {
            // 画像がない場合
            // infoWindowの内容を更新
            infoWindow.setContent(`
            <div class="custom-info">
            <div class="custom-info-item store_status">${storeStatus}</div>
            <div class="custom-info-item name">${shop.name}</div>
            <div class="custom-info-item address">${shop.address}</div>
            <div class="custom-info-item rating">⭐${
              shop.rating
                ? `${shop.rating} (${shop.user_ratings_total})`
                : "評価なし"
            }</div>
              <div class="custom-info-item link_to_detail">
              <a href="/bagel_shops/${shop.id}" >店舗詳細</a>
              </div>
              </div>
          `);
          }

          // infoWindowを指定したマーカーの位置に表示
          infoWindow.open(map, marker);
        });
      });

      // リセット時の座標、ズームの復元
      map.setCenter(initialCenter);
      map.setZoom(initialZoom);

      // 位置情報が取得できたらローディングを非表示
      document.getElementById("loading").style.display = "none";
      document.getElementById("map").classList.remove("loading");
      break;

    default:
      console.error("予期しない動作です");
  }

  // 地図上のボタンを押すとshowCurrentLocation関数で現在地を取得して表示
  const locationButton = document.createElement("button");
  locationButton.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i>';
  locationButton.classList.add("custom-map-control-button");
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(locationButton);
  locationButton.addEventListener("click", showCurrentLocation);
}

// 既存のマーカーをすべて消去する関数
function clearMarkers() {
  for (let i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = []; // 配列をクリア
  console.log("マーカー初期化")
}

// infoWindowのエラーメッセージを出力する関数
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(
    browserHasGeolocation
      ? "Error: 現在地を取得できませんでした"
      : "Error: お使いのブラウザでは現在地取得がサポートされていません"
  );
  infoWindow.open(map);
}

// 現在地を取得して表示する関数
function showCurrentLocation(){
  // Try HTML5 geolocation.

  // センターピンの表示
  centerPin = new google.maps.Marker({
      map: map,
      draggable: true,
      position: map.getCenter(), // 初期位置をマップの中心に設定
      title: "現在地",
  });

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        map.setCenter(pos);

        // 現在地にマーカーを移動させる
        if (centerPin) {
          centerPin.setPosition(pos);
        }

        // 位置情報が取得できたらローディングを非表示
        document.getElementById("loading").style.display = "none";
        document.getElementById("map").classList.remove("loading");
      },
      () => {
        // エラーハンドリング
        handleLocationError(true, infoWindow, map.getCenter());
        document.getElementById("loading").style.display = "none"; // エラー時も非表示
        document.getElementById("map").classList.remove("loading"); // エラー時も元に戻す
      }
    );
  } else {
    // Geolocation APIがサポートされていない場合
    handleLocationError(false, infoWindow, map.getCenter());
    document.getElementById("loading").style.display = "none"; // 非表示
    document.getElementById("map").classList.remove("loading"); // 非表示
  }
}

// 入力データをパースしてオブジェクトに変換する関数
function parseOperatingHours(operatingHoursString) {
  const operatingHours = {};
  const lines = operatingHoursString.split("\n");

  lines.forEach(line => {
    const [day, hours] = line.split(": ");
    operatingHours[day] = hours;
  });

  return operatingHours;
}

// 現在の曜日と時間から営業中かどうか判断する関数
function isOpen(operatingHours, now = new Date()) {
  const daysOfWeek = ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"];
  const currentDayOfWeek = daysOfWeek[now.getDay()];
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // 当日の営業時間を取得
  const hours = operatingHours[currentDayOfWeek];

  if (hours === "定休日") {
    return false;
  }

  const [openTime, closeTime] = hours.split("～").map(time => time.trim());
  const [openHour, openMinute] = openTime.split("時").map(part => parseInt(part));
  const [closeHour, closeMinute] = closeTime.split("時").map(part => parseInt(part));

  // 現在時刻が営業中かどうかをチェック
  const isOpenNow = (currentHour > openHour || (currentHour === openHour && currentMinute >= openMinute)) &&
                    (currentHour < closeHour || (currentHour === closeHour && currentMinute <= closeMinute));

  return isOpenNow;
}

// 画面表示部分

document.addEventListener("DOMContentLoaded", function () {
  if (typeof google === "undefined" || typeof google.maps === "undefined") {
    console.error("Google Maps API のロードに失敗しました。");
    return;
  }
  // console.log("Google Maps API スクリプトが読み込まれたか確認:", typeof google !== "undefined");
  // console.log("地図の div が存在するか:", document.getElementById("map") !== null);
  // console.log("地図のサイズ:", document.getElementById("map")?.clientWidth, document.getElementById("map")?.clientHeight);
  // console.log("map 変数の状態:", map);
  initMap();
});

window.addEventListener("popstate", function (e) {
  window.location.reload();
  console.log("Reload!");
});

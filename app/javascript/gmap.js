let map, geocoder, centerPin, infoWindow, lastCenter;
let markers = [];
const apiKey = gon.api_key;

const defaultLocation = { lat: 35.68123620000001, lng: 139.7671248 };
const bagelShops = gon.bagel_shops;
const display = document.getElementById("display");

// 地図表示関数の定義部分
function initMap() {
  geocoder = new google.maps.Geocoder();
  const mapElement = document.getElementById("map");
  if (!mapElement) {
    console.error("Map element not found.");
    return;
  }
  
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
  const inputSearchWords = document.getElementById("name_or_address").value;

  if (inputSearchWords) { //検索ワードがある場合
    searchAddress(lastCenter);
  } else { //検索ワードがない場合（現在地取得の場合）
    showCurrentLocation();
    
    // 地図基本設定（現在地取得できなかったとき）
    map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: defaultLocation.lat, lng: defaultLocation.lng }, //東京駅
      zoom: 15,
      streetViewControl: false, // ストリートビューのボタン非表示
      mapTypeControl: false, // 地図、航空写真のボタン非表示
      fullscreenControl: false, // フルスクリーンボタン非表示
    });
    
    // センターピンの表示
    centerPin = new google.maps.Marker({
    map: map,
    draggable: true,
    position: map.getCenter(), // 初期位置をマップの中心に設定
    title: "現在地",
    });
  
    lastCenter = map.getCenter();
    
    // マップのドラッグ終了イベント
    // map.addListener("dragend", function () {
    //   centerPin.setPosition(map.getCenter());
    //   lastCenter = map.getCenter();
    // });
    
    // infoWindowを作成
    infoWindow = new google.maps.InfoWindow({
      pixelOffset: new google.maps.Size(0, -50),
      maxWidth: 300,
    });
    
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
      
      let marker = new google.maps.Marker({
        position: markerLatLng,
        map: map,
        icon: icon,
      });
      
      // マーカーがクリックされたときに情報ウィンドウを表示
      marker.addListener("click", function () {
        // photo_referenceをカンマで分割して最初の画像を使用
        if (shop.photo_references) {
          // 画像がある場合
          const photoReferences = shop.photo_references.split(",");
          const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoReferences[0]}&key=${apiKey}`;
          
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
                shop.rating ? shop.rating : "評価なし"
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
              shop.rating ? shop.rating : "評価なし"
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
    
    // 地図上のボタンを押すとshowCurrentLocation関数で現在地を取得して表示
    const locationButton = document.createElement("button");
    locationButton.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i>';
    locationButton.classList.add("custom-map-control-button");
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(locationButton);
    locationButton.addEventListener("click", showCurrentLocation);
  };
}


// 既存のマーカーをすべて消去する関数
function clearMarkers() {
  for (let i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = []; // 配列をクリア
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

// 地図検索
function searchAddress(centerLatLng) {
  const searchBagelShops = gon.search_bagel_shops;
  // console.log(searchBagelShops);
  let bounds = new google.maps.LatLngBounds(); // 検索結果が1つ以上の場合に地図の範囲を調整するためのBoundsオブジェクトを作成

  // 検索結果がない場合の処理
  if (searchBagelShops.length === 0) {
    display.textContent = "検索結果が見つかりませんでした。";
    map.setCenter(centerLatLng); // 初期位置に戻す
    document.getElementById("loading").style.display = "none";
    document.getElementById("map").classList.remove("loading");
    return; // 関数をここで終了して、地図の位置を変更しない
  }

  searchBagelShops.forEach(function (shop) {
    let markerLatLng = { lat: shop.latitude, lng: shop.longitude }; // 緯度経度のデータ作成

    let marker = new google.maps.Marker({
      position: markerLatLng,
      map: map,
      // icon: icon,
    });

    bounds.extend(markerLatLng);
  });

  map.fitBounds(bounds);

  // 位置情報が取得できたらローディングを非表示
  document.getElementById("loading").style.display = "none";
  document.getElementById("map").classList.remove("loading");

  // display.textContent = "検索結果：" + markerLatLng;
}

// 画面表示部分

window.initMap = initMap;

window.addEventListener("popstate", function (e) {
  window.location.reload();
  console.log("Reload!");
});

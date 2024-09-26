let map, geocoder, centerPin, infoWindow;
let markers = [];
const apiKey = gon.api_key;

const defaultLocation = { lat: 35.68123620000001, lng: 139.7671248 };
const bagelShops = gon.bagel_shops;
const display = document.getElementById("display");

function initMap() {
  geocoder = new google.maps.Geocoder();
  const mapElement = document.getElementById("map");
  if (!mapElement) {
    console.error("Map element not found.");
    return;
  }

  // const icons = {
  //   bagel_shop: {
  //     url: './app/assets/images/bagel_shop_ping.png',
  //     scaledSize: new google.maps.Size(52, 52)
  //   }
  // };

  // 初期位置の設定
  showCurrentLocation();
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

  // マップのドラッグ終了イベント
  map.addListener("dragend", function () {
    centerPin.setPosition(map.getCenter());
  });

  // infoWindowを作成
  infoWindow = new google.maps.InfoWindow({
    pixelOffset: new google.maps.Size(0, -50),
    maxWidth: 300
  });

  // Railsから保存された店舗情報を取得して地図上にマーカーを表示
  bagelShops.forEach(function (shop) {
    let markerLatLng = { lat: shop.latitude, lng: shop.longitude }; // 緯度経度のデータ作成
    let marker = new google.maps.Marker({
      position: markerLatLng,
      map: map,
      icon: {
        url: gon.bagel_shop_icon,
        scaledSize: new google.maps.Size(52, 52),
      },
    });

    // マーカーがクリックされたときに情報ウィンドウを表示
    marker.addListener("click", function () {
      // photo_referenceをカンマで分割して最初の画像を使用
      if (shop.photo_references) { // 画像がある場合
        const photoReferences = shop.photo_references.split(",");
        const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoReferences[0]}&key=${apiKey}`;

        // infoWindowの内容を更新
        infoWindow.setContent(`
        <div class="custom-info">
          <div class="custom-info-item photo">
            <img src="${photoUrl}" alt="${shop.name}" style="width:100%;height:auto;">
          </div>
          <div class="custom-info-item name">${shop.name}</div>
          <div class="custom-info-item address">${shop.address}</div>
          <div class="custom-info-item rating">⭐${shop.rating ? shop.rating : "評価なし"}</div>
          <div class="custom-info-item link_to_detail">
            <a href="/bagel_shops/${shop.id}" >店舗詳細</a>
          </div>
        </div>
        `);
      } else { // 画像がない場合
        // infoWindowの内容を更新
        infoWindow.setContent(`
        <div class="custom-info">
          <div class="custom-info-item name">${shop.name}</div>
          <div class="custom-info-item address">${shop.address}</div>
          <div class="custom-info-item rating">⭐${shop.rating ? shop.rating : "評価なし"
          }</div>
          <div class="custom-info-item link_to_detail">
            <a href="/bagel_shops/${shop.id}" >店舗詳細</a>
          </div>
        </div>
        `);
      };


      // infoWindowを指定したマーカーの位置に表示
      infoWindow.open(map, marker);
    });
  });

  // ボタンを押すとshowCurrentLocation関数で現在地を取得して表示
  const locationButton = document.createElement("button");
  locationButton.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i>';
  locationButton.classList.add("custom-map-control-button");
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(locationButton);
  locationButton.addEventListener("click", showCurrentLocation);
}

  // 地図検索
  window.codeAddress = function () {
    let inputAddress = document.getElementById("address").value;

    geocoder.geocode({ address: inputAddress }, function (results, status) {
      if (status == "OK") {
        // マーカーを作成
        map.setCenter(results[0].geometry.location);

        // マーカーを追加する前に既存のマーカーをクリア
        clearMarkers();

        var marker = new google.maps.Marker({
          map: map,
          position: results[0].geometry.location,
        });
        markers.push(marker); // マーカーを配列に追加

        display.textContent = "検索結果：" + results[0].geometry.location;
      } else {
        alert("該当する結果がありませんでした：" + status);
      }
    });
  };

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
        : "Error: このブラウザはGeolocationをサポートしていません"
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
        },
        () => {
          handleLocationError(true, infoWindow, map.getCenter());
        }
      );
    } else {
      // Browser doesn't support Geolocation
      handleLocationError(false, infoWindow, map.getCenter());
    }
  }

  window.initMap = initMap;

  window.addEventListener("popstate", function (e) {
    window.location.reload();
    console.log("Reload!");
  });

let map, geocoder;

const bagelShop = gon.bagel_shop;
const display = document.getElementById("display");

function initMap() {
  geocoder = new google.maps.Geocoder();
  const mapElement = document.getElementById("map");
  if (!mapElement) {
    console.error("Map element not found.");
    return;
  }

  // 初期位置の設定
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: bagelShop.latitude, lng: bagelShop.longitude }, //店舗の緯度、経度
    zoom: 15,
    mapTypeControl: false, // 地図、航空写真のボタン非表示
  });

  // センターピンの表示
  centerPin = new google.maps.Marker({
    map: map,
    draggable: true,
    position: map.getCenter(), // 初期位置をマップの中心に設定
    title: bagelShop.name,
  });
}

window.initMap = initMap;

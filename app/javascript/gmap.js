let map, geocoder, infoWindow;
let markers = [];

const display = document.getElementById("display");

function initMap() {
  geocoder = new google.maps.Geocoder();

  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 35.68123620000001, lng: 139.7671248 },
    zoom: 15,
  });
  infoWindow = new google.maps.InfoWindow();

  const locationButton = document.createElement("button");

  locationButton.textContent = "Pan to Current Location";
  locationButton.classList.add("custom-map-control-button");
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);
  locationButton.addEventListener("click", () => {
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          infoWindow.setPosition(pos);
          infoWindow.setContent("Location found.");
          infoWindow.open(map);
          map.setCenter(pos);

          // マーカーを追加する前に既存のマーカーをクリア
          clearMarkers();

          // 現在地にマーカーを立てる
          var marker = new google.maps.Marker({
            map: map,
            position: pos,
          });
          markers.push(marker); // マーカーを配列に追加
        },
        () => {
          handleLocationError(true, infoWindow, map.getCenter());
        }
      );
    } else {
      // Browser doesn't support Geolocation
      handleLocationError(false, infoWindow, map.getCenter());
    }
  });

  // 初期位置のマーカーもクリアしてから追加
  clearMarkers();
  const marker = new google.maps.Marker({
    position: { lat: 35.68123620000001, lng: 139.7671248 },
    map: map,
  });
  markers.push(marker);
}

function codeAddress() {
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
}

// 既存のマーカーをすべて消去する関数
function clearMarkers() {
  for (let i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = []; // 配列をクリア
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(
    browserHasGeolocation
      ? "Error: The Geolocation service failed."
      : "Error: Your browser doesn't support geolocation."
  );
  infoWindow.open(map);
}

window.initMap = initMap;

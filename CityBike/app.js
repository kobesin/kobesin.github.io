var youBikeLayer = L.layerGroup(),
  cBikeLayer = L.layerGroup(),
  pBikeLayer = L.layerGroup();

var baseMaps = {
  "OpenStreetMap": L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'),
  "GoogleMap": L.tileLayer('http://mt{s}.google.com/vt/x={x}&y={y}&z={z}', {
    subdomains: '012'
  })
};

var map = L.map('map', {
  worldCopyJump: true,
  layers: [baseMaps.OpenStreetMap, youBikeLayer, cBikeLayer, pBikeLayer]
}).setView([25.0508, 121.5539], 12);

L.control.layers(baseMaps, {
  'Youbuke': youBikeLayer,
  'C-Bike': cBikeLayer,
  'P-Bike': pBikeLayer
}).addTo(map);

//更新youbike資料
var refresh = L.control({
  position: 'topleft'
});
refresh.onAdd = function(map) {
  var controlDiv = L.DomUtil.create('div', 'leaflet-bar');
  L.DomEvent
    .addListener(controlDiv, 'click', L.DomEvent.stopPropagation)
    .addListener(controlDiv, 'click', L.DomEvent.preventDefault)
    .addListener(controlDiv, 'click', function() {
      if (!this.querySelector('i').classList.contains('fa-spin')) {
        getBikeJsons();
      }
    });

  var controlUI = L.DomUtil.create('a', '', controlDiv);
  controlUI.id = 'bikeRefresh';
  controlUI.title = '更新youbike資料';
  controlUI.href = '#';
  controlUI.style.fontSize = '18px';
  controlUI.style.lineHeight = '26px';
  controlUI.style.textAlign = 'center';
  controlUI.innerHTML = '<i class="fa fa-refresh"></i>'

  return controlDiv;
};
refresh.addTo(map);

//legend
var legend = L.control({
  position: 'bottomright'
});
legend.onAdd = function(map) {
  var div = L.DomUtil.create('div', 'legend'),
    grades = [0, 3, 6, 9, 12],
    labels = ['0~2', '3~5', '6~8', '9~11', '12 以上'];
  // loop through our density intervals and generate a label with a colored square for each interval
  div.innerHTML += '<div style="color:hotpink;">目前車輛</div>';
  for (var i = 0; i < grades.length; i++) {
    div.innerHTML +=
      '<i class="fa fa-bicycle" style="color:' + bikeColor(grades[i]) + '"></i> ' +
    //grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    labels[i] + (grades[i + 1] ? '<br>' : '');
  }
  return div;
};
legend.addTo(map);

//geolocation
var geolocation = L.control({
  position: 'topleft'
});
geolocation.onAdd = function(map) {
  var controlDiv = L.DomUtil.create('div', 'leaflet-bar');
  L.DomEvent
    .addListener(controlDiv, 'click', L.DomEvent.stopPropagation)
    .addListener(controlDiv, 'click', L.DomEvent.preventDefault)
    .addListener(controlDiv, 'click', function() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
          map.setView([position.coords.latitude, position.coords.longitude], 12);
        });
      } else {
        alert("Geolocation is not supported by this browser.");
      }
    });

  var controlUI = L.DomUtil.create('a', '', controlDiv);
  controlUI.title = '目前所在位置';
  controlUI.href = '#';
  controlUI.style.fontSize = '18px';
  controlUI.style.lineHeight = '26px';
  controlUI.style.textAlign = 'center';
  controlUI.innerHTML = '<i class="fa fa-location-arrow"></i>'

  return controlDiv;
};
geolocation.addTo(map);

getBikeJsons();

function getBikeJsons() {
  $('#bikeRefresh i').addClass('fa-spin');

  youBikeLayer.clearLayers();
  var youbike = $.ajax({
    url: 'http://lamperder.2fh.co/json/YouBike.php',
    async: true,
    dataType: "json"
  }).done(function(json) {
    if (json.datas) {
      var datas = json.datas;

      for (var d in datas) {
        var data = datas[d];
        var md = data.mday,
          mdDate = new Date(md.slice(0, 4), md.slice(4, 6), md.slice(6, 8), md.slice(8, 10), md.slice(10, 12), md.slice(12, 14), 0);

        var layer = L.marker([data.lat, data.lng], {
          icon: L.divIcon({
            // className: 'icon-youbike fa fa-bicycle',
            // iconSize: [26, 20],
            // iconAnchor: [13, 10]
            className: '',
            iconSize: [26, 20],
            iconAnchor: [13, 10],
            html: '<i class="icon-youbike fa fa-bicycle" style="color: ' + bikeColor(Number(data.sbi)) + ';"></i>'
          })
        }).addTo(youBikeLayer);

        var popupContent = [];
        popupContent.push('資料更新時間：' + mdDate.toLocaleString())
        popupContent.push('場站代號：' + data.sno);
        popupContent.push('場站名稱：' + data.sna);
        popupContent.push('場站區域：' + data.sarea);
        popupContent.push('地址：' + data.ar);
        popupContent.push('車輛狀況(目前車輛/總停車格)：' + data.sbi + '/' + data.tot);
        popupContent.push('空位數量：' + data.bemp);
        layer.bindPopup(popupContent.join('<br>'));
      }
    }
  }).error(function() {
    alert("目前無法取得Youbike資料，請稍候再試一次");
  });

  cBikeLayer.clearLayers();
  var cbike = $.ajax({
    url: 'http://lamperder.2fh.co/json/C-Bike.php',
    async: true,
    dataType: "json"
  }).done(function(json) {
    if (json.datas && json.datas.BIKEStation.Station.length > 0) {
      var datas = json.datas.BIKEStation.Station;

      datas.forEach(function(data) {
        var layer = L.marker([data.StationLat, data.StationLon], {
          icon: L.divIcon({
            className: '',
            iconSize: [26, 20],
            iconAnchor: [13, 10],
            html: '<i class="icon-youbike fa fa-bicycle" style="color: ' + bikeColor(Number(data.StationNums1)) + ';"></i>'
          })
        }).addTo(cBikeLayer);

        var popupContent = [];
        popupContent.push('租賃站名稱：' + data.StationName)
        popupContent.push('場站描述：' + data.StationDesc);
        popupContent.push('地址：' + data.StationAddress);
        popupContent.push('車輛狀況(目前車輛)：' + data.StationNums1);
        popupContent.push('空位數量：' + data.StationNums2);
        popupContent.push('<img src="' + data.StationPic + '" width="120" height="80">');
        layer.bindPopup(popupContent.join('<br>'));
      });
    }
  }).error(function() {
    alert("目前無法取得c-bike資料，請稍候再試一次");
  });

  pBikeLayer.clearLayers();
  var pbike = $.ajax({
    url: 'http://lamperder.2fh.co/json/P-Bike.php',
    async: true,
    dataType: "json"
  }).done(function(json) {
    if (json.datas) {
      var datas = json.datas.content.split('*'),
        coordinates = json.datas.coordinate.split('*');

      datas.forEach(function(data, index) {
        var latlng = coordinates[index].split(','),
          content = data.split('#');
        var layer = L.marker([latlng[0], latlng[1]], {
          icon: L.divIcon({
            className: '',
            iconSize: [26, 20],
            iconAnchor: [13, 10],
            html: '<i class="icon-youbike fa fa-bicycle" style="color: ' + bikeColor(Number(content[3])) + ';"></i>'
          })
        }).addTo(cBikeLayer);

        var popupContent = [];
        popupContent.push('租賃站名稱：' + content[0])
        popupContent.push('地址：' + content[1]);
        popupContent.push('車輛狀況(目前車輛)：' + content[3]);
        popupContent.push('空位數量：' + content[2]);
        layer.bindPopup(popupContent.join('<br>'));
      });
    }
  }).error(function() {
    alert("目前無法取得p-bike資料，請稍候再試一次");
  });

  $.when(youbike, cbike, pbike).done(function() {
    $('#bikeRefresh i').removeClass('fa-spin');
  });
}

function bikeColor(count) {
  var unit = Math.floor(count / 3);
  switch (unit) {
    case 0:
      color = '#999999';
      break;
    case 1:
      color = '#eb6864';
      break;
    case 2:
      color = '#336699';
      break;
    case 3:
      color = '#f5e625';
      break;
    default:
      color = '#22b24c';
      break;
  }
  return color;
}
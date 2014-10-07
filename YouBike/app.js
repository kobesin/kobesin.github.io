var bikeLayer = L.layerGroup();
var baseMaps = {
  "OpenStreetMap": L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'),
  "GoogleMap": L.tileLayer('http://mt{s}.google.com/vt/x={x}&y={y}&z={z}', {
    subdomains: '012'
  })
};

var map = L.map('map', {
  worldCopyJump: true,
  layers: [baseMaps.OpenStreetMap, bikeLayer]
}).setView([25.0508, 121.5539], 12);

L.control.layers(baseMaps, {
  'Youbuke': bikeLayer
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
      if (!this.querySelector('a').classList.contains('fa-spin')) {
        queryYouBike();
      }
    });

  var controlUI = L.DomUtil.create('a', 'fa fa-refresh', controlDiv);
  controlUI.id = 'bikeRefresh';
  controlUI.title = '更新youbike資料';
  controlUI.href = '#';
  controlUI.style.fontSize = '18px';
  controlUI.style.lineHeight = '26px';
  controlUI.style.textAlign = 'center';
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

queryYouBike();

function queryYouBike() {
  bikeLayer.clearLayers();
  $('#bikeRefresh').addClass('fa-spin');

  $.ajax({
    url: 'https://jsonp.nodejitsu.com/?url=http%3A%2F%2Fopendata.dot.taipei.gov.tw%2Fopendata%2Fgwjs_cityhall.json',
    async: true,
    dataType: "json"
  }).done(function(json) {
    if (json.retVal) {
      var datas = json.retVal;
      datas.forEach(function(data) {
        var sd = data.sd,
          md = data.mday;
        var sdDate = new Date(sd.slice(0, 4), sd.slice(4, 6), sd.slice(6, 8), sd.slice(8, 10), sd.slice(10, 12), sd.slice(12, 14), 0),
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
        }).addTo(bikeLayer);

        var popupContent = [];
        popupContent.push('啟用時間：' + sdDate.toLocaleString());
        popupContent.push('場站代號：' + data.sno);
        popupContent.push('場站名稱：' + data.sna);
        popupContent.push('場站區域：' + data.sarea);
        popupContent.push('地址：' + data.ar);
        popupContent.push('車輛狀況(目前車輛/總停車格)：' + data.sbi + '/' + data.tot);
        popupContent.push('檔板數量：' + data.nbcnt);
        popupContent.push('空位數量：' + data.bemp);

        var act = (data.act == "0") ? "禁用" : "正常";
        popupContent.push('禁用狀態：' + act);
        layer.bindPopup(popupContent.join('<br>'));
      });
    }

    $('#bikeRefresh').removeClass('fa-spin');
  }).error(function() {
    $('#bikeRefresh').removeClass('fa-spin');
    alert("資料目前無法取得，請稍候再試一次");
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
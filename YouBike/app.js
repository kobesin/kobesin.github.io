var bikeLayer = L.layerGroup();
var baseMaps = {
    "OpenStreetMap": L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'),
    "GoogleMap": L.tileLayer('http://mt{s}.google.com/vt/x={x}&y={y}&z={z}', { subdomains: '012' })
};

var map = L.map('map', {
  worldCopyJump: true,
  layers: [baseMaps.OpenStreetMap, bikeLayer]
}).setView([25.0508, 121.5539], 12);

L.control.layers(baseMaps, {'Youbuke': bikeLayer}).addTo(map);

//更新youbike資料
L.Control.Bike = L.Control.extend({
  options: {
    position: 'topleft',
  },

  onAdd: function(map) {
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
  }
});
L.control.bike = function(options) {
  return new L.Control.Bike(options);
};
map.addControl(L.control.bike());

queryYouBike();

// function temp(data) {
//   L.geoJson(data, {
//     pointToLayer: function(feature, latlng) {
//       return L.circleMarker(latlng, {
//         radius: 3,
//         fillColor: "#ff7800",
//         color: "#000",
//         weight: 1,
//         opacity: 1,
//         fillOpacity: 0.8
//       });
//     },
//     onEachFeature: function(feature, layer) {
//       var popupContent = [];
//       for (var name in feature.properties) {
//         var tempString = name + '：' + feature.properties[name];
//         popupContent.push(tempString);
//       }
//       layer.bindPopup(popupContent.join('<br>'));
//     }
//   }).addTo(map);
// }

// $.ajax({
//     url: 'http://comcat.cr.usgs.gov/fdsnws/event/1/query?format=geojson&callback=temp',
//     jsonp : false,
//     cache: 'true',
//     dataType : 'jsonp'
// });


function queryYouBike() {
  bikeLayer.clearLayers();
  $('#bikeRefresh').addClass('fa-spin');

  $.ajax({
    url: 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20json%20where%20url%3D%22http%3A%2F%2Fopendata.dot.taipei.gov.tw%2Fopendata%2Fgwjs_cityhall.json%22&format=json',
    async: true,
    dataType: "json"
  }).done(function(json) {
    var datas = json.query.results.json.retVal;
    datas.forEach(function(data) {
      var sd = data.sd,
        md = data.mday;
      var sdDate = new Date(sd.slice(0, 4), sd.slice(4, 6), sd.slice(6, 8), sd.slice(8, 10), sd.slice(10, 12), sd.slice(12, 14), 0),
        mdDate = new Date(md.slice(0, 4), md.slice(4, 6), md.slice(6, 8), md.slice(8, 10), md.slice(10, 12), md.slice(12, 14), 0);

      var layer = L.marker([data.lat, data.lng], {
        icon: L.divIcon({
          className: 'icon-youbike fa fa-bicycle',
          iconSize: [26, 20],
          iconAnchor: [13, 10]
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

    $('#bikeRefresh').removeClass('fa-spin');
  });
}
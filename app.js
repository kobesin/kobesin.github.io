var map = L.map('map', {
  worldCopyJump: true
}).setView([23.8, 121], 8);

L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
}).addTo(map);


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

$.ajax({
  url: 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20json%20where%20url%3D%22http%3A%2F%2Fopendata.dot.taipei.gov.tw%2Fopendata%2Fgwjs_cityhall.json%22&format=json',
  async: true,
  dataType: "json"
}).done(function(json) {
  var datas = json.query.results.json.retVal;
  var bikeLayer = L.layerGroup();
  datas.forEach(function(data) {
    L.marker([data.lat, data.lng]).bindPopup('查詢時間：' + data.mday).addTo(bikeLayer);
  });
  bikeLayer.addTo(map);
});
var FLayer, FFLayer, CVSLayer;

var baseMaps = {
  "OpenStreetMap": L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'),
  "GoogleMap": L.tileLayer('http://mt{s}.google.com/vt/x={x}&y={y}&z={z}', {
    subdomains: '012'
  })
};

var map = L.map('map', {
  worldCopyJump: true,
  layers: [baseMaps.OpenStreetMap]
}).setView([25.0508, 121.5539], 12);

L.control.layers(baseMaps).addTo(map);

queryGeojson();

function queryGeojson() {
  var clusterGroup = new L.MarkerClusterGroup({
    disableClusteringAtZoom: 16
  }).addTo(map);

  $.ajax({
    url: 'data/CVS.geojson',
    async: true,
    dataType: "json"
  }).done(function(json) {
    L.geoJson(json, {
      onEachFeature: popupF,
      pointToLayer: function(feature, latlng) {
        var icon = 'image/7-11.jpg',
          size = [30, 28],
          anchor = [15, 14];
        if (feature.properties.mark_name.indexOf("全家便利商店") !== -1) {
          icon = 'image/FamilyMart.jpg';
          size = [30, 30];
          anchor = [15, 15];
        } else if (feature.properties.mark_name.indexOf("OK便利商店") !== -1) {
          icon = 'image/OK.jpg';
          size = [30, 36];
          anchor = [15, 18];
        } else if (feature.properties.mark_name.indexOf("萊爾富便利商店") !== -1) {
          icon = 'image/HiLife.jpg';
          size = [30, 33];
          anchor = [15, 16.5];
        }
        return L.marker(latlng, {
          icon: L.icon({
            iconUrl: icon,
            iconSize: [size[0] / 2, size[1] / 2],
            iconAnchor: [anchor[0] / 2, anchor[1] / 2]
          })
        });
      }
    }).addTo(clusterGroup);
  });

  $.ajax({
    url: 'data/FastFood.geojson',
    async: true,
    dataType: "json"
  }).done(function(json) {
    L.geoJson(json, {
      onEachFeature: popupF,
      pointToLayer: function(feature, latlng) {
        return L.marker(latlng, {
          icon: L.divIcon({
            className: 'fa fa-shopping-cart icon-fastfood',
            iconSize: [26, 20],
            iconAnchor: [13, 10]
          })
        });
      }
    }).addTo(clusterGroup);
  });

  $.ajax({
    url: 'data/Food.geojson',
    async: true,
    dataType: "json"
  }).done(function(json) {
    L.geoJson(json, {
      onEachFeature: popupF,
      pointToLayer: function(feature, latlng) {
        return L.marker(latlng, {
          icon: L.divIcon({
            className: 'fa fa-shopping-cart icon-food',
            iconSize: [26, 20],
            iconAnchor: [13, 10]
          })
        });
      }
    }).addTo(clusterGroup);
  });
}

function popupF(feature, layer) {
  var popupContent = "名稱：" + feature.properties.mark_name + "<br>" + "地址：" + feature.properties.mark_addr + "<br>" + "行政區：" + feature.properties.mark_addr_sect;
  layer.bindPopup(popupContent);
}
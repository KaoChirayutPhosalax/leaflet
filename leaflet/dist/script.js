var geojson_data;
$.ajax({
  url: "https://raw.githubusercontent.com/KaoChirayutPhosalax/leaflet/main/districttrat.json",
  method: "GET",
  async: false,
  success : function(data){
    geojson_data = JSON.parse(data);
  }
});

var map = L.map('mapid').setView([12, 102.5], 9.2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// control that shows state info on hover
var info = L.control();

info.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'info');
  this.update();
  return this._div;
};

info.update = function (props) {
  this._div.innerHTML = '<h4>Thai Population Density</h4>' +  
    (props ? '<b>' + props.name + '</b><br />' + props.p + ' people / km<sup>2</sup>' : 'Hover over a state');
};

info.addTo(map);

function getColor(d) {
  return  d > 1000 ? '#800026' :
  d > 500  ? '#BD0026' :
  d > 200  ? '#E31A1C' :
  d > 100  ? '#FC4E2A' :
  d > 50   ? '#FD8D3C' :
  d > 20   ? '#FEB24C' :
  d > 10   ? '#FED976' :
  '#FFEDA0';
}

function style(feature) {
  return {
    fillColor: getColor(feature.properties.p),
    weight: 1,
    opacity: 1,
    color: 'white',
    dashArray: '3',
    fillOpacity: 0.7
  };
}

function highlightFeature(e) {
  var layer = e.target;
  layer.setStyle({
    weight: 5,
    color: '#666',
    dashArray: '',
    fillOpacity: 0.7
  });
  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  }
  info.update(layer.feature.properties);
}

var geojson;

function resetHighlight(e) {
  geojson.resetStyle(e.target);
  info.update();
}

function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: zoomToFeature
  });
}

geojson = L.geoJson(geojson_data, {
  style: style,
  onEachFeature: onEachFeature
}).addTo(map);

var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {
  var div = L.DomUtil.create('div', 'info legend'),
      grades = [0, 10, 20, 50, 100, 200, 500, 1000],
      labels = [],
      from, to;
  for (var i = 0; i < grades.length; i++) {
    from = grades[i];
    to = grades[i + 1];
    labels.push(
      '<i style="background:' + getColor(from + 1) + '"></i> ' +
      from + (to ? '&ndash;' + to : '+'));
  }
  div.innerHTML = labels.join('<br>');
  return div;
};

legend.addTo(map);
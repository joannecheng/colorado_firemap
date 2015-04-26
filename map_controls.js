var buildPopup = function(d) {
  var popupString = "";
  popupString += "<p>Name: " + d.properties.LABELNAME + "</p>";
  popupString += "<p>Dates: " + d.properties.STARTDATE + " - " + d.properties.ENDDATE + "</p>";
  popupString += "<p>Area: " + d3.format(",")(d3.round(d.properties.Shape_area/43560)) + " acres</p>";
  return popupString;
}

var createFireMap = function (json) {
  var map = L.map('map').setView([40.008, -105.48], 11);
  L.tileLayer('http://{s}.tile.cloudmade.com/1fb56e08f6b7427dbe17e89f4d215452/22677/256/{z}/{x}/{y}.png')
    .addTo(map);
  var layers = []
  var onEachFeature = function(feature, layer) {
    layers.push([feature, layer]);
  }
  var fireStyle = {
    color: '#DB4C14',
    weight: '1',
    opacity: 0.5
  }
  var fireLayer = L.geoJson(json, {
    style: fireStyle,
    onEachFeature: onEachFeature
  });
  fireLayer.addTo(map);

  function addClassToLayer(layer, feature) {
    if (layer._container) {
      $(layer._container).find('path').addClass('fire-year-' + getYear(feature))
        .data('label', feature.properties.LABELNAME);
    }
  }

  _.each(layers, function(data) {
    var layer = data[1];
    layer.bindPopup(buildPopup(data[0]));
    if (layer._layers) {
      _.each(layer._layers, function(layer) { addClassToLayer(layer, data[0]) } )
    } 
    else {
      addClassToLayer(layer, data[0]);
    }
  });
  return fireLayer;
}

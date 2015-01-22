var capitalize = function(str) {
  return str.charAt(0).toUpperCase() + str.slice(1, str.length).toLowerCase();
}

var getYear = function(d){
  var date = d.properties.STARTDATE === null ? d.properties.ENDDATE : d.properties.STARTDATE;
  return date.substr(0,4);
}

var buildPopup = function(d) {
  var popupString = "";
  popupString += "<p>Name: " + d.properties.LABELNAME + "</p>";
  popupString += "<p>Dates: " + d.properties.STARTDATE + " - " + d.properties.ENDDATE + "</p>";
  popupString += "<p>Area: " + d3.format(",")(d3.round(d.properties.Shape_area/43560)) + " acres</p>";
  return popupString;
}

var createGraph = function(json, fireLayer) {
  function highlightFire(event) {
    fireLayer.eachLayer(function(l) { fireLayer.resetStyle(l)});
    d3.selectAll('.fire-year-' + event[0])
      .attr('stroke-width', 8);
    populateFireList(event);
  }
  var years = {}
  for (var i in json.features){
    var feature = json.features[i];
    var year = getYear(feature);
    if (years[year] === undefined) {
      years[year] = 0
    }

    years[year] += feature.properties.Shape_area;
  }
  var w = 500;
  var h = 120;
  var barPadding = 2;
  var areaBurned = _.map(_.pairs(years), function(d) { return d[1] })
  var y = d3.scale.linear().domain([0, d3.max(areaBurned)]).range([0, 110]);

  var svg = d3.select("#bar_graph")
  .append("svg")
  .attr("width", w)
  .attr("height", h + 25);

  svg.selectAll(".invisible-bars")
    .data(_.pairs(years))
    .enter()
    .append("rect")
    .attr("x", function(d, i) { return 5 + i*(w/_.pairs(years).length); })
    .attr("y", function(d) { return y(d[1]) } )
    .attr("width", 20 - barPadding)
    .attr("height", function(d) { return h-y(d[1]) })
    .attr('class', 'invisible-bars')
    .on('click', highlightFire);

  svg.selectAll(".bars")
    .data(_.pairs(years))
    .enter()
    .append("rect")
    .attr("x", function(d, i) { return 5 + i*(w/_.pairs(years).length); })
    .attr("y", function(d) { return h - y(d[1]) } )
    .attr("width", 20 - barPadding)
    .attr("height", function(d) { return y(d[1]) })
    .attr('class', 'bars')
    .on('click', highlightFire);

  svg.selectAll("text")
    .data(_.pairs(years))
    .enter()
    .append("text")
    .text(function(d) { return d[0] } )
    .attr('stroke', 'black')
    .attr('x', function(d, i ) { return i*(w/areaBurned.length);})
    .attr('y', h + 20);
}

var populateFireList = function(event) {
  var firesDuringYear = _.map($('.fire-year-'+event[0]), function(fire) {
    return $(fire).data('label');
  });
  $('#fire_list').html('')
  d3.select('#fire_list')
    .selectAll('div')
    .data(_.uniq(firesDuringYear))
    .enter()
    .append('div')
    .text(function(d) { return d; })
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


d3.json('boulder_wildfires.geojson', function(error, json) {
  var fireLayer = createFireMap(json);
  createGraph(json, fireLayer);
});

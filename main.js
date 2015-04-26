var capitalize = function(str) {
  return str.charAt(0).toUpperCase() + str.slice(1, str.length).toLowerCase();
}

var getYear = function(d){
  var date = d.properties.STARTDATE === null ? d.properties.ENDDATE : d.properties.STARTDATE;
  return date.substr(0,4);
}

var createGraph = function(json, fireLayer) {
  var highlightFire = function(event) {
    fireLayer.eachLayer(function(l) { fireLayer.resetStyle(l)});
    d3.selectAll(".fire-year-" + event[0])
      .attr("stroke-width", 8);
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
  var svg = d3.select("#bar_graph svg")
  var w = parseInt(svg.style("width"));
  var maxBarHeight = parseInt(svg.style("height"))*3/4;
  var barPadding = 2;
  var areaBurned = _.map(_.pairs(years), function(d) { return d[1] })
  var y = d3.scale.linear().domain([0, d3.max(areaBurned)]).range([0, maxBarHeight]);

  svg.selectAll(".invisible-bars")
    .data(_.pairs(years))
    .enter()
    .append("rect")
    .attr("x", function(d, i) { return 5 + i*(w/_.pairs(years).length); })
    .attr("y", function(d) { return y(d[1]) } )
    .attr("width", 20 - barPadding)
    .attr("height", function(d) { return maxBarHeight-y(d[1]) })
    .attr("class", "invisible-bars")
    .on("click", highlightFire);

  svg.selectAll(".bars")
    .data(_.pairs(years))
    .enter()
    .append("rect")
    .attr("x", function(d, i) { return 5 + i*(w/_.pairs(years).length); })
    .attr("y", function(d) { return maxBarHeight - y(d[1]) } )
    .attr("width", 20 - barPadding)
    .attr("height", function(d) { return y(d[1]) })
    .attr("class", "bars")
    .on("click", highlightFire);

  svg.selectAll("text")
    .data(_.pairs(years))
    .enter()
    .append("text")
    .text(function(d) { return d[0] } )
    .attr("stroke", "black")
    .attr("x", function(d, i ) { return i*(w/areaBurned.length);})
    .attr("y", maxBarHeight)
    .attr("transform", "translate(0,"+20+")");
}

var populateFireList = function(event) {
  var firesDuringYear = _.map($(".fire-year-"+event[0]), function(fire) {
    return $(fire).data("label");
  });
  $("#fire_list").html("")
  d3.select("#fire_list")
    .selectAll("div")
    .data(_.uniq(firesDuringYear))
    .enter()
    .append("div")
    .text(function(d) { return d; })
}

d3.json("boulder_wildfires.geojson", function(error, json) {
  var fireLayer = createFireMap(json);
  createGraph(json, fireLayer);
});

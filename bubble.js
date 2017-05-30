function splitter(phrase, width){
  let words = phrase.split(" ");
  let lines = [];
  while(words.length>0){
    let thisLine = "";
    while((thisLine.length < width)&&(words.length>0)){
      thisLine += words.shift()+" ";
    }
    lines.push(thisLine);
  }
  return lines;
}

function drawBubbles(all_data){
  var svg = d3.select("svg.bubbles"),
      width = 500,//+svg.attr("width"),
      height = 450;//+svg.attr("height");

  var format = d3.format(",d");

  var dark = "#3C3C3B",
      light= "#B2B2B2"

    var color = d3.scaleOrdinal()
                  .domain(["+", "-"])
                  .range([light, dark]);//d3.schemeCategory20c);

  var pack = d3.pack()
      .size([width, height])
      .padding(10);

  var pt = all_data.positiveThemes,
      nt = all_data.negativeThemes,
      ns = all_data.nveSizes,
      ps = all_data.pveSizes
      fauxCSV = [];
  console.log(fauxCSV);
  for (var i = 0; i < pt.length; i++) {
    let a = {"id": "pve." + pt[i], "value": ps[i]};
    fauxCSV.push(a);
  }
  for (var i = 0; i < nt.length; i++) {
    let a = {"id": "nve." + nt[i], "value": ns[i]};
    fauxCSV.push(a);
  }


    console.log("fauxCSV", fauxCSV);

    var root = d3.hierarchy({children: fauxCSV})
        .sum(function(d) { return d.value; })
        .each(function(d) {
          if (id = d.data.id) {
            var id, i = id.lastIndexOf(".");
            d.id = id;
            d.package = id.slice(0, i);
            d.class = id.slice(i + 1);
          }
        });

    var node = svg.selectAll(".node")
      .data(pack(root).leaves())
      .enter().append("g")
      .attr("class", function(d){return "node feeling-" + d.package;})
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

    node.append("circle")
        .attr("id", function(d) { return d.id; })
        .attr("r", function(d) { return d.r; })
        .style("fill", function(d) { return color(d.package); });

    node.append("clipPath")
        .attr("id", function(d) { return "clip-" + d.id; })
        .append("use")
        .attr("xlink:href", function(d) { return "#" + d.id; });

    node.append("text")
        .attr("clip-path", function(d) { return "url(#clip-" + d.id + ")"; })
        .selectAll("tspan")
        .data(function(d) { return splitter(d.class, 10)})//d.class.split(/(?=[A-Z][^A-Z])/g); })
        .enter().append("tspan")
        .attr("x", 0)
        .attr("y", function(d, i, nodes) { return 15 + (i - nodes.length / 2 - 0.5) * 15; })
        .attr("font-size", 20)
        .text(function(d) { return d; });

    node.append("text")
        .attr("clip-path", function(d) { return "url(#clip-" + d.id + ")"; })
        .selectAll("tspan")
        .data(function(d) { return d.package == "pve" ? "+":"-"; })
        .enter().append("tspan")
        .attr("x", 0)
        .attr("y", -20)
        .attr("font-size", 30)
        .attr("class", "sign")
        .text(function(d) { return d; });

    node.append("title")
    .text(function(d) { return d.id.split(".")[1]; });
}

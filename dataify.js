var publicSpreadsheetUrl = 'https://docs.google.com/spreadsheets/d/1wn9PYCTueDry3xuJC_XqFyYD3IvyNqKNwYvs3F01Puw/pub?gid=0&single=true&output=csv';

function init() {
  Tabletop.init( { key: publicSpreadsheetUrl,
                   callback: showInfo,
                   simpleSheet: true } )
}

function showInfo(data, tabletop) {
  // alert('Successfully processed!')
  let d = processData(data);
  console.log(d);


  addSVGs()
  setTxtFields(d);
  drawchart(d.affect);

  setPictograms(d);

  drawBubbles(d);

}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function setPictograms(data) {
  await sleep(1000);
  let bodsProportion = Math.round((data.responseCount/ data.totalStudioCount)*10);
  let bods = document.querySelectorAll(".responses>span use");
  console.log("bodsProportion", bodsProportion, bods);
  for (var i = 0; i < bodsProportion; i++) {
    bods[i].setAttribute("class", "active");
  }

  let barsProportion = Math.round((data.pcWhy)/10);
  let bars = document.querySelectorAll(".shared-why>span use");
  console.log("barsProportion", barsProportion, bars);
  for (var i = 0; i < barsProportion; i++) {
    bars[i].setAttribute("class", "active");
  }
}

function addSVGs() {
  return new Promise(function (resolve, reject) {
    addSVG("happyFaces.svg", document.getElementById("faces"));
    addSVG("1happy.svg",     document.getElementById("1happy"));
    addSVG("2happy.svg",     document.getElementById("2happy"));
    addSVG("4happy.svg",     document.getElementById("4happy"));
    // addSVG("5happy.svg",     document.getElementById("5happy"));
    resolve();
  });
}

function processData(data) {
  let d = [];
  let allData = {};
  for (var i = 0; i < data.length; i++) {
    let row = data[i];
    let k = row.k;
    let v = [];
    for (let key in row) {
      if (row.hasOwnProperty(key)) {
        if(key[0]==="v"){
          if(row[key] != "") {
            v.push(row[key]);
          }
        }
      }
    }
    allData[k] = v;
  }
  return allData;
}

window.addEventListener('DOMContentLoaded', init)

function setTxtFields(data) {
  document.getElementById("responseCount" ).innerHTML = data.responseCount;
  document.getElementById("sharedWhy"     ).innerHTML = data.pcWhy;
  document.getElementById("follow-up-num" ).innerHTML = data.followUpCompleted;
  document.getElementById("follow-up-held").innerHTML = data.followUpRequested;
}



function drawchart(data) {
  //https://bost.ocks.org/mike/bar/2/
  data = data.map(x => parseInt(x, 10));
  console.log(data);

  var margin = {top: 20, right: 0, bottom: 100, left: 0},
      width =  500 - margin.left - margin.right,
      height = 550 - margin.top  - margin.bottom;

  var colLabel = ["1", "2", "3", "4", "5"];
  // var x = d3.scale.ordinal()
  //     .rangeRoundBands([0, width], .1)
  //     .domain(colLabel);
  var x = d3.scaleBand()
      .rangeRound([0, width], .1)
      .paddingInner(0.1)
      .paddingOuter(0.1)
      .domain(colLabel);

  var xContinuous = d3.scaleLinear()
      .range([0, width])
      .domain([1, 5]);

  var y = d3.scaleLinear()
      .range([height, 0])
      .domain([0, d3.max(data)]);

// window.x = x
// window.y = y
// window.xContinuous = xContinuous
// window.w = width
// window.h = height

  var xAxis = d3.axisBottom()
      .scale(x);

  var yAxis = d3.axisLeft()
      .scale(y);

  var chart = d3.select(".chart")
      // .attr("width", width + margin.left + margin.right)
      // .attr("height", height + margin.top + margin.bottom)
      .attr( 'preserveAspectRatio',"xMinYMin meet")
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .attr('width', '100%')
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  chart.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  let chart_colours = [ "#d4d4d4",
                        "#B2B2B2",
                        "#878787",
                        "#3C3C3B",
                        "#1D1D1B"]
  let zdata = [];
  for (var i = 0; i < data.length; i++) {
    zdata.push({"value":data[i], "name":colLabel[i], "colour":chart_colours[i]})
  }
  console.log(zdata);

  chart.selectAll(".bg-bar")
      .data(zdata)
      .enter().append("rect")
      .attr("class", "bg-bar")
      .attr("x", function(d) { return x(d.name); })
      .attr("y", function(d) { return y(d3.max(data)); })
      .attr("height", function(d) { return height - y(d3.max(data)); })
      .attr("width", x.bandwidth());

  chart.selectAll(".bar")
      .data(zdata)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.name); })
      .attr("y", function(d) { return y(d.value); })
      .attr("height", function(d) { return height - y(d.value); })
      .attr("width", x.bandwidth())
      .attr("fill", function(d) { return d.colour; });

  chart.selectAll(".barValueText")
       .data(zdata)
       .enter()
       .append("text")
       .attr("x", function(d) { return x(d.name) + (x.bandwidth()/2); })
       .attr("y", function(d) { return y(d.value) - 3 ; }) //-3 is padding
       .attr("text-anchor", "middle")
       .attr("font-family", "sans-serif")
       .attr("font-size", "20px")
       .attr("fill", "black")
       .text(function(d){ return d.value;})

  let lineX = calcMean(data);
  chart.append("line")
       .attr("x1", xContinuous(lineX))
       .attr("y1", y(-1))
       .attr("x2", xContinuous(lineX))
       .attr("y2", y(d3.max(data)+1))
       .attr("stroke-width", 3)
       .attr("stroke", "#D9C823")
       .attr("stroke-linecap", "round");

   chart.append("line")
        .attr("x1", xContinuous(1) + (x.bandwidth()/2))
        .attr("y1", y(-1))
        .attr("x2", xContinuous(lineX))
        .attr("y2", y(-1))
        .attr("stroke-width", 3)
        .attr("stroke", "#D9C823")
        .attr("stroke-linecap", "round");

  chart.append("text")
       .attr("x", xContinuous(2.5)) //this text positioning is a total mystery!
       .attr("y", y(-1))
       .attr("text-anchor", "left")
       .attr("font-family", "sans-serif")
       .attr("font-size", "20px")
       .attr("fill", "black")
       .text(`${lineX.toFixed(2)}/5 Average Feeling About Work`)
}

function addSVG(path, parent){
  var xhr = new XMLHttpRequest;
  xhr.open('get', path, true);
  xhr.onreadystatechange = function(){
    if (xhr.readyState != 4) return;
    var svg = xhr.responseXML.documentElement;
    svg = document.importNode(svg, true); // surprisingly optional in these browsers
    parent.appendChild(svg);
  };
  xhr.send();
}

function calcMean(voteData) {
  var runningTotal=0;
  var numVotes = voteData.reduce((a, b) => a + b, 0);
  for (var i = 0; i < voteData.length; i++) {
    runningTotal += voteData[i]*(i+1);
  }
  let result = runningTotal/numVotes;
  console.log(result);
  return result;
}

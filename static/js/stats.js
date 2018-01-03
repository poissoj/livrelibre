/* global d3 */

var dataHours = JSON.parse(document.getElementById("hourChart").getAttribute("data-hours"))
var dataDays = JSON.parse(document.getElementById("dayChart").getAttribute("data-days"))

var DAYS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]

var formatCount = d3.format(",.0f")

var margin = {top: 10, right: 30, bottom: 30, left: 30},
    width = 960 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom

var x = d3.scaleLinear()
    .domain([8,21])
    .range([0, width])

var x2 = d3.scaleBand()
    .domain(DAYS)
    .range([0, width])

var data1 = d3.histogram()
    .domain(x.domain())
    .thresholds(x.ticks(13))(dataHours)

var daysCount = [0,0,0,0,0,0,0]
dataDays.forEach(function(day) { daysCount[day]++ })

var data2 = DAYS.map((d,i) => ({name:d, count:daysCount[i]}))

function makeSVG(id, height, data, x, xProp, yProp, xWidth, tickFormat) {

    var y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[yProp])])
        .range([height, 0])

    var svg = d3.select("#" + id)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    var bar = svg.selectAll(".bar")
        .data(data)
        .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function(d) { return "translate(" + x(d[xProp]) + "," + y(d[yProp]) + ")" })

    bar.append("rect")
        .attr("x", 1)
        .attr("width", xWidth - 1)
        .attr("height", function(d) { return height - y(d[yProp]) })

    bar.append("text")
        .attr("dy", ".75em")
        .attr("y", 6)
        .attr("x", xWidth / 2)
        .attr("text-anchor", "middle")
        .text(function(d) { return formatCount(d[yProp]) })

    svg.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickFormat(tickFormat))
}

makeSVG("hourChart", height, data1, x, "x0", "length", x(data1[0].x1) - x(data1[0].x0), x => x + 'h')
makeSVG("dayChart", height - 100, data2, x2, "name", "count", x2.bandwidth())

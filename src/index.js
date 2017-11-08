"use strict";

import SimpleChart from './SimpleChart'
import RowChart from './RowChart'
import MultiCharts from './MultiCharts'
import BandZoom from './BandZoom'
import Chart from './Chart'

/* SimpleChart class*/
/*var mainChart = new SimpleChart(document.querySelector(".main-chart"));

fetch("./data.json")
    .then(response => response.json())
    .then((data) => {
        mainChart.setData(data);
        mainChart.renderChart();
    })*/
/* ------------------ */

/* RowChart */
/*RowChart(document.querySelector(".main-chart"))*/

/* TODO: неправильно работает создание нескольких графиков, исправить */
var chart = new Chart(document.querySelector(".main-chart")),
    chart2 = new Chart(document.querySelector(".main-chart"));

console.log(chart);

var fullData = {},
    intervalId = null,
    i = 20;

d3.csv('./data.csv', function(data) {
    var columns = data['columns'];
    data.forEach(function(d) {
        d.x = +d.x * 60;
        d.y = +d.y;
    });

    delete data['columns']

    fullData['1'] = data;

    d3.csv('./data-2.csv', function(data2) {
        data2.forEach(function(d) {
            d.x = +d.x * 60;
            d.y = +d.y;
        })

        delete data2['columns']

        fullData['2'] = data2;

        fullData['1'] = [{'x': 0, 'y': 0}];

        chart.setData(fullData)
        chart2.setData(fullData)

        intervalId = setInterval(function() {
            chart.pushNewData({'x': i, 'y': i*0.3}, '1');
            chart2.pushNewData({'x': i, 'y': i*0.9}, '1');
            i += 20;

            if (i > 5000) {
                clearInterval(intervalId);
            }
        }, 1000);
    });
})
/* ------------------ */

/* MultiCharts */
MultiCharts()
/* ------------------ */

/* Band Zoom */
BandZoom()
/* ------------------ */

/*
var scale = d3.scaleLinear()
    .domain([1, 5])   // Data space
    .range([0, 200]); // Pixel space
var svg = d3.select("body").append("svg")
    .attr("width",  350)
    .attr("height", 250);
function render(data, color){
    // Bind data
    var rects = svg.selectAll("rect").data(data);
    console.log('adsfasdf')
    rects.exit().remove()

    rects.enter().append("rect")
        .attr("x", function(x) {console.log(x); return scale(x)})
        .attr("y", 50)
        .attr("width",  20)
        .attr("height", 20)
        .merge(rects)
        .attr("fill", color)

}
setTimeout(function() {render([1, 2, 3, 4, 5], "blue")}, 1000);
setTimeout(function() {render([1, 2, 3, 4, 5, 6], "red")}, 4000);*/

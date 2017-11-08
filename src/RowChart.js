function RowChart() {
    var svg = d3.select("svg"),
        margin = {top: 20, right: 20, bottom: 30, left: 50},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom,
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")"),
        dataAcc = null,
        dataMap = {},
        drawing = false,
        zoomed = false,
        x = d3.scaleLinear()
            .rangeRound([0, width]),
        y = d3.scaleLinear()
            .rangeRound([height, 0]),
        colors = d3.scaleOrdinal(d3.schemeCategory10),
        area = d3.area()
            .x(function(d) { return x(d.x); })
            .y1(function(d) { return y(d.y); }),
        bandPos = [-1, -1],
        drag = d3.drag(),
        xdomain = [],
        ydomain = [],
        currentXdomain = [],
        currentYdomain = [],
        zoomout = g.append("g");

    zoomout.append("rect")
        .attr("class", "zoomOut")
        .attr("width", 155)
        .attr("height", 40)
        .attr("x", -12)
        .attr("y", height + (margin.bottom - 20))
        .on("click", function() {
            zoomOut();
        });

    zoomout.append("text")
        .attr("class", "zoomOutText")
        .attr("width", 155)
        .attr("height", 30)
        .attr("x", -10)
        .attr("y", height + (margin.bottom - 5))
        .text("Сбросить увеличение");

    var line = d3.line()
        .curve(d3.curveBasis)
        .x(function(d) { return x(d.x); })
        .y(function(d) { return y(d.y); });

    var band = g.append("rect")
        .attr("width", 0)
        .attr("height", 0)
        .attr("x", 0)
        .attr("y", 0)
        .attr("class", "band");

    g.append("clipPath")
        .attr("id", "clip-main")
        .append("rect")
        .attr("width", width)
        .attr("height", height);

    g.append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr("class", "x-axis")

    g.append("g")
        .attr("class", "y-axis")
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Попугаи");

    var zoomOverlay = g.append("rect")
        .attr("width", width - 10)
        .attr("height", height)
        .attr("class", "zoomOverlay")
        .call(drag);

    drag.on("end", function() {
        var pos = d3.mouse(this);
        var x1 = x.invert(bandPos[0]);
        var x2 = x.invert(pos[0]);
        var xdomainTmp = [];
        var ydomainTmp = [];

        if (x1 < x2) {
            xdomainTmp[0] = x1;
            xdomainTmp[1] = x2;
        } else {
            xdomainTmp[0] = x2;
            xdomainTmp[1] = x1;
        }

        var y1 = y.invert(pos[1]);
        var y2 = y.invert(bandPos[1]);

        if (y1 < y2) {
            ydomainTmp[0] = y1;
            ydomainTmp[1] = y2;
        } else {
            ydomainTmp[0] = y2;
            ydomainTmp[1] = y1;
        }

        bandPos = [-1, -1];

        g.select(".band").transition()
            .attr("width", 0)
            .attr("height", 0)
            .attr("x", bandPos[0])
            .attr("y", bandPos[1]);

        zoom(xdomainTmp, ydomainTmp);
    });

    drag.on("drag", function() {

        var pos = d3.mouse(this);

        if (pos[0] < bandPos[0]) {
            g.select(".band").
            attr("transform", "translate(" + (pos[0]) + "," + bandPos[1] + ")");
        }
        if (pos[1] < bandPos[1]) {
            g.select(".band").
            attr("transform", "translate(" + (pos[0]) + "," + pos[1] + ")");
        }
        if (pos[1] < bandPos[1] && pos[0] > bandPos[0]) {
            g.select(".band").
            attr("transform", "translate(" + (bandPos[0]) + "," + pos[1] + ")");
        }

        //set new position of band when user initializes drag
        if (bandPos[0] == -1) {
            bandPos = pos;
            g.select(".band").attr("transform", "translate(" + bandPos[0] + "," + bandPos[1] + ")");
        }

        g.select(".band").transition().duration(1)
            .attr("width", Math.abs(bandPos[0] - pos[0]))
            .attr("height", Math.abs(bandPos[1] - pos[1]));
    });

    function renderChart(dataSet) {
        /* Рассчёт границ по данным */
        xdomain = [
            d3.min(dataSet, (c) => { return d3.min(c.values, (d) => d.x)}),
            d3.max(dataSet, (c) => { return d3.max(c.values, (d) => d.x)})
        ]

        ydomain = [
            0,
            d3.max(dataSet, (c) => { return d3.max(c.values, (d) => d.y)})
        ]

        currentXdomain = xdomain
        currentYdomain = ydomain

        /* Рассчёт цветов */
        colors.domain(dataSet.map(c => c.id))

        /* Установка границ по данным */
        x.domain(currentXdomain);
        y.domain(currentYdomain);

        /* Обновление осей */
        updateAxis(x, y)

        /* Применение новых данных */
        var lines = g.selectAll(".city")
            .data(dataSet)
            .enter()
            .append("g")
            .attr("class", "city");

        /* Удаление лишнего, если нужно */
        lines.exit().remove();

        lines.append("path")
            .attr("class", "line")
            .attr("clip-path", "url(#clip-main)")
            .style("stroke", function(d) { return colors(d.id); })
            .attr("d", function(d) { return line(d.values); });
    }

    /* Перерисовка всего графика */
    function _reRenderChart(dataSet) {
        /* Рассчёт границ по данным */

        if (!zoomed) {
            currentXdomain = [
                d3.min(dataSet, (c) => { return d3.min(c.values, (d) => d.x)}),
                d3.max(dataSet, (c) => { return d3.max(c.values, (d) => d.x)})
            ]

            currentYdomain = [
                0,
                d3.max(dataSet, (c) => { return d3.max(c.values, (d) => d.y)})
            ]
        }

        /* Рассчёт цветов */
        colors.domain(dataSet.map(c => c.id))

        /* Установка границ по данным */
        x.domain(currentXdomain);
        y.domain(currentYdomain);

        /* Обновление осей */
        updateAxis(x, y)

        /* Применение новых данных */
        var lines = g.selectAll(".city")
            .data(dataSet)
            .enter()
            .append("g")
            .attr("class", "city");

        /* Удаление лишнего, если нужно */
        lines.exit().remove();

        /* Перерисовка всех линий на графике */
        g.selectAll(".line")
            .attr("clip-path", "url(#clip-main)")
            .style("stroke", function(d) { return colors(d.id); })
            .attr("d", function(d) { return line(d.values); });
    }

    function _mapToArr(localMap) {
        return Object.keys(localMap).map(function(key) {
            return {id: key, values: localMap[key]}
        })
    }

    function updateAxis(localX, localY) {
        g.selectAll(".x-axis")
            .call(d3.axisBottom(localX))
        g.selectAll(".y-axis")
            .call(d3.axisLeft(localY))
    }

    function setData(localDataMap) {
        if (!localDataMap ||
            Object.prototype.toString.call(localDataMap) !== '[object Object]') {
            return null;
        }

        dataMap = localDataMap;

        // TODO вынести наверх
        renderChart(_mapToArr(dataMap));

        return dataMap;
    }

    function pushNewData(newData, lineId) {
        if (!newData ||
            Object.prototype.toString.call(newData) !== '[object Object]') {
            return null;
        }

        dataMap[lineId].push(newData)

        // TODO вынести наверх
        _reRenderChart(_mapToArr(dataMap));

        /*if (drawing) {
            if (!dataAcc){
                dataAcc = {};
            }

            if (!dataAcc[lineId]) {
                dataAcc[lineId] = [];
            }

            dataAcc[lineId].push(newData);
        } else {
            /!*if (dataAcc) {
                for (var key in dataAcc) {
                    dataMap[key] = dataMap[key].concat(dataAcc[key]);
                }
                clearDataAcc()
            }*!/

            dataMap[lineId].push(newData)

            // TODO вынести наверх
            _reRenderChart(_mapToArr(dataMap));
        }*/
    }

    function clearDataAcc() {
        dataAcc = null;
    }

    function zoom(xdomainTmp, ydomainTmp) {
        zoomed = true;
        currentYdomain = ydomainTmp
        currentXdomain = xdomainTmp
        //recalculate domains
        if (currentXdomain[0] > currentXdomain[1]) {
            x.domain([currentXdomain[1], currentXdomain[0]]);
        } else {
            x.domain([currentXdomain[0], currentXdomain[1]]);
        }

        if (currentYdomain[0] > currentYdomain[1]) {
            y.domain([currentYdomain[1], currentYdomain[0]]);
        } else {
            y.domain([currentYdomain[0], currentYdomain[1]]);
        }

        //update axis and redraw lines
        var t = g.transition().duration(750);
        t.on("start", () => { drawing = true; })
        t.on("end", () => {
            drawing = false;

        })
        t.select(".x-axis").call(d3.axisBottom(x));
        t.select(".y-axis").call(d3.axisLeft(y));

        t.selectAll(".line").attr("d", d => line(d.values));
    }

    var zoomOut = function() {
        var dataSet = _mapToArr(dataMap);
        var t = g.transition().duration(750);

        t.on("start", () => { drawing = true; })
        t.on("end", () => { drawing = false; })
        xdomain = [
            d3.min(dataSet, (c) => { return d3.min(c.values, (d) => d.x)}),
            d3.max(dataSet, (c) => { return d3.max(c.values, (d) => d.x)})
        ]

        ydomain = [
            0,
            d3.max(dataSet, (c) => { return d3.max(c.values, (d) => d.y)})
        ]
        x.domain(xdomain);
        y.domain(ydomain);
        t.select(".x-axis").call(d3.axisBottom(x));
        t.select(".y-axis").call(d3.axisLeft(y));

        t.selectAll(".line").attr("d", d => line(d.values));
        zoomed = false
    }

    window.renderChart = renderChart
    window._reRenderChart = _reRenderChart
    window.setData = setData
    window.pushNewData = pushNewData
}

/*var fullData = {},
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

        setData(fullData)

        intervalId = setInterval(function() {
            pushNewData({'x': i, 'y': i*0.3}, '1');
            i += 20;

            if (i > 5000) {
                clearInterval(intervalId);
            }
        }, 1000);
    });
})*/

export default RowChart

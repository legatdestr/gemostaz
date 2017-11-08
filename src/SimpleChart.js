class SimpleChart {
    constructor (container, data, options) {
        this.options = options === undefined ?
            Object.assign({}, this.getDefaultParams()) :
            Object.assign({}, this.getDefaultParams(), options);
        this.data = data === undefined ? [] : data

        this.x = d3.scaleLinear()
            .rangeRound([0, this.options.width]);
        this.y = d3.scaleLinear()
            .rangeRound([this.options.height, 0]);
        this.g = null;

        this.area = d3.area()
            .x(d => this.x(d.x))
            .y1(d => this.y(d.y));

        this.options.chartClassName = 'chart_' + (new Date()).getTime();

        this.chartContainer = container;

        this.svg = null;
        this.svgBlock = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svgBlock.setAttribute("width", this.options.width);
        this.svgBlock.setAttribute("height", this.options.height);
        this.svgBlock.setAttribute("class", this.options.chartClassName);
    }

    getDefaultParams () {
        return {
            // Size
            width: 960,
            height: 500,
            // Padding
            paddingTop: 40,
            paddingRight: 30,
            paddingBottom: 60,
            paddingLeft: 70,
            // Margin
            marginTop: 20,
            marginRight: 20,
            marginBottom: 30,
            marginLeft: 50,
            // Max and Min values
            xMax: 100,
            xMin: 0,
            yMax: 100,
            yMin: 0,
            // Text
            title: 'Simple Chart',
            xLabel: 'x axis',
            yLabel: 'y axis'
        }
    }

    setData(data) {
        this.data = data
    }

    pushNewData(newData) {
        if (Object.prototype.toString.call(data).indexOf("Array") === -1) {
            throw new TypeError ("Argument 'data' must be an array.")
        }

        this.setData(this.data.concat(newData))
    }

    updateAxis () {
        this.g.selectAll("g.x-axis")
            .call(d3.axisBottom(this.x))
        this.g.selectAll("g.y-axis")
            .call(d3.axisLeft(this.y))
    }

    renderChart () {
        if (this.data.length === 0) return;
        let pureWidth = this.options.width - this.options.marginLeft - this.options.marginRight,
            pureHeight = this.options.height - this.options.marginTop - this.options.marginBottom,
            x = this.x,
            y = this.y,
            g = this.g,
            area = this.area,
            data = this.data,
            svg = this.svg;

        this.chartContainer.appendChild(this.svgBlock)
        svg = d3.select(`.${this.options.chartClassName}`) // TODO попробовать передать объект, а не className

        x.domain(d3.extent(data, d => d.x))
        y.domain(d3.extent(data, d => d.y))
        /*y.domain([0, d3.max(data, d => d.y)])*/
        area.y0(y(0));

        g = svg.append("g")
            .attr("transform", `translate(${this.options.marginLeft}, ${this.options.marginTop})`)

        g.append("path")
            .datum(data)
            .attr("fill", "white")
            .attr("stroke", "steelblue")
            .attr("d", area);

        // TODO добавить добавление текста из options

        g.append("g")
            .attr("transform", `translate(0, ${pureHeight})`)
            .attr("class", "x-axis")
            .call(d3.axisBottom(x))

        g.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(y))
            .append("text")
            .attr("fill", "#000")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .text("Number");
    }

    updateChart() {
        let x = this.x,
            y = this.y,
            data = this.data;
        x.domain(d3.extent(data, d => d.x ));
        /*y.domain([0, d3.max(data, d => d.x)]);*/
        y.domain(d3.extent(data, d => d.y ));
        this.svg.selectAll("path").data([data])
            .attr("d", area);

        this.updateAxis(x, y)
    }
}

export default SimpleChart

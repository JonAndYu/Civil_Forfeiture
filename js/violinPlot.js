class ViolinPlot {

    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
            margin: { top: 20, bottom: 20, right: 20, left: 50}
        };
        this.data = _data;
        this.initVis();
    }

    initVis() {
        let vis = this;
        vis.svg = d3.select(this.config.parentElement);
        
        vis._instantiateConfigDimensions(vis.svg);

        // Creating the Chart.
        vis.chartArea = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);
        
        vis.chart = vis.chartArea.append('g');

        vis._createScales();

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        vis.data = vis._filterBetweenRangeOfYears(vis._filterNegativeRevenues(vis.data), 1987, 1992);

        vis._updateScales();

        vis._computeHistogram();

        vis.renderVis();
    }

    renderVis() {
        let vis = this;

        // Render the violin part
        this._renderViolin();
        this._renderPoints();
        
    }

    _renderViolin() {
        let vis = this;

        vis.chart.selectAll('.violin-bins')
             .data(vis.sumstat)
           .join('rect')
             //.append('rect')
             .classed('violin-bins')
             .attr("x", 1)
        //     .attr("transform", function(d) { return "translate(" + vis.xScale(d.x0) + "," + vis.xNum(d.length) + ")"; })
        //     .attr("width", function(d) { return vis.xScale(d.x1) - vis.xScale(d.x0) - 1 ; })
        //     .attr("height", function(d) { return 1000 - vis.xNum(d.length); })
        //     .style("fill", "steelblue");
            

        // vis.chart.selectAll('.violin-histogram')
            //    .data(vis.sumstat)
            // .enter('path')
            // .attr('class', 'violin-histogram')
            //.style('stroke', 'none')
            //.style('fill', 'grey')
            // .join('g')
            //     .classed('violin-histogram')
            //     .attr("transform", d => `translate(${vis.xScale(d[0])}, 0)`)
            //     .selectAll("path")
            //     .data(d => [d.value])
            //     .join("path")
            //         .style("stroke", "none")
            //         .style("fill", "grey")
            //         .attr("d", d3.area()
            //             .x0(vis.xNum(0))
            //             .x1(d => vis.xNum(d.length))
            //             .y(d => vis.yScale(d.x0))
            //             .curve(d3.curveCatmullRom) // This makes the line smoother to give the violin appearance. Try d3.curveStep to see the difference
            //         );


    }

    _renderPoints() {
        let vis = this;
    }

    _computeHistogram() {
        let vis = this;
        // Features of the histogram
        vis.bin = d3.bin()
            .domain(vis.yScale.domain())
            .thresholds(vis.yScale.ticks(10))    // Important: how many bins approx are going to be made? It is the 'resolution' of the violin plot
            .value(d => d)

        // Compute the binning for each group of the dataset
        // Every acc is the entries of a different year.
        vis.sumstat = d3.rollup(vis.data, acc => vis.bin(acc.map(g => g.REV)), d => d.YEAR);

        d3.rollup(vis.data, acc => {
            console.log(vis.bin(acc.map(g => g.REV)));
        },
        d => {
            return d.YEAR;
        })

        // What is the biggest number of value in a bin? We need it cause this value will have a width of 100% of the bandwidth.
        let maxNum = 0
        for (let i in vis.sumstat ){
            let allBins = vis.sumstat[i].value;
            let lengths = allBins.map(a => a.length);
            let longest = d3.max(lengths);
            maxNum = longest > maxNum ? longest : maxNum;
        }

        //vis.sumstat = Array.from(vis.sumstat, ([key, value]) => ({ key, value }));

        // The maximum width of a violin must be x.bandwidth = the width dedicated to a group
        vis.xNum = d3.scaleLinear()
            .range([0, vis.xScale.bandwidth()])
            .domain([-maxNum, maxNum])
    }

    /**
     * Accesses the DOM to retrieves the dimension (width and height) of the parameter
     * and assigns it as a class field.
     * @param {*} svg 
     */
    _instantiateConfigDimensions(svg) {
        let vis = this;
        const {width, height} = svg.node().getBoundingClientRect();
        vis.config.width = width - this.config.margin.left - this.config.margin.right;
        vis.config.height = height - this.config.margin.top - this.config.margin.bottom;
    }

    /**
     * Filters out all entries which have a negative revenue.
     * @param {Object[]} data 
     * @returns 
     */
    _filterNegativeRevenues(data) {
        return data.filter(d => d.REV >= 0)
    }

    /**
     * Returns a subset of the data where the entries fall inclusively fall between both bounds.
     * @param {Object[]} data 
     * @param {number} lowerBound 
     * @param {number} upperBound 
     * @returns 
     */
    _filterBetweenRangeOfYears(data, lowerBound, upperBound) {
        return data.filter(d => d.YEAR >= lowerBound && d.YEAR <= upperBound);
    }

    _createScales() {
        let vis = this;
        // Creating a log scale for the Y axis
        //vis.yScale = d3.scaleSymlog()
        vis.yScale = d3.scaleLinear()
            .range([vis.config.height, 0]);

        vis.xScale = d3.scaleBand()
        .range([ 0, vis.config.width ])
        .padding(0.05)

        vis.xAxis = vis.chartArea.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0, ${vis.config.height})`);

        vis.yAxisL = d3.axisLeft(vis.yScale);

        vis.yAxis = vis.chartArea.append('g')
            .attr('class', 'axis y-axis');

        vis.xAxisB = d3.axisBottom(vis.xScale); 
    }

    _updateScales() {
        let vis = this;

        vis.yScale.domain(d3.extent(vis.data, d => d.REV));
        vis.xScale.domain(d3.range(d3.min(vis.data.map(d => d.YEAR)), d3.max(vis.data.map(d => d.YEAR))));

        vis.xAxis.call(vis.xAxisB);
        vis.yAxis.call(vis.yAxisL);
    }

}
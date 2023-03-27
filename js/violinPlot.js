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
        console.log(vis.data);

        vis._updateScales();

        vis.renderVis();
    }

    renderVis() {
        let vis = this;
        
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
        
        // Test the scale by passing in a value
        console.log(vis.yScale(10)); // Output: 51.27...

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
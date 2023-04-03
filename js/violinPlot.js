class ViolinPlot {

    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
            legendElement: _config.legendElement,
            margin: { top: 30, bottom: 20, right: 20, left: 50},
            tooltipPadding: 10,
        };
        this.org_data = JSON.parse(JSON.stringify(_data));
        this.data = _data;
        console.log([...new Set(this.data.map(d => d["YEAR"]))]);
        [this.lower, this.upper] = d3.extent(this.data.map(d => d["YEAR"]));
        this.lower = this.lower === 0 ? 1986 : this.lower;
        this.initVis();
    }

    initVis() {
        let vis = this;
        vis.svg = d3.select(this.config.parentElement);
        console.log(this.lower);
        console.log(this.upper);
        console.log(vis._buildBin(this.lower, this.upper));
        
        vis._instantiateConfigDimensions(vis.svg);

        // Creating the Chart.
        vis.chartArea = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);
        
        vis.chart = vis.chartArea.append('g');

        vis._createScales();

        vis._initLegend();

        vis._initAxisLabels();

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        vis.data = vis._filterBetweenRangeOfYears(vis._filterNegativeRevenues(vis.data), 1995, 2009);

        vis._updateScales();

        vis._computeHistogram();

        // Add button functionality
        vis._filterSelect("#filter-others");
        vis._filterSelect("#filter-zeros");

        vis.renderVis();
    }

    renderVis() {
        let vis = this;

        // Render the violin part
        this._renderHistograms();
        this._renderHistogramAxis();
        this._renderPoints();
    }

    //#region Initialization Functions

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
     * Creates the following 3 scales.
     * - vis.yScale is a symmetric log to be used on the revenume of data points
     * - vis.xSale is a band scale to be used for each group (year)
     * - vis.xName is a linear scale that's used for the histogram creation.
     */
    _createScales() {
        let vis = this;

        // Creating a log scale for the Y axis
        vis.yScale = d3.scaleSymlog()
            .range([vis.config.height, 0]);

        vis.xScale = d3.scaleBand()
        .range([ 0, vis.config.width ])
        .padding(0.05)

        vis.xNum = d3.scaleLinear()
            .range([0, Math.floor(vis.xScale.bandwidth() / 2)])

        vis.xAxis = vis.chartArea.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0, ${vis.config.height})`);

        vis.yAxisL = d3.axisLeft(vis.yScale).tickValues([1, 5, 10,25,50,100,250,500,1000, 2500, 5000, 10000, 25000]);

        vis.yAxis = vis.chartArea.append('g')
            .attr('class', 'axis y-axis');
            

        vis.xAxisB = d3.axisBottom(vis.xScale); 
    }

    /**
     * Creates a color legend for property types.
     *  #fbb4ae - Vehicle
     *  #b3cde3 - Real Property
     *  #ccebc5 - Currency
     *  #decbe4 - Other 
     */
    _initLegend() {
        let vis = this;
        let svg = d3.select(vis.config.legendElement);

        // Value : Key => PROP_TYPE : CSS Class
        let prop_type_dict = {
            'Currency' : 'currency',
            'Vehicles' : 'vehicles',
            'Real Property' : 'real-property',
            'Other' : 'other'
        };

        let count = 1
        let circleRad = 10

        for (const key in prop_type_dict) {
            const curr_group = svg.append('g');
            curr_group.append('circle')
                .attr('r', circleRad)
                .attr('transform', `translate(${circleRad}, ${count*30 - 60})`)
                .classed('point', true)
                .classed(prop_type_dict[key], true);
                
            curr_group.append('text')
                .attr('transform', `translate(${3*circleRad}, ${count*30 - 60 + circleRad /2 })`)
                .text(key);
            
            curr_group.attr('transform', 'translate(0, 50)')

            count++;
        }
    }

    /** Adds the axis labels */
    _initAxisLabels() {
        let vis = this;
        
        // Add the Year axis Label
        vis.chart.append('text')
            .style('fill', "black")
            .style('font-size', 24)
            .style('font-weight', "bold")
            .attr('transform', `translate(${vis.config.width - 50}, ${vis.config.height + 20})`)
            .text("Year");

        // Add the Revenue axis Label
        vis.chart.append('text')
            .style('fill', "black")
            .style('font-size', 24)
            .style('font-weight', "bold")
            .attr('transform', `translate(-50, -4)`)
            .text("Revenue");

        // Add the count axis Lable
        vis.chart.append('text')
        .style('fill', "black")
        .style('font-size', 14)
        .style('font-weight', "bold")
        .attr('transform', `translate(${vis.config.width - 20}, -18)`)
        .text("Count");
    }

    //#endregion

    //#region Update Functions

    /**
     * Computes a histogram and creates the following class properties.
     *  vis.sumstat = [{year: ####, value: Array(#)}, ...]
     *      The value key holds a 2d array where each array contains a property x0 (lower bounds)
     *      and x1 (upper bounds) of the given bin. The number of bins (size of value) is dictated
     *      by the thresholds of vis.bin. The length of each 1d array are the amount of values in the bin
     * 
     *  vis.xNum is a linear scale that is created by finding the max bin size of all the years.
     */
    _computeHistogram() {
        let vis = this;

        let data = vis.data;

        // Features of the histogram
        vis.bin = d3.bin()
            .domain(vis.yScale.domain())
            .thresholds([1,5,10,25,50,100,250,500,1000, 2500, 5000, 10000, 25000])
            .value(d => d)

        // Compute the binning for each group of the dataset
        // Every acc is the entries of a different year.
        vis.sumstat = Array.from(
                d3.rollup(data, acc => vis.bin(acc.map(g => g.REV)), d => d.YEAR)
            ).map(item => {
                return { year: item[0], value: item[1] };
            });

        console.log(vis.sumstat)

        // What is the biggest number of value in a bin? We need it cause this value will have a width of 100% of the bandwidth.
        let maxNum = vis.sumstat
            .map(item => item["value"].map(i => i.length))
            .reduce((acc, cur) => Math.max(acc, ...cur), -Infinity);

        // The maximum width of a violin must be x.bandwidth = the width dedicated to a group
        vis.xNum = d3.scaleLinear()
            .range([0, Math.floor(vis.xScale.bandwidth() / 2)])
            .domain([0, maxNum])
    }

    /**
     * UpdateVis helper function that modifies the scales.
     */
    _updateScales() {
        let vis = this;

        vis.yScale.domain(d3.extent(vis.data, d => d.REV));
        vis.xScale.domain(d3.range(d3.min(vis.data.map(d => d.YEAR)), d3.max(vis.data.map(d => d.YEAR)) + 1));

        vis.xAxis.call(vis.xAxisB);
        vis.yAxis.call(vis.yAxisL);
    }

    //#endregion

    //#region Render Functions

    /**
     * Appends the axis for each histogram. that is displayed at the top of the view.
     */
    _renderHistogramAxis() {
        let vis = this;
        let topAxis = d3.axisTop(vis.xNum).ticks(3);

        d3.selectAll('.year-hist')
            .append('g')
            .attr('class', 'x-axis count')
            .attr('transform', 'translate(0, 0)')
            .call(topAxis);
    }

    /**
     * Displays the points at each year mark.
     */
    _renderPoints() {
        let vis = this;
        
        let selection = vis.chart.selectAll('.points')
            .data(vis.data, d => d["RevenueID"])
            .join('circle');

        // Checks which of the two buttons are selected.
        if (d3.select('#filter-others').classed('selected') && d3.select('#filter-zeros').classed('selected')) {
            selection = selection.filter(d => d["REV"] !== 0 && d['PROP_TYPE'] !== "Other");
        } else if (d3.select('#filter-others').classed('selected')) {
            selection = selection.filter(d => d['PROP_TYPE'] !== "Other");
        } else if (d3.select('#filter-zeros').classed('selected')){
            selection = selection.filter(d => d["REV"] !== 0);
        }


        selection.classed('points', true)
            .attr('r', 3)
			.attr('cy', d => this.yScale(d["REV"]))
			.attr('cx', d => this.xScale(d["YEAR"]) + 0.5 * vis.xScale.bandwidth() - Math.abs(this._gaussianRandom()))
            .attr('transform', 'translate(-3,0)')
            .attr('class', d => {
                switch(d['PROP_TYPE']) {
                    case 'Currency':
                        return 'currency'
                    case 'Vehicles':
                        return 'vehicles'
                    case 'Real Property':
                        return 'real-property'
                    default: // Other
                        return 'other'
                }
            });
    }

    /**
     * Displays the histogram
     */
    _renderHistograms() {
        let vis = this;

        vis.chart.selectAll('.year-hist')
                .data(vis.sumstat, d => [d["year"]])
            .join('g')
                .classed('year-hist', true)
                .attr("transform", d => `translate(${vis.xScale(d["year"]) + 0.5 * vis.xScale.bandwidth()}, 0)`)
            .selectAll('.year-hist-bins')
            .data(d => d["value"])
            .join('rect')
                .classed('year-hist-bins', true)
                .attr('width', d => vis.xNum(d.length))
                .attr('height', d => vis.yScale(d.x0) - vis.yScale(d.x1))
                .attr('transform', d => `translate(0, ${vis.yScale(d.x1)})`)
                .on('mouseover', function(event, e) {
                    d3.select('#tooltip')
                      .style('opacity', 1)
                      .html(`
                      <div class="tooltip-title">${e.length} observations between \n revenue ${e.x0} and ${e.x1}</div>
                      `);
                })
                .on('mousemove', function (event, e) {
                    console.log(this);
                    console.log(e); // Length is the number in bin. X0 is the smallest in bin and x1 is the largest in bin
                    console.log(event);
                    d3.select('#tooltip')
                    .style('display', 'block')
                    .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')
                    .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
			    })
                .on('mouseleave', () => {
                    d3.select('#tooltip').style('display', 'none');
                });

        // vis._addHistogramTooltip();
    }

    //#endregion

    //#region Helper Functions

    /**
     * Filters out all entries which have a negative revenue.
     * @param {Object[]} data 
     * @returns 
     */
    _filterNegativeRevenues(data) {
        return data.filter(d => d.REV > 0)
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

    /**
     * Given a binwidth, the function will use a uniform distribution to randomly return a number [0, binwidth / 2]
     * @param {number} binwidth 
     */
    _addJitter(binwidth) {
        return Math.random() * Math.floor(binwidth / 2) | 0;
    }

    // Standard Normal variate using Box-Muller transform.
    _gaussianRandom(mean=0, stdev=15) {
        let u = 1 - Math.random(); // Converting [0,1) to (0,1]
        let v = Math.random();
        let z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
        // Transform to the desired mean and standard deviation:
        return z * stdev + mean;
    }

    /**
     * Algorithm to evenly divide a range of years into bins.
     * Because our dataset only includes the years 1986-2019
     * This will return a map with the maximum bin size, this will all it to
     * only be called once.
     * The possible bin sizes are 3, 4, 5.
     * If the number of years are evenly divisible by any one of these numbers, then that will be used as the number of bins.
     *  - numYears / binsizes
     * @param {number} lower 
     * @param {number} upper 
     * @returns 
     */
    _binYears(lower, upper) {
        let vis = this;
        let numYears = upper - lower + 1;
        
        let range = Array(upper - lower + 1).fill(0).reduce((acc, _, i) => acc.concat(lower + i), []);

        if (numYears < 6)
            return range
            
        let binSizes = [3, 4, 5]

        let optimalBin = undefined;
        let secondBest = undefined;

        for (let idx in binSizes) {
            let currBinNumber = binSizes[idx]
            if (numYears / currBinNumber === 0) {
                // This means that it is an evenly divisible and it's a good value.
                // If multiple are evenly divisible be the nature of the binSizes array, it'll get the max.
                optimalBin = currBinNumber;
                break;
            } else {
                secondBest = {
                    numberOfBins: currBinNumber,
                    remainder: numYears % currBinNumber 
                }
                for (let currBin of binSizes) {
                    let currMod = numYears % currBin;
                    if (secondBest['remainder'] < currMod) {
                        secondBest['numberOfBins'] = currBin;
                        secondBest['remainder'] = currMod;
                    }
                }
            }
        }

        if (typeof optimalBin !== 'undefined') return { numberOfBins: optimalBin, remainder: 0 };

        return secondBest;      
    }

    _buildBin(lower, upper) {
        let range = Array(upper - lower + 1).fill(0).reduce((acc, _, i) => acc.concat(lower + i), []);
        let vis = this;
        let binRes = vis._binYears(lower, upper)
        let res = vis._thresholdBuilder(binRes, lower, upper);
        let bin = d3.bin()
            .domain([lower, upper])
            .thresholds(res);
        return bin(range);
    }

    /**
     * Given lower = 1995, upper = 2010 = returns [1999, 2002, 2005,2008,2011]
     * @param {*} numberOfBins 
     * @param {*} remainder 
     * @param {*} lower 
     * @param {*} upper 
     */
    _thresholdBuilder({numberOfBins, remainder}, lower, upper) {
        let perBin = (upper - lower + 1) / numberOfBins; // 3
        let res = []

        let yearCount = lower;

        while (remainder != 0) {
            yearCount += parseInt(perBin) + 1;
            res.push(yearCount);
            numberOfBins--;
            remainder--;
        }

        while (numberOfBins != 0) {
            yearCount += parseInt(perBin);
            res.push(yearCount);
            numberOfBins--;
        }

        return res;

    }

    //#endregion


    //#region Event Handlers

    /**
     * Button Event Listender
     * @param {*} selector 
     */
    _filterSelect(selector) {
        let vis = this;
        let button = d3.select(selector);

        button.on("click", function(event, e) {

            const element = d3.select(this);
            const isActive = element.classed("selected");

            element.classed("selected", !isActive);
            
            // Checks which of the two buttons are selected.
            vis._updateScales();
            vis._computeHistogram();
            vis.renderVis();
        });
    }

    /**
     * Adds tooltip event listener for histogram
     */
    _addHistogramTooltip(selector = '.year-hist-bins') {
        let vis = this;
        let histograms = d3.selectAll(selector)

        histograms.on('mouseover', function(event, e) {
            d3.select('#tooltip')
            .style('display', 'block')
            .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')
            .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
            .html(`
                <div class="tooltip-title">${d.trail}</div>
                `);
        })
    }

    //#endregion

}
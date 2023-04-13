class LineChart {

    constructor(_config, _data, _dispatcher) {
        this.config = {
            parentElement: _config.parentElement,
            legendElement: _config.legendElement,
            margin: { top: 30, bottom: 50, right: 20, left: 100},
            tooltipPadding: 10,
        };

        this.data = _data;
        this.initVis();
        this.dispatcher = _dispatcher;
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

        vis._initLegend();

        vis._initAxisLabels();

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Sorts the data by property type then year.
        vis.dataPoints = vis._createPointsData()
            .sort((a, b) => {
                return a['property_type'] === b['property_type'] ? 
                    a['year'] - b['year'] :
                    a['property_type'].localeCompare(b['property_type']);
            });

        vis.lineData = vis._createLineData();

        vis._updateScales();

        vis.renderVis();
    }

    renderVis() {
        let vis = this;

        vis._renderPoints();
        vis._renderLines();

        vis._addEventListeners();

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
        vis.yScale = d3.scaleLinear()
            .range([vis.config.height, 0]);

        vis.xScale = d3.scaleLinear()
            .range([ 0, vis.config.width ]);


        vis.xAxis = vis.chartArea.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0, ${vis.config.height})`);

        vis.radiusScale = d3.scaleSqrt()
			.range([3, 9]);

        vis.yAxisL = d3.axisLeft(vis.yScale).tickSizeOuter(0);
        vis.yAxis = vis.chartArea.append('g')
            .attr('class', 'axis y-axis');

        vis.xAxisB = d3.axisBottom(vis.xScale)
            .tickFormat(d3.format("d")).tickSizeOuter(0); 
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
            .attr('transform', `translate(${vis.config.width - 50}, ${vis.config.height - 4})`)
            .text("Year");

        // Add the ratio axis Label
        vis.chart.append('text')
            .style('fill', "black")
            .style('font-size', 24)
            .style('font-weight', "bold")
            .attr('transform', `translate(-50, -8)`)
            .text("Ratio (Conviction #/Total Cases)");

    }

    //#endregion

    //#region Update Functions

    /**
     * UpdateVis helper function that modifies the scales.
     */
    _updateScales() {
        let vis = this;

        // Helper function that inclusively returns a range of values between start and end.
        const getRange = (start, end) => [...Array.from({ length: end - start + 1 }, (_, i) => start + i)];

        vis.yScale.domain([d3.min(vis.dataPoints.map(d => d.ratio)) - 0.005,1]);

        vis.xScale.domain(d3.extent(vis.dataPoints.map(d => d['year'])));
        vis.xAxisB.tickValues(getRange(d3.min(vis.dataPoints.map(d => d['year'])), d3.max(vis.dataPoints.map(d => d['year']))));

        // Scale used to size encode a given vis.datapoint
        vis.radiusScale.domain(d3.extent(vis.dataPoints.map(d => d.convValues.length + d.nonConvValues.length)))

        vis.xAxis.transition()
            .duration(1000)
            .call(vis.xAxisB)
            .selectAll("text")  
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .style("font-size", "16px")
            .attr("transform", "rotate(-65)");

        vis.yAxis
            .transition()
            .duration(1000)
            .call(vis.yAxisL)
            .style("font-size", "16px")
    }

    /**
     * Groups the current vis.data by year and property type and creates a count
     * of conviction and non conviction observations. A ratio is derived from
     * the number of conviction types.
     * @returns [
     * {
     *  convValues: Array(Object),
     *  nonConvValues: Array(Object),
     *  property_type: "currency" | "vehicles" |"real-property" | "other",
     *  ratio: convValues.length / (convValues.length + nonConvValues.length),
     *  year: number
     * },...]
     */
    _createPointsData() {
        let vis = this;
        let ans = [];
        let yearGroups = d3.groups(vis.data, d => d["YEAR"]);

        for (let i in yearGroups) {
            let currYear = yearGroups[i][0]
            let yearArray = yearGroups[i][1]
            let propGroups = d3.groups(yearArray, d => d["PROP_TYPE"]);
            for (let j in propGroups) {
                let currGroup = propGroups[j][0];
                let dataArray = propGroups[j][1];

                let convCount = dataArray.reduce((acc, currentValue) => currentValue["CONV_TYPE"] === "Conviction" ? acc + 1 : acc, 0);
                let nonConvicCount = dataArray.reduce((acc, currentValue) => currentValue["CONV_TYPE"] === "No Conviction" ? acc + 1 : acc, 0);
                let total = (convCount + nonConvicCount);
                if (total === 0) break;
                let ratio = convCount / total;

                ans.push({
                    year: currYear,
                    ratio: ratio,
                    property_type: vis._convertPropertyName(currGroup),
                    convValues: dataArray.filter(d => d["CONV_TYPE"] === "Conviction"),
                    nonConvValues: dataArray.filter(d => d["CONV_TYPE"] === "No Conviction")
                });
            }
        }
        return ans;
    }

    /**
     * Return an object for every (year, property_type) which has datapoints for the following (year + 1, property_type)
     * @returns [
     * {
     *     property_type : "currency" | "vehicles" |"real-property" | "other",
     *     ratio1: number,
     *     ratio2: number,
     *     year1 : number,
     *     year2 : number
     * }...
     * ]
     */
    _createLineData() {
        let vis = this;
        let ans = [];

        for (let i = 0; i < vis.dataPoints.length - 1; i++) {
            let firstDatapoint = vis.dataPoints[i];
            let secondDatapoint = vis.dataPoints[i+1];

            // They are not of the same property_type
            if (secondDatapoint['property_type'] !== firstDatapoint['property_type']) continue;

            let prop_type = secondDatapoint['property_type'];

            // They are not consecuative
            if (secondDatapoint['year'] - firstDatapoint['year'] !== 1) {
                ans.push({
                    year1: firstDatapoint["year"],
                    ratio1: firstDatapoint["ratio"],
                    year2: firstDatapoint["year"],
                    ratio2: firstDatapoint["ratio"],
                    property_type: vis._convertPropertyName(prop_type),
                });
                continue;
            }

            ans.push({
                year1: firstDatapoint["year"],
                ratio1: firstDatapoint["ratio"],
                year2: secondDatapoint["year"],
                ratio2: secondDatapoint["ratio"],
                property_type: vis._convertPropertyName(prop_type),
            });
        }
        return ans;
    }

    //#endregion

    //#region Render Functions

    _renderPoints() {
        let vis = this;

        vis.chart.selectAll('.points')
            .data(vis.dataPoints)
        .join('circle')
            .attr('r', d => this.radiusScale(d.convValues.length + d.nonConvValues.length))
			.attr('cy', d => this.yScale(d["ratio"]))
			.attr('cx', d => this.xScale(d["year"]))
            .attr('class', d => vis._convertPropertyName(d['property_type']))
            .classed('points', true);
    }

    _renderLines() {
        let vis = this;

        vis.chart.selectAll('.chart-line')
            .data(vis.lineData)
        .join('line')
            .attr('x1', d => {return vis.xScale(d['year1'])})
            .attr('x2', d => {return vis.xScale(d['year2'])})
            .attr('y1', d => {return vis.yScale(d['ratio1'])})
            .attr('y2', d => {return vis.yScale(d['ratio2'])})
            .attr('class', d => vis._convertPropertyName(d['property_type']))
            .classed('chart-line', true);
    }

    _addEventListeners() {
        let vis = this;

        // Add event Listeners:
        d3.selectAll(".points, .chart-line")
            // When hovering over a point/line, it will highlight the line and highlight the corresponding bar in the bar chart view.
            .on('mouseover', function(event, e) {
                const element = d3.select(this);
                const propertyClass = element.attr('class').split(" ").filter(i => i !== 'points' && i !== 'chart-line');

                d3.selectAll(`.${propertyClass}`)
                    .classed("hover", true)

                d3.selectAll('.rect')
                    .filter(d => d["data"]["PROP_TYPE"] === vis._convertPropertyNameDisplay(propertyClass[0]))
                    .style('stroke-width', 5);

                // If the user mouses over a point, the tooltip will be displayed.
                if (element.classed("points")) {
                    d3.select('#tooltip')
                    .style('display', 'block')
                    .html(`
                        <div
                            <div class="tooltip-title"> ${vis._convertPropertyNameDisplay(e.property_type)} in ${e.year} </div>
                            <div> Ratio : ${e.ratio} </div>
                            <div> Conviction Count: ${e.convValues.length} </div>
                            <div> Non Conviction Count: ${e.nonConvValues.length} </div>
                        </div>
                        `);
                }

            })
            // The barchart and line/points will no longer be highlighted when the user's mouse leaves.
            .on('mouseleave', function(event, e) {
                const element = d3.select(this);
                const propertyClass = element.attr('class').split(" ").filter(i => i !== 'points' && i !== 'chart-line');

                d3.selectAll(`.${propertyClass[0]}`)
                    .classed("hover", false);

                d3.selectAll('.rect')
                    .filter(d => d["data"]["PROP_TYPE"] === vis._convertPropertyNameDisplay(propertyClass[0]))
                    .style('stroke-width', null);
                
                // If the user leaves a point, the tooltip will be hidden.
                if (element.classed("points")) {
                    d3.select('#tooltip').style('display', 'none');
                }
            });

            d3.selectAll(".points")
                // THe tooltip will move in accordance to the user's mouse if it's over a point
                .on('mousemove', function (event, _) {
                    d3.select('#tooltip')
                        .style('left', `${event.pageX + vis.config.tooltipPadding}px`)   
                        .style('top', `${event.pageY + vis.config.tooltipPadding}px`)
                });

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
     * Converts display property name to class property name
     */
    _convertPropertyName(val) {
        switch(val) {
            case 'Currency':
                return 'currency';
            case 'Vehicles':
                return 'vehicles';
            case 'Real Property':
                return 'real-property';
            case 'Other':
                return 'other';
            default:
                return val;
        }
    }

    /**
     * Converts class property name to display property name
     */
    _convertPropertyNameDisplay(val) {
        switch(val) {
            case 'currency':
                return 'Currency';
            case 'vehicles':
                return 'Vehicles';
            case 'real-property':
                return 'Real Property';
            case 'other':
                return 'Other';
            default:
                return val;
        }
    }

    //#endregion
}
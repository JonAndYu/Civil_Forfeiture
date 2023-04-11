class LineChart {

    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
            legendElement: _config.legendElement,
            margin: { top: 30, bottom: 50, right: 20, left: 100},
            tooltipPadding: 10,
        };

        this.data = _data.filter(d => d["YEAR"] >= 1986);
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

        vis._initLegend();

        // vis._initAxisLabels();

        // Add button functionality
        vis._filterSelect("#filter-others");
        vis._filterSelect("#filter-zeros");

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
        
        vis.xValue = d => d['year'];
        vis.yValue = d => d['ratio'];

        vis.line = d3.line()
            .x(d => vis.xScale(vis.xValue(d)))
            .y(d => vis.yScale(vis.yValue(d)));

        // vis.lineData = vis._nestDataPoint();

        vis._updateScales();

        vis.renderVis();
    }

    renderVis() {
        let vis = this;

        vis._renderPoints();
        vis._renderLines();
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

        vis.yAxisL = d3.axisLeft(vis.yScale);
        vis.yAxis = vis.chartArea.append('g')
            .attr('class', 'axis y-axis');

        vis.xAxisB = d3.axisBottom(vis.xScale)
            .tickFormat(d3.format("d")); 
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
     * UpdateVis helper function that modifies the scales.
     */
    _updateScales() {
        let vis = this;

        // Helper function that inclusively returns a range of values between start and end.
        const getRange = (start, end) => [...Array.from({ length: end - start + 1 }, (_, i) => start + i)];

        vis.yScale.domain([d3.min(vis.dataPoints.map(d => d.ratio)) - 0.05,1]);
        vis.xScale.domain(d3.extent(vis.dataPoints.map(d => d['year'])));
        vis.xAxisB.tickValues(getRange(d3.min(vis.dataPoints.map(d => d['year'])), d3.max(vis.dataPoints.map(d => d['year']))));
        //console.log(d3.extent(vis.dataPoints.map(d => d.convValues.length + d.nonConvValues.length)));
        vis.radiusScale.domain(d3.extent(vis.dataPoints.map(d => d.convValues.length + d.nonConvValues.length)))

        vis.xAxis.transition()
            .duration(1000)
            .call(vis.xAxisB)
            .selectAll("text")  
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");

        vis.yAxis
            .transition()
            .duration(1000)
            .call(vis.yAxisL);
    }

    /**
     * [
     *  { 
     *      year: ####, 
     *      proportion: Conv/nonConvic+conv+other, 
     *      prop_type = "Other" | "Vehicles" | "Currency" | "Real-Property"
     *  },
     *  { 
     *      year: ####, 
     *      ratio: Conv/nonConvic+conv+other, 
     *      prop_type = "Other" | "Vehicles" | "Currency" | "Real-Property"
     *  },
     *  ...
     * ]
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
                    property_type: currGroup,
                    convValues: dataArray.filter(d => d["CONV_TYPE"] === "Conviction"),
                    nonConvValues: dataArray.filter(d => d["CONV_TYPE"] === "No Conviction")
                });
            }
        }
        return ans;
    }


    _nestDataPoint() {
        let vis = this;
        const result = vis.dataPoints.reduce((accumulator, currentValue) => {
            const index = accumulator.findIndex(item => item.property_type === currentValue.property_type);
            if (index === -1) {
              accumulator.push({
                property_type: currentValue.property_type,
                values: [{year: currentValue.year, ratio: currentValue.ratio}]
              });
            } else {
              accumulator[index].values.push({year: currentValue.year, ratio: currentValue.ratio});
            }
            return accumulator;
          }, []);

        return result;
    }

    /**
     * [
     *  { 
     *      year1: 
     *      ratio1: 
     *      year2: 
     *      ratio2:
     *  },
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
                    property_type: prop_type,
                });
                continue;
            }

            ans.push({
                year1: firstDatapoint["year"],
                ratio1: firstDatapoint["ratio"],
                year2: secondDatapoint["year"],
                ratio2: secondDatapoint["ratio"],
                property_type: prop_type,
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
            .attr('class', d => {
                switch(d['property_type']) {
                    case 'Currency':
                        return 'currency'
                    case 'Vehicles':
                        return 'vehicles'
                    case 'Real Property':
                        return 'real-property'
                    default: // Other
                        return 'other'
                }
            })
            .classed('points', true)
            .on("mouseover", function(event, e) {
                console.log(e);
				d3.select('#tooltip')
				  .style('opacity', 1)
				//   .html(`
                //     <div<
				//   		<div> Year : ${e.year} </div>
                //         <div> Property Type : ${e.property_type}
				//   	 	<div> Ratio$ : ${e.ratio} </div>
                //         <div> Conviction Count: ${e.convValues.length} </div>
                //         <div> Non Conviction Count: ${e.nonConvValues.length} </div>
                //     </div>
				//  	`);
                .html(`<div>year </div>`);
			})
            .on('mousemove', function (event, _) {
				d3.select('#tooltip')
				  	.style('left', `${event.pageX + vis.config.tooltipPadding}px`)   
				  	.style('top', `${event.pageY + vis.config.tooltipPadding}px`)
			})
			.on('mouseleave', () => {
				d3.select('#tooltip').style('opacity', 0);
			});
    }

    _renderLines() {
        let vis = this;

        // vis.chart.selectAll('.chart-line')
        //     .data(vis.lineData, d => [d.property_type])
        //     .join('g')
        //     .classed('chart-line', true)
        //     .selectAll('.line')
        //     .data(d => {return [d.values]})
        //     .join('path')
        //     .classed('line', true)
        //     .attr('d', d => {console.log(d); return vis.line(d)});

        vis.chart.selectAll('.chart-line')
            .data(vis.lineData)
        .join('line')
            .attr('x1', d => {return vis.xScale(d['year1'])})
            .attr('x2', d => {return vis.xScale(d['year2'])})
            .attr('y1', d => {return vis.yScale(d['ratio1'])})
            .attr('y2', d => {return vis.yScale(d['ratio2'])})
            .attr('class', d => {
                switch(d['property_type']) {
                    case 'Currency':
                        return 'currency'
                    case 'Vehicles':
                        return 'vehicles'
                    case 'Real Property':
                        return 'real-property'
                    default: // Other
                        return 'other'
                }
            })
            .classed('chart-line', true);
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
            
            vis.updateVis()
        });
    }

    //#endregion

}
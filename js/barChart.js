class BarChart {
    constructor(_config, _data, _dispatcher) {
        this.config = {
            parentElement: _config.parentElement,
            legendElement: _config.legendElement,
            containerWidth: _config.containerWidth || 600,
            containerHeight: _config.containerHeight || 450,
            margin: { top: 20, bottom: 30, right: 20, left: 70},
            tooltipPadding: 10,
        };
        this.data = _data;
        this.initVis();
        this.dispatcher = _dispatcher;
    }

    initVis() {
        let vis = this;

        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;


        vis.xScale = d3.scaleBand()
            .range([0, vis.width])
            .paddingInner(0.2)
            .paddingOuter(0.2);

        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0]);

        // Initialize axes
        vis.xAxis = d3.axisBottom(vis.xScale).tickSizeOuter(0);
        vis.yAxis = d3.axisLeft(vis.yScale).ticks(6).tickSizeOuter(0);

        // Define size of SVG drawing area
        vis.svg = d3.select(vis.config.parentElement).append('svg')
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);

        // Append group element that will contain our actual chart
        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left + 50},${vis.config.margin.top})`);

        // Append empty x-axis group and move it to the bottom of the chart
        vis.xAxisG = vis.chart.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${vis.height})`);

        // Append y-axis group
        vis.yAxisG = vis.chart.append('g')
            .attr('class', 'axis y-axis');

        // Append both axis titles
        // vis.svg.append('text')
        //     .attr('class', 'axis-title')
        //     .attr('y', vis.height - 15)
        //     .attr('x', vis.config.containerWidth)
        //     .attr('dy', '.71em')
        //     .style('text-anchor', 'end')
        //     .text('Property type');

        vis.svg.append('text')
            .attr('class', 'axis-title')
            .attr('x', 0)
            .attr('y', 0)
            .attr('dy', '.71em')
            .attr('transform', `translate(2, 300) rotate(-90)`)
            .style('font-size', 24)
            .style('font-weight', "bold")
            .text('Revenue ($USD)');

        // color palette for different conviction types
        vis.colors = ['#e55153','black'];

        // append legends
        vis.legend = d3.select(vis.config.legendElement);

        for (const key in ['Conviction','No Conviction']){
            let cur = vis.legend.append("g");
            cur.append('rect')
                .attr("width", 19)
                .attr("height", 19)
                .attr("fill", vis.colors[key])
                .attr('transform', `translate(0, ${key*30 })`);
            cur.append("text")
                .attr("dy", "0.32em")
                .attr('transform', `translate(30, ${key*30 + 10 })`)
                .text(['Conviction','No Conviction'][key]);
        }

        vis.updateVis();

    }

    updateVis() {
        let vis = this;

        // filtering data by property types and conviction type
        vis.subgroups = ['Conviction','No_Conviction'];
        vis.filteredData = vis.data.filter(d => d.PROP_TYPE != NaN && d.REV != NaN);
        vis.finalData = d3.rollup(vis.filteredData, v => d3.sum(v, d=>d.REV), d=>d.PROP_TYPE, d=>d.CONV_TYPE);

        //rollup data get sum of REV by prop_type
        vis.data1 = d3.rollup(vis.filteredData, v => d3.sum(v, d=>d.REV), d=>d.PROP_TYPE);
        vis.data2 = Array.from(vis.data1, ([name, value])=> ({name, value}));

        // process data
        let max = 0;
        vis.dataToUse = [];
        vis.realData = [];
        for (const data of vis.finalData){
            let prop_type = data[0];
            let map = data[1];
            let conv = 0;
            let no_conv = 0;
            let unknown = 0;
            for (const conv_type of map){
                vis.dataToUse.push({PROP_TYPE: prop_type, CONV_TYPE: conv_type[0], REV: conv_type[1]});
                if (conv_type[1]>max){
                    max = conv_type[1];
                }
                if (conv_type[0]=="Conviction"){
                    conv = conv_type[1];
                } else if (conv_type[0]=="No Conviction"){
                    no_conv = conv_type[1];
                }else{
                    unknown = conv_type[1];
                }
            }
        vis.realData.push({PROP_TYPE: prop_type, Conviction: conv, No_Conviction: no_conv, Unknown: unknown});
        }
        
        // stack the data
        vis.stackedData = d3.stack()
            .keys(vis.subgroups)
            (vis.realData);

        // set the domain of the scales
        vis.yScale.domain([0, max]).nice();
        vis.xScale.domain(vis.data2.map(d=>d.name));

        vis.renderVis();

    }

    renderVis() {
        let vis = this;
        vis.chart.selectAll('bars').remove();
        vis.chart.selectAll('rect').remove();

        let bars = vis.chart.selectAll('bars')
            .data(vis.stackedData)
            .join('g')
            .classed('bars', true)
            .attr("fill", function(d, i) {
                return vis.colors[i]; })
            .style('stroke', function(d, i) {
                return vis.colors[i]; })
            .style('stroke-width', 1)
            .selectAll("rect")
            // enter a second time = loop subgroup per subgroup to add all rectangles
            .data(function(d) {return d; })
            .join("rect")
            .classed('rect', true)
            .attr("x", function(d) {
                return vis.xScale(d.data.PROP_TYPE); })
            .attr("y", function(d) {
                return vis.yScale(d[1]); })
            .attr("height", function(d) {
                return vis.yScale(d[0]) - vis.yScale(d[1]);
            })
            .attr("width", vis.xScale.bandwidth());

            // Add Event Listeners to marks
            d3.selectAll('.rect')
                .on('click', function(event, e) {
                    const element = d3.select(this);
                    const markType = e["data"]["PROP_TYPE"];
                    const isActive = element.classed("selected");

                    d3.selectAll('.selected')
                        .classed('selected', false);

                    d3.selectAll(".rect")
                        .filter(d => d["data"]["PROP_TYPE"] === markType)
                        .classed("selected", !isActive);
                    
                    const countryData = !isActive ? vis.data.filter(d => d.PROP_TYPE === markType) : vis.data;
                    vis.dispatcher.call('filterPropertyType', event, countryData);
                })
                .on('mouseover', function(event, e) {
                    const markType = e["data"]["PROP_TYPE"];

                    d3.selectAll('.rect')
                        .filter(d => d["data"]["PROP_TYPE"] === markType)
                        .style('stroke-width', 5);
   
                    d3.selectAll(".points, .chart-line")
                        .filter(d => {return d["property_type"] === vis._convertPropertyNameClass(markType)})
                        .classed("hover", true);

                    const convictionType = e[1] === e['data']['Conviction'] ? 'Conviction' : 'Non Conviction';
                    const amount = convictionType === 'Conviction' ? e['data']['Conviction'] : e['data']['No_Conviction'];

                    d3.select('#tooltip')
                        .style('display', 'block')
                        .html(`
                            <div
                                <div class="tooltip-title"> ${convictionType}</div>
                                <div> Revenue ($ USD) : $ ${amount} </div>
                            </div>
                            `);
                    
                    
                })
                .on('mouseleave', function(event, e) {
                    const markType = e["data"]["PROP_TYPE"];

                    d3.selectAll('.rect')
                        .filter(d => d["data"]["PROP_TYPE"] === markType)
                        .style('stroke-width', null);

                    d3.selectAll(".points, .chart-line")
                        .filter(d => {
                            return d["property_type"] === vis._convertPropertyNameClass(markType)})
                        .classed("hover", false);
                    
                    d3.select('#tooltip').style('display', 'none');
                })
                .on('mousemove', function(event, e) {
                    d3.select('#tooltip')
                        .style('left', `${event.pageX + vis.config.tooltipPadding}px`)   
                        .style('top', `${event.pageY + vis.config.tooltipPadding}px`)
                });

        vis.xAxisG.call(vis.xAxis).style("font-size", "18px");

        vis.yAxisG.call(vis.yAxis).style("font-size", "12px");
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

    /**
     * Converts display property name to class property name
     */
    _convertPropertyNameClass(val) {
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
}
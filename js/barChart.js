class BarChart {
    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 600,
            containerHeight: _config.containerHeight || 450,
            margin: { top: 20, bottom: 20, right: 20, left: 50}
        };
        this.data = _data;
        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        vis.xScale = d3.scaleBand()
            .range([0, vis.width])
            .paddingInner(0.2)
            .paddingOuter(0.2);
            // .domain(['Vehicles','Others','Currency','Real Property']);

        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0]);

        // Initialize axes
        vis.xAxis = d3.axisBottom(vis.xScale);
        vis.yAxis = d3.axisLeft(vis.yScale).ticks(6);

        // Define size of SVG drawing area
        vis.svg = d3.select(this.config.parentElement).append('svg')
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

        vis.updateVis();

    }

    updateVis() {
        let vis = this;
        //d.YEAR >= 1986 && d.YEAR <= 1991

        vis.subgroups = ['Conviction','No Conviction',"Unknown"];
        vis.filteredData = vis.data.filter(d => d.REV > 0 && d.PROP_TYPE != NaN && d.REV != NaN);
        vis.finalData = d3.rollup(vis.filteredData, v => d3.sum(v, d=>d.REV), d=>d.PROP_TYPE, d=>d.CONV_TYPE);
        vis.data1 = d3.rollup(vis.filteredData, v => d3.sum(v, d=>d.REV), d=>d.PROP_TYPE);
        vis.data2 = Array.from(vis.data1, ([name, value])=> ({name, value}));
        console.log(vis.data2);

        for (const d in vis.data1){
            console.log(d);

        }

        let max = 0;
        vis.dataToUse = [];
        vis.realData = [];
        for (const data of vis.finalData){
            let prop_type = data[0];
            let mapd = data[1];
            let conv = 0;
            let no_conv = 0;
            let unknown = 0;
            for (const conv_type of mapd){
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


        vis.xValue = d => d.name;
        vis.yValue = d => d.value;
        vis.yScale.domain([0, max]);

        vis.xScale.domain(vis.data2.map(d=>d.name));
        // vis.xScale.domain(vis.filteredData.map(d => d.PROP_TYPE));

        vis.renderVis();

    }

    renderVis() {
        let vis = this;
        var colors = ['#e41a1c','#377eb8','#ffffff'];
        var groups = ['Vehicles','Others','Currency','Real Property'];
        var subgroups = ['Conviction','No_Conviction','Unknown'];
        vis.stackedData = d3.stack()
            .keys(subgroups)
            (vis.realData);
        console.log(vis.stackedData);


        let bars = vis.chart.selectAll('.bar')
            .data(vis.data2, d=>d.name)
            .join('rect')
            .attr('class', 'bar')
            .attr('x', d => vis.xScale(vis.xValue(d)))
            .attr('width', vis.xScale.bandwidth())
            .attr('height', d => vis.height - vis.yScale(vis.yValue(d)))
            .attr('y', d => vis.yScale(vis.yValue(d)))

        // let bars = vis.chart.selectAll('g')
        //     .data(vis.stackedData)
        //     .enter().append('g')
        //     .attr("class", "bars")
        //     .attr("fill", function(d, i) { return colors[i]; })
        //     .selectAll("rect")
        //     // enter a second time = loop subgroup per subgroup to add all rectangles
        //     .data(function(d) { return d; })
        //     .enter().append("rect")
        //     .attr("x", function(d) { return vis.xScale(d.data.group); })
        //     .attr("y", function(d) { return vis.yScale(d[1]); })
        //     .attr("height", function(d) { return vis.yScale(d[0]) - vis.yScale(d[1]); })
        //     .attr("width",vis.xScale.bandwidth());


        vis.xAxisG.call(vis.xAxis);

        vis.yAxisG.call(vis.yAxis);
    }
}
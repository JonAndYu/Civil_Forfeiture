class Slider {

    constructor(_config, _data, _dispatcher) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 600,
            containerHeight: _config.containerHeight || 60,
            margin: _config.margin || {top: 20, right: 20, bottom: 0, left: 20},
        }
        this.data = _data;
        this.initVis();
        this.dispatcher = _dispatcher;
    }

    initVis() {
        let vis = this;

        vis.range = [1986, 2019];
        vis.selected_range = [{ value: 1986 }, { value: 2019 }];

        // Calculate inner chart size. Margin specifies the space around the actual chart.
        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        // Define size of SVG drawing area
        vis.svg = d3.select(vis.config.parentElement).append('svg')
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);

        // create x scale
        vis.xScale = d3.scaleLinear()
            .domain(vis.range)  // data space
            .range([0, vis.width])
            .clamp(true);  // display space

        vis.sliderGroup = vis.svg.append('g').attr('transform', `translate(${vis.config.margin.left}, ${vis.config.margin.top})`)

        // labels
        vis.labelL = vis.sliderGroup.append('text')
            .attr('id', 'labelleft')
            .attr('x', 0)
            .attr('y', vis.height + 5)
            .text("1986");

        vis.labelR = vis.sliderGroup.append('text')
            .attr('id', 'labelright')
            .attr('x', vis.width)
            .attr('y', vis.height + 5)
            .text("2019");

        vis.sliderfunc = d3.sliderBottom(vis.xScale)
            .tickFormat(d3.format("d"))
            .default(vis.range)
            .on("onchange", function(d) {
                vis.selected_range[0].value = d[0];
                vis.selected_range[1].value = d[1];
                const yearRange = [Math.round(d[0]),Math.round(d[1])]
                vis.dispatcher.call('filterYear', event, yearRange);
            });

        vis.updateVis();

    }

    updateVis() {
        let vis = this;
        vis.renderVis();
    }

    renderVis() {
        let vis = this;

        vis.sliderSelection = vis.sliderGroup.selectAll(".slider")
            .data(vis.selected_range);

        vis.sliderSelection.enter()
            .append("g")
            .attr("class", "slider")
            .call(vis.sliderfunc);

        // add handles
        vis.sliderHandles = vis.sliderSelection.selectAll(".handle")
            .data(function(d) { return [d.value]; });

        vis.sliderHandles.enter()
            .append("circle")
            .attr("class", "handle")
            .attr("r", 9)
            .attr("cx", vis.sliderfunc)
            .attr("cy", 15);

        // add labels to the handle
        vis.sliderLabels = vis.sliderSelection.selectAll(".label")
            .data(function(d) { return [d.value]; });
        
        vis.sliderLabels.enter()
            .append("text")
            .attr("class", "label")
            .attr("x", vis.sliderfunc)
            .attr("y", 30)
            .attr("text-anchor", "middle")
            .text(function(d) { return d; });


        vis.sliderLabels.exit().remove();
    }

}
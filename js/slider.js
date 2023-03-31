class Slider {

    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 600,
            containerHeight: _config.containerHeight || 60,
            margin: _config.margin || {top: 0, right: 0, bottom: 0, left: 0},
            tooltipPadding: 10,
            legendBottom: 150,
            legendLeft: 150,
            legendRectHeight: 12,
            legendRectWidth: 150
        }
        this.data = _data;
        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.range = [1986, 2019]
        vis.starting_range = [1986, 2019]

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
            .range([0, vis.width]);  // display space

        vis.chart = vis.svg.append('g').attr('transform', `translate(${vis.config.margin.left}, ${vis.config.margin.top})`)

        // labels
        vis.labelL = vis.chart.append('text')
            .attr('id', 'labelleft')
            .attr('x', 0)
            .attr('y', vis.height + 5)

        vis.labelR = vis.chart.append('text')
            .attr('id', 'labelright')
            .attr('x', 0)
            .attr('y', vis.height + 5)

        // define brush
        vis.brush = d3.brushX()
            .extent([[0,0], [vis.width, vis.height]])
            .on('brush', function() {
                var s = d3.event.selection;
                // update and move labels
                vis.labelL.attr('x', s[0])
                    .text((x.invert(s[0]).toFixed(2)))
                vis.labelR.attr('x', s[1])
                    .text((x.invert(s[1]).toFixed(2)))
                // move brush handles
                vis.handle.attr("display", null).attr("transform", function(d, i) { return "translate(" + [ s[i], - vis.height / 4] + ")"; });
                // update view
                // if the view should only be updated after brushing is over,
                // move these two lines into the on('end') part below
                vis.svg.node().value = s.map(function(d) {var temp = x.invert(d); return +temp.toFixed(2)});
                vis.svg.node().dispatchEvent(new CustomEvent("input"));
            })

        // append brush to g
        vis.gBrush = vis.chart.append("g")
            .attr("class", "brush").call(vis.brush);


        // add brush handles (from https://bl.ocks.org/Fil/2d43867ba1f36a05459c7113c7f6f98a)
        vis.brushResizePath = function(d) {
            var e = +(d.type == "e"),
                x = e ? 1 : -1,
                y = vis.height / 2;
            return "M" + (.5 * x) + "," + y + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6) + "V" + (2 * y - 6) +
                "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y) + "Z" + "M" + (2.5 * x) + "," + (y + 8) + "V" + (2 * y - 8) +
                "M" + (4.5 * x) + "," + (y + 8) + "V" + (2 * y - 8);
        }

        vis.handle = vis.gBrush.selectAll(".handle--custom")
            .data([{type: "w"}, {type: "e"}])
            .enter().append("path")
            .attr("class", "handle--custom")
            .attr("stroke", "#000")
            .attr("fill", '#eee')
            .attr("cursor", "ew-resize")
            .attr("d", vis.brushResizePath);

        vis.updateVis();

    }

    updateVis() {
        let vis = this;
        vis.renderVis();
    }

    renderVis() {
        let vis = this;


        // override default behaviour - clicking outside of the selected area
        // will select a small piece there rather than deselecting everything
        // https://bl.ocks.org/mbostock/6498000
        vis.gBrush.selectAll(".overlay")
            .each(function(d) { d.type = "selection"; })
            .on("mousedown touchstart", vis.brushcentered())

        // // select entire range
        vis.gBrush.call(vis.brush)

    }
    brushcentered() {
        // let vis = this;
        // var dx = x(1) - x(0), // Use a fixed width when recentering.
        //     cx = d3.mouse(vis)[0],
        //     x0 = cx - dx / 2,
        //     x1 = cx + dx / 2;
        // d3.select(this.parentNode).call(vis.brush.move, x1 > vis.width ? [vis.width - dx, vis.width] : x0 < 0 ? [0, dx] : [x0, x1]);
    }

}
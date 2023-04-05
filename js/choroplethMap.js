// This is largely based on the choropleth example

class ChoroplethMap {

    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 600,
            containerHeight: _config.containerHeight || 450,
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

    /**
     * We initialize scales/axes and append static elements, such as axis titles.
     */
    initVis() {
        let vis = this;

        // Calculate inner chart size. Margin specifies the space around the actual chart.
        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        // Define size of SVG drawing area
        vis.svg = d3.select(vis.config.parentElement).append('svg')
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);

        // Append group element that will contain our actual chart
        // and position it according to the given margin config
        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        // Initialize projection and path generator
        vis.projection = d3.geoMercator();

        vis.geoPath = d3.geoPath().projection(vis.projection);

        vis.colorScale = d3.scaleLinear()
            .range(['#cfe2f2', '#0d306b'])
            .interpolate(d3.interpolateHcl);


        // Initialize gradient that we will later use for the legend
        vis.linearGradient = vis.svg.append('defs').append('linearGradient')
            .attr("id", "legend-gradient");

        // Append legend
        vis.legend = vis.chart.append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${vis.config.legendLeft},${vis.height - vis.config.legendBottom})`);

        vis.legendRect = vis.legend.append('rect')
            .attr('width', vis.config.legendRectWidth)
            .attr('height', vis.config.legendRectHeight);

        vis.legendTitle = vis.legend.append('text')
            .attr('class', 'legend-title')
            .attr('dy', '.35em')
            .attr('y', -10)
            .text('Number of Seizures')

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        const dataDensityExtent = d3.extent(vis.data.objects.states.geometries, d => d.properties.data_density);

        // Update color scale
        vis.colorScale.domain(dataDensityExtent);

        // Define begin and end of the color gradient (legend)
        vis.legendStops = [
            { color: '#cfe2f2', value: dataDensityExtent[0], offset: 0},
            { color: '#0d306b', value: dataDensityExtent[1], offset: 100},
        ];

        vis.renderVis();
    }


    renderVis() {
        let vis = this;

        // Convert compressed TopoJSON to GeoJSON format
        const states = topojson.feature(vis.data, vis.data.objects.states)

        // Defines the scale of the projection so that the geometry fits within the SVG area
        //vis.projection.fitSize([vis.width, vis.height], states);

        // TEMP Projection
        vis.projection
            .center([0, 0])
            .scale(400)
            .translate([1.5 * vis.width, vis.height]);

        // Append US map
        const statePath = vis.chart.selectAll('.state')
            .data(states.features)
            .join('path')
            .attr('class', 'state')
            .attr('d', vis.geoPath)
            .attr('name', d => d.properties.name)
            .attr('fill', d => {
                if (d.properties.data_density) {
                    return vis.colorScale(d.properties.data_density);
                } else {
                    return 'url(#lightstripe)';
                }
            });

        statePath
            .on('mousemove', (event,d) => {
                const dataDensity = d.properties.data_density ? `<strong>${d.properties.data_density}</strong> Seizures` : 'No data available';
                d3.select('#tooltip')
                    .style('display', 'block')
                    .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')
                    .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
                    .html(`
              <div class="tooltip-title">${d.properties.name}</div>
              <div>${dataDensity}</div>
            `);
            })
            .on('mouseleave', () => {
                d3.select('#tooltip').style('display', 'none');
            });

        // Add legend labels
        vis.legend.selectAll('.legend-label')
            .data(vis.legendStops)
            .join('text')
            .attr('class', 'legend-label')
            .attr('text-anchor', 'middle')
            .attr('dy', '.35em')
            .attr('y', 20)
            .attr('x', (d,index) => {
                return index == 0 ? 0 : vis.config.legendRectWidth;
            })
            .text(d => Math.round(d.value * 10 ) / 10);

        // Update gradient for legend
        vis.linearGradient.selectAll('stop')
            .data(vis.legendStops)
            .join('stop')
            .attr('offset', d => d.offset)
            .attr('stop-color', d => d.color);

        vis.legendRect.attr('fill', 'url(#legend-gradient)');
    }
}
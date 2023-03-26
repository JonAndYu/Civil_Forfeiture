class ViolinPlot {

    constructor(_config, _data) {
        // this.config = {
        //     parentElement: "_config.parentElement",
        //     margin: { top: 20, bottom: 20, right: 5, left: 5}
        // };
        console.log("Gets here1");
        this.config = {
            parentElement: "#violin-plot",
            margin: { top: 20, bottom: 20, right: 5, left: 5}
        };
        console.log("Gets here");
        // this.data = _data;
        // this.initVis();
    }

    initVis() {
        // let vis = this;
        // let svg = d3.select(this.config.parentElement);
        
        // vis._instantiateConfigDimensions(svg);
        // console.log(vis.config.width);
        // console.log(vis.config.height);

        // // Creating the Chart.
        // vis.chart = vis.svg.append('g')
        //     .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);
    }

    updateVis() {
        let vis = this;

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
        vis.config.width = width;
        vis.config.height = height;
    }
}
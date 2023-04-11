let violinPlot;
let choroplethMap;
let lineChart;
let slider;
/**
 * Load data from CSV file asynchronously and visualize it
 */

Promise.all([
    d3.json('data/states-10m.json'),
    d3.csv('data/processed_revenue.csv')
]).then(data => {
    const geoData = data[0];
    const revData = data[1];

    revData.forEach(d => {
        d.YEAR = +d.YEAR;
        d.REV = +d.REV;
    })

    geoData.objects.states.geometries.forEach(d => {
        d.properties.data_density = 0;
    });

    // Combine both datasets by adding the population density to the TopoJSON file
    geoData.objects.states.geometries.forEach(d => {
        for (let i = 0; i < revData.length; i++) {
            if (d.properties.name == revData[i].STATE) {
                d.properties.data_density += 1;
            }
        }
    });

    slider = new Slider({parentElement:'#slider'}, data[1]);

    choroplethMap = new ChoroplethMap({
        parentElement: '#map'
    }, data[0]);

    lineChart = new LineChart({parentElement:'#line-plot', legendElement: '#legend-contents'}, data[1]);
    barChart = new BarChart({parentElement:'#bar-chart'}, data[1]);


    d3.selectAll('.state').on('click', function() {

        let selectedCategory = d3.select(this).attr('name');

        // Filter data accordingly and update

         
        barChart.data = revData.filter(d => d.STATE === selectedCategory);
        lineChart.data = revData.filter(d => d.STATE === selectedCategory && d["YEAR"] >= 1986);

        barChart.updateVis();
        lineChart.updateVis();
    });

}).catch(error => console.error(error));
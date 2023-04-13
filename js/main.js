let barChart;
let choroplethMap;
let lineChart;
let slider;
const dispatcher = d3.dispatch('filterYear', 'filterCountry', 'filterPropertyType', 'hoverPropertyType');
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
    });

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

    slider = new Slider({parentElement:'#slider'}, data[1], dispatcher);

    choroplethMap = new ChoroplethMap({
        parentElement: '#map'
    }, data[0], dispatcher);

    lineChart = new LineChart({parentElement:'#line-plot', legendElement: '#legend-contents'}, data[1], dispatcher);
    barChart = new BarChart({parentElement:'#bar-chart', legendElement: '#bar-chart-legend-contents'}, data[1], dispatcher);

    let selectedCategory = "";
    let selectedRange = [1986, 2019];

    // This is an annoying bit of code duplication between the dispatcher,
    // but unifying these was dropped on me last minute
    d3.selectAll('.state').on('click', function() {
        if (selectedCategory == d3.select(this).attr('name')) {

            // Filter data accordingly and update
            selectedCategory = "";

            filteredData = revData.filter(d => d.YEAR >= selectedRange[0] && d.YEAR <= selectedRange[1]);

            barChart.data = filteredData;
            lineChart.data = filteredData;

            d3.select('#title').html(`<h1>Civil Asset Forfeiture</h1>`);
        }
        else {
            selectedCategory = d3.select(this).attr('name');

            filteredData = revData.filter(d => d.STATE === selectedCategory && d.YEAR >= selectedRange[0] && d.YEAR <= selectedRange[1]);
            // Filter data accordingly and update
            barChart.data = filteredData;
            lineChart.data = filteredData;

            d3.select('#title').html(`<h1>Civil Asset Forfeiture: ${selectedCategory}</h1>`);
        }
        barChart.updateVis();
        lineChart.updateVis();
    });

    dispatcher.on("filterYear", yearRange => {
        selectedRange = yearRange;

        if (selectedCategory === "") {
            barChart.data = revData.filter(d => d["YEAR"] >= yearRange[0] && d["YEAR"] <= yearRange[1]);
            lineChart.data = revData.filter(d => d["YEAR"] >= yearRange[0] && d["YEAR"] <= yearRange[1]);
        }
        else {
            barChart.data = revData.filter(d => d["YEAR"] >= yearRange[0] &&
                d["YEAR"] <= yearRange[1] &&
                d["STATE"] === selectedCategory);
            lineChart.data = revData.filter(d => d["YEAR"] >= yearRange[0] &&
                d["YEAR"] <= yearRange[1] &&
                d["STATE"] === selectedCategory);
        }
 
        barChart.updateVis();
        lineChart.updateVis();

        //Here we filter the number of seizures within the choropleth map by year range. It's very slow because
        //We have to recalculate the intersection between these two datasets.
        //choroplethMap.data = rangeOnGeoData(geoData, revData, yearRange);
        //choroplethMap.updateVis();
     });
    
    dispatcher.on("hoverPropertyType", markType => {
        console.log(markType);
        // Modify the markType

        // If this is true that means the dispatcher was called inside of lineChart, modify barchart
        // by hover
        if (Array.isArray(markType)) {
            
        } else { // Modify linechart

        }
    });
    
    dispatcher.on("filterPropertyType", countryData => {
        lineChart.data = countryData;

        lineChart.updateVis();
    });

}).catch(error => console.error(error));


// Also last minute addition to make the slider work
function rangeOnGeoData(geoData, revData, yearRange) {
    geoCopy = JSON.parse(JSON.stringify(geoData))

    geoCopy.objects.states.geometries.forEach(d => {
        d.properties.data_density = 0;
    });

    // Combine both datasets by adding the population density to the TopoJSON file
    geoCopy.objects.states.geometries.forEach(d => {
        for (let i = 0; i < revData.length; i++) {
            if (d.properties.name == revData[i].STATE && revData[i].YEAR >= yearRange[0] && revData[i].YEAR <= yearRange[1]) {
                d.properties.data_density += 1;
            }
        }
    });

    return geoCopy;
}


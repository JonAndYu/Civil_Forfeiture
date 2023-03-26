/**
 * Load data from CSV file asynchronously and visualize it
 */
d3.csv('data/processed_revenue.csv')
  .then(data => {
    data.forEach(d => {
      d.YEAR = +d.YEAR;
      d.REV = +d.REV;
		});

    console.log(data);
  })
  .catch(error => console.error(error));

Promise.all([
    d3.json('data/states-10m.json'),
    d3.csv('data/processed_revenue.csv')
]).then(data => {
    const geoData = data[0];
    const countryData = data[1];

    // Combine both datasets by adding the population density to the TopoJSON file
    geoData.objects.collection.geometries.forEach(d => {
        for (let i = 0; i < countryData.length; i++) {
            if (d.properties.name == countryData[i].region) {
                d.properties.pop_density = +countryData[i].pop_density;
            }
        }
    });

    const choroplethMap = new ChoroplethMap({
        parentElement: '#map'
    }, data[0]);
})
    .catch(error => console.error(error));

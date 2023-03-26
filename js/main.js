let violinPlot;
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
    violinPlot = new ViolinPlot({parentElement:'#violin-plot'}, data);
  })
  .catch(error => console.error(error));
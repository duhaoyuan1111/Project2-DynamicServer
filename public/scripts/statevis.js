anychart.onDocumentReady(() => {
    var coal_data = [];
    var natural_gas_data = [];
    var nuclear_data = [];
    var petroleum_data = [];
    var renewable_data = [];
    for (let i = 0; i <= (2017 - 1960); i++) {
        if (Array.isArray(window.coal_counts) && window.coal_counts.length > i) {
            coal_data.push([i + 1960, window.coal_counts[i]]);
        }
        else {
            coal_data.push([i + 1960, 1]);
        }
        if (Array.isArray(window.natural_gas_counts) && window.natural_gas_counts.length > i) {
            natural_gas_data.push([i + 1960, window.natural_gas_counts[i]]);
        }
        else {
            natural_gas_data.push([i + 1960, 1]);
        }
        if (Array.isArray(window.nuclear_counts) && window.nuclear_counts.length > i) {
            nuclear_data.push([i + 1960, window.nuclear_counts[i]]);
        }
        else {
            nuclear_data.push([i + 1960, 1]);
        }
        if (Array.isArray(window.petroleum_counts) && window.petroleum_counts.length > i) {
            petroleum_data.push([i + 1960, window.petroleum_counts[i]]);
        }
        else {
            petroleum_data.push([i + 1960, 1]);
        }
        if (Array.isArray(window.renewable_counts) && window.renewable_counts.length > i) {
            renewable_data.push([i + 1960, window.coal_counts[i]]);
        }
        else {
            renewable_data.push([i + 1960, 1]);
        }
    }

    // create a chart
    chart = anychart.area();
    chart.yScale().stackMode('percent');

    // set the chart title
    chart.title(window.state + ' Energy Consumption Type % by Year');

    // add the data
    var series_coal = chart.area(coal_data);
    var series_natural_gas = chart.area(natural_gas_data);
    var series_nuclear = chart.area(nuclear_data);
    var series_petroleum = chart.area(petroleum_data);
    var series_renewable = chart.area(renewable_data);
    series_coal.name("Coal");
    series_natural_gas.name("Natural Gas");
    series_nuclear.name("Nuclear");
    series_petroleum.name("Petroleum");
    series_renewable.name("Renewable");

    // enable legend
    chart.legend(true);
    // set legend position
    chart.legend().position('right');
    // set items layout
    chart.legend().itemsLayout('vertical');

    // display the chart in the container
    chart.container('snapshot');
    chart.draw();
});

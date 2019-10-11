anychart.onDocumentReady(() => {
    var i, j, key;
    var energy_data = {};

    for (i = 0; i < window.states. length; i++) {
        energy_data[window.states[i]] = [];
        for (j = 0; j <= (2017 - 1960); j++) {
            if (window.energy_counts && Array.isArray(window.energy_counts[window.states[i]]) && window.energy_counts[window.states[i]].length > j) {
                energy_data[window.states[i]].push([j + 1960, window.energy_counts[window.states[i]][j]]);
            }
            else {
                energy_data[window.states[i]].push([j + 1960, 1]);
            }
        }
    }

    // create a chart
    chart = anychart.line();

    // set the chart title
    chart.title(window.energy_type + ' Consumption for Each State by Year');

    // add the data
    var series;
    for (key in energy_data) {
        series = chart.line(energy_data[key]);
        series.name(key);
    }

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

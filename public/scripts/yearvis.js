anychart.onDocumentReady(() => {
    var data = [
        {x: 'Coal', value: window.coal_count || 1},
        {x: 'Natural Gas', value: window.natural_gas_count || 1},
        {x: 'Nuclear', value: window.nuclear_count || 1},
        {x: 'Petroleum', value: window.petroleum_count || 1},
        {x: 'Renewable', value: window.renewable_count || 1}
    ];

    var chart = anychart.pie();

    // set the chart title
    chart.title(window.year + ' US Energy Consumption by Type');

    // add the data
    chart.data(data);

    // set legend position
    chart.legend().position('right');
    // set items layout
    chart.legend().itemsLayout('vertical');

    // display the chart in the container
    chart.container('snapshot');
    chart.draw();
});

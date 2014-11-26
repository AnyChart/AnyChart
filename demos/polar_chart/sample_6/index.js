var chart;
anychart.onDocumentLoad(function() {
        var dataSet = anychart.data.set([
          [1, 26, 31],
          [2, 11, 2],
          [3, 22, 17],
          [4, 14, 21],
          [5, 8, 12],
          [6, 19, 29],
          [7, 21, 5],
          [8, 12, 14],
          [9, 15, 4],
          [10, 29, 2]
        ]);

        var data = dataSet.mapAs({x: [0], value: [1]});
        var data2 = dataSet.mapAs({x: [0], value: [2]});

        chart = anychart.polar()
            .container('container')
            .startAngle(0);

        chart.xScale().minimum(1).maximum(11).ticks().interval(1);
        chart.yScale().minimum(0).maximum(35).ticks().interval(5);

        chart.xAxis().labels().textFormatter(function() {
          return 'P' + this.value;
        }).fontWeight('bold');
        chart.yAxis().minorTicks().enabled(false);

        chart.title(null);

        chart.grid(0).oddFill('white').evenFill('white');
        chart.grid(1).oddFill(null).evenFill(null);

        var background = chart.background().enabled(true);
        background.fill(['rgb(255,255,255)', 'rgb(243,243,243)', 'rgb(255,255,255)'], 90);

        chart.palette(['2 rgb(29, 139, 209)', '2 rgb(241, 104, 60)']);

        var series1 = chart.line(data);
        series1.markers().size(3);
        var series2 = chart.line(data2);
        series2.markers().size(3);

        chart.draw();
});
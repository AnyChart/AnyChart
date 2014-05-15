var chart;

anychart.onDocumentReady(function() {
  //create DataSet on our data
  var dataSet = new anychart.data.Set([
    ['P1', 22, 23, 25, 33],
    ['P2', 34, 45, 56, 29],
    ['P3', 16, 46, 67, 56],
    ['P4', 32, 86, 32, 49],
    ['P4', 68, 45, 27, 77]
  ]);

  //map data for the first series, take value from first column of data set
  var seriesData_1 = dataSet.mapAs({x: [0], value: [1]});

  //map data for the second series, take value from second column of data set
  var seriesData_2 = dataSet.mapAs({x: [0], value: [2]});

  //map data for the third series, take value from third column of data set
  var seriesData_3 = dataSet.mapAs({x: [0], value: [3]});

  //map data for the fourth series, take value from fourth column of data set
  var seriesData_4 = dataSet.mapAs({x: [0], value: [4]});

  //create column chart
  chart = anychart.columnChart();

  //set container id for the chart
  chart.container('container');

  //set chart title text settings
  chart.title().text('Column Chart with Columns Overlap');

  //create first series with mapped data
  chart.column(seriesData_1).xPointPosition(0.3);

  //create second series with mapped data
  chart.column(seriesData_2).xPointPosition(0.4);

  //create third series with mapped data
  chart.column(seriesData_3).xPointPosition(0.5);

  //create fourth series with mapped data
  chart.column(seriesData_4).xPointPosition(0.6);

  //initiate chart drawing
  chart.draw();
});


// <?xml version="1.0" encoding="UTF-8"?>
//   <anychart>
//     <settings>
//       <animation enabled="True" />
//     </settings>
//     <charts>
//       <chart plot_type="CategorizedVertical">
//         <data_plot_settings default_series_type="Bar">
//           <bar_series point_padding="-0.5" group_padding="1">
//             <tooltip_settings enabled="True" />
//           </bar_series>
//         </data_plot_settings>
//         <chart_settings>
//           <title enabled="true">
//             <text>Multi-Series: Columns Overlap</text>
//           </title>
//         </chart_settings>
//         <data>
//           <series name="Series 1">
//             <point name="P1" y="22" />
//             <point name="P2" y="34" />
//             <point name="P3" y="16" />
//             <point name="P4" y="32" />
//             <point name="P5" y="68" />
//           </series>
//           <series name="Series 2">
//             <point name="P1" y="23" />
//             <point name="P2" y="45" />
//             <point name="P3" y="46" />
//             <point name="P4" y="86" />
//             <point name="P5" y="45" />
//           </series>
//           <series name="Series 3">
//             <point name="P1" y="25" />
//             <point name="P2" y="56" />
//             <point name="P3" y="67" />
//             <point name="P4" y="32" />
//             <point name="P5" y="27" />
//           </series>
//           <series name="Series 4">
//             <point name="P1" y="33" />
//             <point name="P2" y="29" />
//             <point name="P3" y="56" />
//             <point name="P4" y="49" />
//             <point name="P5" y="77" />
//           </series>
//         </data>
//       </chart>
//     </charts>
//   </anychart>

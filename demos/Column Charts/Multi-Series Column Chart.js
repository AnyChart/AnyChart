var chart;

anychart.onDocumentReady(function() {
  //create DataSet on our data
  var dataSet = new anychart.data.Set([
    ['P1', 128.14, 90.54, 43.76, 122.56],
    ['P2', 112.61, 104.19, 61.34, 187.12],
    ['P3', 163.21, 150.67, 34.17, 54.32],
    ['P4', 229.98, 120.43, 45.72, 33.08]
  ]);

  //map data for the first series, take value from first column of data set
  var seriesData_1 = dataSet.mapAs({x: [0], value: [1]});

  //map data for the second series, take value from second column of data set
  var seriesData_2 = dataSet.mapAs({x: [0], value: [2]});

  //map data for the third series, take value from third column of data set
  var seriesData_3 = dataSet.mapAs({x: [0], value: [3]});

  //map data for the fourth series, take value from fourth column of data set
  var seriesData_4 = dataSet.mapAs({x: [0], value: [4]});

  //create area chart
  chart = new anychart.cartesian.Chart(); //todo: replace it to anychart.columnChart

  //set container id for the chart
  chart.container('container');

  //set chart title text settings
  chart.title().text('Multi-Series Bar Chart');

  //create first series with mapped data
  chart.column(seriesData_1);

  //create second series with mapped data
  chart.column(seriesData_2);

  //create third series with mapped data
  chart.column(seriesData_3);

  //create fourth series with mapped data
  chart.column(seriesData_4);

  //initiate chart drawing
  chart.draw();
});


//<?xml version="1.0" encoding="UTF-8"?>
//  <anychart>
//    <settings>
//      <animation enabled="True" />
//    </settings>
//    <charts>
//      <chart plot_type="CategorizedHorizontal">
//        <data_plot_settings default_series_type="Bar">
//          <bar_series point_padding="0.2" group_padding="1">
//            <tooltip_settings enabled="True" />
//            <label_settings enabled="true">
//              <background enabled="false" />
//              <font color="DarkColor(%Color)" />
//              <format>{%YValue}{numDecimals:0}</format>
//            </label_settings>
//          </bar_series>
//        </data_plot_settings>
//        <chart_settings>
//          <title enabled="True">
//            <text>Multi-Series Bar Chart</text>
//          </title>
//          <axes>
//            <y_axis position="Opposite">
//              <labels>
//                <format>{%Value}{numDecimals:0}</format>
//              </labels>
//            </y_axis>
//          </axes>
//        </chart_settings>
//        <data>
//          <series name="Series 1">
//            <point name="P1" y="128.14" />
//            <point name="P2" y="112.61" />
//            <point name="P3" y="163.21" />
//            <point name="P4" y="229.98" />
//          </series>
//          <series name="Series 2">
//            <point name="P1" y="90.54" />
//            <point name="P2" y="104.19" />
//            <point name="P3" y="150.67" />
//            <point name="P4" y="120.43" />
//          </series>
//          <series name="Series 3">
//            <point name="P1" y="43.76" />
//            <point name="P2" y="61.34" />
//            <point name="P3" y="34.17" />
//            <point name="P4" y="45.72" />
//          </series>
//          <series name="Series 4">
//            <point name="P1" y="122.56" />
//            <point name="P2" y="187.12" />
//            <point name="P3" y="54.32" />
//            <point name="P4" y="33.08" />
//          </series>
//        </data>
//      </chart>
//    </charts>
//  </anychart>

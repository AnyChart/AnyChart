var chart;

anychart.onDocumentReady(function() {
  //create DataSet on our data
  var dataSet = new anychart.data.Set([
    ['P1', 97 , 43, 35, 23],
    ['P2', 84 , 55, 56, 49],
    ['P3', 36 , 99, 77, 76],
    ['P4', 42 , 86, 42, 49],
    ['P5', 128, 45, 67, 97]
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
  chart = new anychart.cartesian.Chart(); //todo: replace it to anychart.barChart

  //force chart to stack values by Y scale.
  chart.yScale().stackMode('value');

  //set container id for the chart
  chart.container('container');

  //set chart title text settings
  chart.title().text('Stacked Bar Chart');

  //create first series with mapped data
  chart.bar(seriesData_1);

  //create second series with mapped data
  chart.bar(seriesData_2);

  //create third series with mapped data
  chart.bar(seriesData_3);

  //create fourth series with mapped data
  chart.bar(seriesData_4);

  //initiate chart drawing
  chart.draw();
});


//<?xml version="1.0" encoding="UTF-8"?>
//  <anychart>
//    <settings>
//      <animation enabled="True" />
//    </settings>
//    <charts>
//      <chart plot_type="CategorizedVertical">
//        <data_plot_settings default_series_type="Bar">
//          <bar_series group_padding="0.3">
//            <label_settings enabled="true">
//              <background enabled="false" />
//              <position anchor="Center" valign="Center" halign="Center" />
//              <font color="White" bold="true">
//                <effects>
//                  <drop_shadow enabled="true" distance="1" angle="45" blur_x="1.5" blur_y="1.5" strength="2" opacity="0.5" />
//                </effects>
//              </font>
//              <format>{%Value}{numDecimals:0}</format>
//            </label_settings>
//            <tooltip_settings enabled="True">
//              <background>
//                <border color="DarkColor(%Color)" />
//              </background>
//              <format><![CDATA[Name: {%Name}
//Value: {%YValue}{numDecimals:0}
//Ratio: {%YPercentOfCategory}{numDecimals:1}%]]></format>
//            </tooltip_settings>
//          </bar_series>
//        </data_plot_settings>
//        <chart_settings>
//          <title enabled="true">
//            <text>Multi-Series: Stacked</text>
//          </title>
//          <axes>
//            <y_axis position="Left">
//              <scale mode="Stacked" />
//            </y_axis>
//          </axes>
//        </chart_settings>
//        <data>
//          <series name="Series 1">
//            <point name="P1" y="97 " />
//            <point name="P2" y="84 " />
//            <point name="P3" y="36 " />
//            <point name="P4" y="42 " />
//            <point name="P5" y="128" />
//          </series>
//          <series name="Series 2">
//            <point name="P1" y="43" />
//            <point name="P2" y="55" />
//            <point name="P3" y="99" />
//            <point name="P4" y="86" />
//            <point name="P5" y="45" />
//          </series>
//          <series name="Series 3">
//            <point name="P1" y="35" />
//            <point name="P2" y="56" />
//            <point name="P3" y="77" />
//            <point name="P4" y="42" />
//            <point name="P5" y="67" />
//          </series>
//          <series name="Series 4">
//            <point name="P1" y="23" />
//            <point name="P2" y="49" />
//            <point name="P3" y="76" />
//            <point name="P4" y="49" />
//            <point name="P5" y="97" />
//            <extra_labels>
//              <label enabled="true">
//                <format>{%CategoryYSum}{numDecimals:0}</format>
//                <font size="10" color="Black" />
//              </label>
//            </extra_labels>
//          </series>
//        </data>
//      </chart>
//    </charts>
//  </anychart>

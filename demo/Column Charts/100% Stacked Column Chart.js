var chart;

anychart.onDocumentReady(function() {
  //create DataSet on our data
  var dataSet = new anychart.data.Set([
    ['P1', 297, 243, 235, 223],
    ['P2', 184, 255, 156, 249],
    ['P3', 136, 199, 177, 276],
    ['P4', 142, 186, 242, 249],
    ['P5', 228, 145, 267, 297]
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

  //force chart to stack values by Y scale.
  chart.yScale().stackMode('percent');

  //set container id for the chart
  chart.container('container');

  //set chart title text settings
  chart.title().text('Stacked Column Chart');

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
//              <format>{%YPercentOfCategory}{numDecimals:1}%</format>
//            </label_settings>
//            <marker_settings enabled="true">
//              <marker type="None" size="10" />
//              <states>
//                <hover>
//                  <marker type="Circle" />
//                  <border thickness="2" />
//                </hover>
//                <pushed>
//                  <marker type="Circle" size="6" />
//                  <border thickness="2" />
//                </pushed>
//                <selected_normal>
//                  <marker type="Star5" size="16" />
//                  <border thickness="1" />
//                </selected_normal>
//                <selected_hover>
//                  <marker type="Star5" size="12" />
//                  <border thickness="1" />
//                </selected_hover>
//              </states>
//            </marker_settings>
//            <tooltip_settings enabled="True">
//              <position anchor="CenterTop" valign="Top" halign="Center" padding="10" />
//              <background>
//                <border thickness="2" type="Solid" color="DarkColor(%Color)" />
//              </background>
//              <format>
//              Name: {%Name}
//              Value: {%YValue}{numDecimals:2} - {%YPercentOfCategory}{numDecimals:1}%
//              </format>
//            </tooltip_settings>
//          </bar_series>
//        </data_plot_settings>
//        <chart_settings>
//          <title enabled="true">
//            <text>Multi-Series: 100% Stacked</text>
//          </title>
//          <axes>
//            <y_axis position="Left">
//              <scale mode="PercentStacked" maximum="100" major_interval="10" />
//              <labels show_last_label="false" align="Inside">
//                <format>{%Value}{numDecimals:0}%</format>
//              </labels>
//            </y_axis>
//          </axes>
//        </chart_settings>
//        <data>
//          <series name="Series 1">
//            <point name="P1" y="297" />
//            <point name="P2" y="184" />
//            <point name="P3" y="136" />
//            <point name="P4" y="142" />
//            <point name="P5" y="228" />
//          </series>
//          <series name="Series 2">
//            <point name="P1" y="243" />
//            <point name="P2" y="255" />
//            <point name="P3" y="199" />
//            <point name="P4" y="186" />
//            <point name="P5" y="145" />
//          </series>
//          <series name="Series 3">
//            <point name="P1" y="235" />
//            <point name="P2" y="156" />
//            <point name="P3" y="177" />
//            <point name="P4" y="242" />
//            <point name="P5" y="267" />
//          </series>
//          <series name="Series 4">
//            <point name="P1" y="223" />
//            <point name="P2" y="249" />
//            <point name="P3" y="276" />
//            <point name="P4" y="249" />
//            <point name="P5" y="297" />
//          </series>
//        </data>
//      </chart>
//    </charts>
//  </anychart>

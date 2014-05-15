var chart;

anychart.onDocumentReady(function() {
  //create DataSet on our data
  var dataSet = new anychart.data.Set([
    ['Traffic', 56, 0],
    ['Child Care', 44.8, 35],
    ['Transp.', 27.2, 61],
    ['Weather', 19.6, 77],
    ['Overslept', 11.4, 89],
    ['Emergency', 6.6, 100]
  ]);

  //map data for the first series, take value from first column of data set
  var seriesData_1 = dataSet.mapAs({x: [0], value: [1]});

  //map data for the second series, take value from second column of data set
  var seriesData_2 = dataSet.mapAs({x: [0], value: [2]});

  //create column chart
  chart = anychart.columnChart();

  //set container id for the chart
  chart.container('container');

  //set chart title text settings
  chart.title().text('Pareto Chart of Late Arrivals by Reported Cause');

  //create second series with mapped data
  chart.column(seriesData_1);

  //create scale for line series and extraYAxis
  //it force line series to not stuck with over series
  var scale = new anychart.scales.Linear();
  scale.minimum(0);
  scale.maximum(110);
  scale.ticks().interval(10);

  //create line series and set scale for it
  var lineSeries = chart.line(seriesData_2);
  lineSeries.yScale(scale);

  //create extra axis on the right side of chart
  //and set scale for it
  var extraYAxis = chart.yAxis();
  extraYAxis.orientation('right');
  extraYAxis.scale(scale);

  //setup axis to append '%' symbol to label values
  extraYAxis.labels().textFormatter(function(info) {
    return info.value + '%';
  });


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
//        <chart_settings>
//          <title enabled="true">
//            <text>Pareto Chart of Late Arrivals by Reported Cause</text>
//          </title>
//          <axes>
//            <y_axis position="Left">
//              <scale minimum="0" maximum="184.8" major_interval="16.8" minor_interval="8.4" />
//              <title enabled="false" />
//            </y_axis>
//            <x_axis>
//              <title enabled="false" />
//            </x_axis>
//            <extra>
//              <y_axis name="extra_y_axis_1" enabled="true">
//                <scale minimum="0" maximum="110" major_interval="10" show_last_label="false" />
//                <minor_grid enabled="false" />
//                <major_grid interlaced="false" />
//                <labels>
//                  <format>{%Value}{numDecimals:0}%</format>
//                </labels>
//                <title enabled="false" />
//              </y_axis>
//            </extra>
//          </axes>
//        </chart_settings>
//        <data_plot_settings>
//          <line_series>
//            <line_style>
//              <line thickness="3" />
//            </line_style>
//            <tooltip_settings enabled="true">
//              <format>{%Value}{numDecimals:0}%</format>
//            </tooltip_settings>
//          </line_series>
//          <bar_series>
//            <tooltip_settings enabled="True" />
//          </bar_series>
//        </data_plot_settings>
//        <data>
//          <series name="Series 1" type="Line" y_axis="extra_y_axis_1" color="#F1683C">
//            <point name="Traffic"   y="0" />
//            <point name="Child Car  y="35" />
//            <point name="Transp."   y="61" />
//            <point name="Weather"   y="77" />
//            <point name="Overslept" y="89" />
//            <point name="Emergency" y="100" />
//          </series>
//          <series name="Series 2" type="Bar" color="#1D8BD1">
//            <point name="Traffic"    y="56" />
//            <point name="Child Care" y="44.8" />
//            <point name="Transp."    y="27.2" />
//            <point name="Weather"    y="19.6" />
//            <point name="Overslept"  y="11.4" />
//            <point name="Emergency"  y="6.6" />
//          </series>
//        </data>
//      </chart>
//    </charts>
//  </anychart>


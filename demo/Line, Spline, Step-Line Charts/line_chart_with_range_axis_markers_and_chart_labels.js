var chart;

anychart.onDocumentReady(function() {
  //create DataSet on our data,also we can pud data directly to series
  var dataSet = new anychart.data.Set([
    ['1986', '41', '36', '31'],
    ['1987', '37', '34', '29'],
    ['1988', '48', '47', '40'],
    ['1989', '53', '52', '45'],
    ['1990', '49', '49', '42'],
    ['1991', '49', '47', '40'],
    ['1992', '41', '39', '33'],
    ['1993', '39', '36', '31'],
    ['1994', '34', '31', '27'],
    ['1995', '38', '35', '30'],
    ['1996', '29', '28', '24'],
    ['1997', '33', '32', '27'],
    ['1998', '31', '33', '28'],
    ['1999', '31', '32', '28'],
    ['2000', '37', '40', '34'],
    ['2001', '35', '40', '34'],
    ['2002', '43', '48', '41'],
    ['2003', '43', '47', '40'],
    ['2004', '51', '47', '40'],
    ['2005', '56', '50', '43'],
    ['2006', '62', '56', '48']
  ]);

  //map data for the first series,take value from first column of data set
  var seriesData_1 = dataSet.mapAs({x: [0], value: [1]});

  //map data for the second series,take value from second column of data set
  var seriesData_2 = dataSet.mapAs({x: [0], value: [2]});

  //map data for the third series, take value from third column of data set
  var seriesData_3 = dataSet.mapAs({x: [0], value: [3]});

  //create line chart
  chart = new anychart.cartesian.Chart(); //todo: replace it to anychart.lineChart

  //set container for chart
  chart.container('container');

  //set chart title text settings
  chart.title().text('Debt-To-Income Ratios 1986-2006');

  //create liner series
  chart.line(seriesData_1);
  chart.line(seriesData_2);
  chart.line(seriesData_3);

  //create range axes markers
  chart.rangeMarker().from(12.5).to(28).fill('#D9CDFF 0.7');
  chart.rangeMarker().from(28).to(38).fill('#CBFFCF 0.7');
  chart.rangeMarker().from(38).to(48).fill('#FFFFCD 0.7');
  chart.rangeMarker().from(48).to(75).fill('#FFCCCB 0.7');

  //change yAxis title text settings
  chart.yAxis().title().text('Debt-To-Income Ratios');

  //initiate chart drawing
  chart.draw();
});


//<?xml version="1.0" encoding="UTF-8"?>
//<anychart>
//  <settings>
//    <animation enabled="True" />
//  </settings>
//  <charts>
//    <chart plot_type="CategorizedVertical">
//      <data_plot_settings default_series_type="Line">
//        <line_series>
//          <marker_settings>
//            <marker type="None" />
//            <states>
//              <hover>
//                <marker type="Diamond" />
//              </hover>
//            </states>
//          </marker_settings>
//          <tooltip_settings enabled="True">
//            <format>
//Year {%Name}{enabled:false}
//{%SeriesName} - {%Value}{numDecimals:0}%
//</format>
//          </tooltip_settings>
//          <effects enabled="True">
//            <drop_shadow enabled="False" />
//            <bevel enabled="true" distance="1" blur_x="2" blur_y="2" />
//          </effects>
//          <line_style>
//            <line thickness="3" />
//          </line_style>
//        </line_series>
//      </data_plot_settings>
//      <chart_settings>
//        <title enabled="true">
//          <text>Debt-To-Income Ratios 1986-2006</text>
//        </title>
//        <axes>
//          <y_axis>
//            <scale minimum="20" maximum="65" major_interval="5" />
//            <labels>
//              <format>{%Value}{numDecimals:0}%</format>
//            </labels>
//            <title>
//              <text>Debt-To-Income Ratio</text>
//            </title>
//            <axis_markers>
//              <ranges>
//                <range minimum="20" maximum="28">
//                  <fill color="#D9CDFF" opacity="0.7" />
//                  <minimum_line color="#AEA4CC" opacity="1" />
//                  <maximum_line color="#AEA4CC" opacity="1" />
//                  <label enabled="True" position="Near">
//                    <format>Below 28% - Buy! Buy! Buy!</format>
//                    <font bold="True" color="#393939" />
//                  </label>
//                </range>
//                <range minimum="28" maximum="38">
//                  <fill color="#CBFFCF" opacity="0.7" />
//                  <minimum_line color="#96BC99" opacity="1" />
//                  <maximum_line color="#96BC99" opacity="1" />
//                  <label enabled="True" position="Far" multi_line_align="Center">
//                    <font bold="true" color="#393939" />
//                    <format>
//28%-38%
//Marginally affordable with
//fixed-rate mortgages.
//</format>
//                  </label>
//                </range>
//                <range minimum="38" maximum="48">
//                  <fill color="#FFFFCD" opacity="0.7" />
//                  <minimum_line color="#CCCCA4" opacity="1" />
//                  <maximum_line color="#CCCCA4" opacity="1" />
//                  <label enabled="True" position="Center" multi_line_align="Center">
//                    <font bold="true" color="#393939" />
//                    <format>
//38%-48%
//Not affordable with fixed.
//Interest-only becomes common.
//</format>
//                  </label>
//                </range>
//                <range minimum="48" maximum="65">
//                  <fill color="#FFCCCB" opacity="0.7" />
//                  <minimum_line color="#C69E9E" opacity="1" />
//                  <maximum_line color="#C69E9E" opacity="1" />
//                  <label enabled="True" position="Center" multi_line_align="Center">
//                    <font bold="true" color="#393939" />
//                    <format>
//48% or greater
//Not affordable with fixed or interest only.
//Negative amortization only option.
//</format>
//                  </label>
//                </range>
//              </ranges>
//            </axis_markers>
//          </y_axis>
//          <x_axis tickmarks_placement="Center">
//            <title enabled="False" />
//          </x_axis>
//    </chart>
//  </charts>
//</anychart>
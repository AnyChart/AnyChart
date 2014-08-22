anychart.onDocumentReady(function() {
  var data = {
    '2000': [
      ['Jan', 31128, 25165],
      ['Feb', 39675, 23211],
      ['Mar', 41168, 23480],
      ['Apr', 39487, 16245],
      ['May', 28261, 21765],
      ['Jun', 32458, 28342],
      ['Jul', 39987, 31876],
      ['Aug', 45291, 33745],
      ['Sep', 51376, 31765],
      ['Oct', 48754, 29876],
      ['Nov', 51178, 26195],
      ['Dec', 78543, 37876]
    ], '2001': [
      ['Jan', 37328, 40765],
      ['Feb', 52875, 30911],
      ['Mar', 51268, 42080],
      ['Apr', 46487, 28645],
      ['May', 34461, 27965],
      ['Jun', 41758, 42342],
      ['Jul', 59987, 51276],
      ['Aug', 70191, 28345],
      ['Sep', 40476, 36465],
      ['Oct', 68154, 41876],
      ['Nov', 83778, 33995],
      ['Dec', 68643, 27976]
    ], '2002': [
      ['Jan', 48228, 9165],
      ['Feb', 39775, 13511],
      ['Mar', 30568, 8980],
      ['Apr', 32787, 18245],
      ['May', 35561, 11965],
      ['Jun', 45258, 13642],
      ['Jul', 23687, 14676],
      ['Aug', 26391, 15645],
      ['Sep', 28176, 10165],
      ['Oct', 25454, 17276],
      ['Nov', 29278, 17395],
      ['Dec', 60343, 10676]
    ], '2003': [
      ['Jan', 23528, 19465],
      ['Feb', 30175, 18111],
      ['Mar', 36668, 17780],
      ['Apr', 35487, 16245],
      ['May', 21861, 21765],
      ['Jun', 40458, 19442],
      ['Jul', 55987, 16576],
      ['Aug', 40191, 19745],
      ['Sep', 37376, 14565],
      ['Oct', 39254, 23476],
      ['Nov', 45478, 18195],
      ['Dec', 61843, 17576]
    ], '2004': [
      ['Jan', 42628, 20265],
      ['Feb', 53075, 12811],
      ['Mar', 53168, 13080],
      ['Apr', 47187, 11345],
      ['May', 56261, 27765],
      ['Jun', 49058, 44742],
      ['Jul', 61587, 16576],
      ['Aug', 75291, 19545],
      ['Sep', 80176, 20765],
      ['Oct', 78754, 22176],
      ['Nov', 59178, 30595],
      ['Dec', 49743, 49876]
    ], '2005': [
      ['Jan', 69928, 20365],
      ['Feb', 54875, 18011],
      ['Mar', 43568, 16580],
      ['Apr', 33987, 9745],
      ['May', 14961, 12265],
      ['Jun', 22758, 16342],
      ['Jul', 23587, 21476],
      ['Aug', 31391, 23345],
      ['Sep', 22276, 22265],
      ['Oct', 33554, 14676],
      ['Nov', 40878, 15395],
      ['Dec', 47043, 26176]
    ], '2006': [
      ['Jan', 41628, 12365],
      ['Feb', 63675, 10411],
      ['Mar', 59668, 7480],
      ['Apr', 53487, 9245],
      ['May', 38761, 8365],
      ['Jun', 26458, 2642],
      ['Jul', 32487, 10276],
      ['Aug', 22291, 16845],
      ['Sep', 32876, 14265],
      ['Oct', 54254, 22876],
      ['Nov', 65178, 20095],
      ['Dec', 55043, 16876]
    ], '2007': [
      ['Jan', 48128, 7165],
      ['Feb', 17975, 7211],
      ['Mar', 10468, 6680],
      ['Apr', 10087, 4445],
      ['May', 17361, 6065],
      ['Jun', 24758, 12642],
      ['Jul', 14987, 12376],
      ['Aug', 16491, 9445],
      ['Sep', 16176, 9065],
      ['Oct', 18054, 10076],
      ['Nov', 14078, 14995],
      ['Dec', 8843, 14576]
    ]
  };

  var totalDataMap = {
    '2000': {x: '2000', value: summ(data['2000'])},
    '2001': {x: '2001', value: summ(data['2001'])},
    '2002': {x: '2002', value: summ(data['2002'])},
    '2003': {x: '2003', value: summ(data['2003'])},
    '2004': {x: '2004', value: summ(data['2004'])},
    '2005': {x: '2005', value: summ(data['2005'])},
    '2006': {x: '2006', value: summ(data['2006'])},
    '2007': {x: '2007', value: summ(data['2007'])}
  };

  var totalDataArray = getValues(totalDataMap);
  var selectedX = null;

  stage = acgraph.create('container');

  var totalChart = anychart.columnChart();
  totalChart.title().text('ACME Corp. Sales Dashboard');
  totalChart.container(stage);
  totalChart.bounds(0, 0, '100%', '50%');
  totalChart.draw();

  var totalSeries = totalChart.column(totalDataArray);
  totalSeries.listen('pointClick', function(e) {
    drillDown(e.iterator.get('x'));
  });

  var detailSeries_1 = null;
  var detailSeries_2 = null;
  var detailChart = anychart.columnChart();
  detailChart.title().align('left');
  detailChart.yScale().stackMode('value');
  detailChart.container(stage);
  detailChart.bounds(0, '50%', '100%', '50%');

  drillDown('2007');

  detailChart.draw();


  function drillDown(x) {
    var selectedData;

    if (selectedX) {
      selectedData = totalDataMap[selectedX];
      selectedData['marker'] = null;
      selectedData['hatchFill'] = null;
    }

    selectedX = x;

    selectedData = totalDataMap[selectedX];
    selectedData['marker'] = {enabled: true, type: 'star5', fill: 'red'};

    var detailData = data[selectedX];
    var dataSet = anychart.data.set(detailData);
    var data_1 = dataSet.mapAs({x: [0], value: [1]});
    var data_2 = dataSet.mapAs({x: [0], value: [2]});


    if (!detailSeries_1) detailSeries_1 = detailChart.column(data_1);
    else detailSeries_1.data(data_1);

    if (!detailSeries_2) detailSeries_2 = detailChart.column(data_2);
    else detailSeries_2.data(data_2);



    totalSeries.data(totalDataArray);
  }

  function summ(array) {
    var result = 0;
    for (var i = 0, count = array.length; i < count; i++) {
      var item = array[i];
      result += item[1] + item[2];
    }
    return result;
  }

  function getValues(obj) {
    var res = [];
    var i = 0;
    for (var key in obj) {
      res[i++] = obj[key];
    }
    return res;
  }
});



//<?xml version="1.0" encoding="UTF-8"?>
//  <anychart>
//    <dashboard>
//      <view type="Dashboard">
//        <title padding="0">
//          <text>ACME Corp. Sales Dashboard</text>
//        </title>
//        <background>
//          <inside_margin all="3" top="10" />
//        </background>
//        <vbox width="100%" height="100%">
//          <view name="yearsView" type="Chart" source="mainData" width="100%" height="45%">
//            <margin top="0" />
//          </view>
//          <view name="yearDetailsView" type="Chart" source="yearDetails2006" width="100%" height="55%" />
//        </vbox>
//      </view>
//    </dashboard>
//    <templates>
//      <template name="yearDetails">
//        <chart>
//          <chart_settings>
//            <title align="Left" align_by="DataPlot">
//              <text>Default Text</text>
//              <font bold="True" />
//            </title>
//            <axes>
//              <x_axis>
//                <title enabled="false" />
//                <labels>
//                  <format>{%Value}{enabled:false}</format>
//                </labels>
//              </x_axis>
//              <y_axis>
//                <scale mode="Stacked" />
//                <labels>
//                  <format>
//                  ${%Value}{scale:(1000)|( k)}
//                  </format>
//                </labels>
//                <minor_grid enabled="false" />
//                <minor_tickmark enabled="false" />
//                <title enabled="False" />
//              </y_axis>
//            </axes>
//            <legend enabled="true" position="Bottom" align="Center">
//              <title enabled="false" />
//              <rows_separator enabled="false" />
//              <columns_separator enabled="false" />
//              <format>{%Icon} - {%Name} (${%Value}{scale:(1000)|( k),numDecimals:2})</format>
//            </legend>
//            <chart_background>
//              <border type="Solid" color="#CCCCCC" thickness="1" />
//              <corners type="Square" />
//              <effects enabled="false" />
//            </chart_background>
//          </chart_settings>
//          <data_plot_settings ignore_missing="False">
//            <interactivity selectable="False" />
//            <bar_series group_padding="0.3">
//              <tooltip_settings enabled="True">
//                <format>
//{%Name} - {%SeriesName}
//                Revenue: ${%Value}{scale:(1000)|( k),numDecimals:2}
//                Ratio: {%YPercentOfCategory}{numDecimals:2}%
//                Total: ${%CategoryYSum}{scale:(1000)|( k),numDecimals:2}
//                </format>
//                <font bold="false" />
//              </tooltip_settings>
//            </bar_series>
//          </data_plot_settings>
//        </chart>
//      </template>
//    </templates>
//    <charts>
//      <chart name="mainData">
//        <chart_settings>
//          <title align="Left" align_by="DataPlot">
//            <text>Select a Column to drill-down</text>
//            <font bold="True" />
//          </title>
//          <axes>
//            <x_axis>
//              <labels>
//                <format>{%Value}{enabled:false}</format>
//              </labels>
//              <title enabled="False" />
//            </x_axis>
//            <y_axis>
//              <title enabled="false" />
//              <labels>
//                <format>${%Value}{numDecimals:0,scale:(1000)|( k)}</format>
//              </labels>
//              <minor_grid enabled="false" />
//              <minor_tickmark enabled="False" />
//            </y_axis>
//          </axes>
//          <chart_background>
//            <border type="Solid" color="#CCCCCC" thickness="1" />
//            <corners type="Square" />
//            <effects enabled="false" />
//          </chart_background>
//        </chart_settings>
//        <data_plot_settings>
//          <bar_series group_padding="0.3">
//            <marker_settings enabled="true" color="Gold">
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
//            <tooltip_settings enabled="true">
//              <format>
//{%Name} - ${%Value}{numDecimals:0,scale:(1000)|( k),numDecimals:2}
//              </format>
//              <position anchor="CenterTop" padding="10" />
//              <background>
//                <border color="DarkColor(Gold)" thickness="1" />
//              </background>
//            </tooltip_settings>
//          </bar_series>
//        </data_plot_settings>
//        <data>
//          <series>
//            <point name="2000" y="856859">
//              <actions>
//                <action type="UpdateView" view="yearDetailsView" source_mode="InternalData" source="yearDetails2000" />
//              </actions>
//            </point>
//            <point name="2001" y="1088047">
//              <actions>
//                <action type="UpdateView" view="yearDetailsView" source_mode="InternalData" source="yearDetails2001" />
//              </actions>
//            </point>
//            <point name="2002" y="586837">
//              <actions>
//                <action type="UpdateView" view="yearDetailsView" source_mode="InternalData" source="yearDetails2002" />
//              </actions>
//            </point>
//            <point name="2003" y="691257">
//              <actions>
//                <action type="UpdateView" view="yearDetailsView" source_mode="InternalData" source="yearDetails2003" />
//              </actions>
//            </point>
//            <point name="2004" y="995656">
//              <actions>
//                <action type="UpdateView" view="yearDetailsView" source_mode="InternalData" source="yearDetails2004" />
//              </actions>
//            </point>
//            <point name="2005" y="655439">
//              <actions>
//                <action type="UpdateView" view="yearDetailsView" source_mode="InternalData" source="yearDetails2005" />
//              </actions>
//            </point>
//            <point name="2006" y="697548" selected="True">
//              <actions>
//                <action type="UpdateView" view="yearDetailsView" source_mode="InternalData" source="yearDetails2006" />
//              </actions>
//            </point>
//            <point name="2007" y="332151">
//              <actions>
//                <action type="UpdateView" view="yearDetailsView" source_mode="InternalData" source="yearDetails2007" />
//              </actions>
//            </point>
//          </series>
//        </data>
//      </chart>
//    </charts>
//  </anychart>
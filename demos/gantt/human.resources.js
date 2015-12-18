var chart;

anychart.onDocumentReady(function () {
  // create data tree on our data
  var treeData = anychart.data.tree(getData(), anychart.enums.TreeFillingMethod.AS_TABLE);

  // create resource gantt chart
  chart = anychart.ganttResource();

  // set container id for the chart
  chart.container('container');

  // set data for the chart
  chart.data(treeData);

  //set DataGrid and TimeLine visual settings
  chart.dataGrid().rowOddFill('#fff');
  chart.dataGrid().rowEvenFill('#fff');
  chart.getTimeline().rowOddFill('#fff');
  chart.getTimeline().rowEvenFill('#fff');

  chart.rowSelectedFill('#D4DFE8');
  chart.rowHoverFill('#EAEFF3');

  // set start splitter position settings
  chart.splitterPosition(150);

  // get chart data grid link to set column settings
  var dataGrid = chart.dataGrid();

  // set first column settings
  var firstColumn = dataGrid.column(0);
  firstColumn.title('#');
  firstColumn.width(30);
  firstColumn.cellTextSettings().hAlign('center');

  // set second column settings
  var secondColumn = dataGrid.column(1);
  secondColumn.title('Person');
  secondColumn.width(120);
  secondColumn.cellTextSettings().hAlign('left');
  secondColumn.textFormatter(function (item) {
    return item.get('name');
  });

  // initiate chart drawing
  chart.draw();

  // zoom chart to specified date
  chart.zoomTo(1171036800000, 1176908400000);
});

function getData() {
  // colors
  var moccasin_border = '#111';
  var moccasin_bottom = '#CFC0A9';
  var moccasin_middle = '#E6D5BC';
  var moccasin_top = '#E8D9C3';

  var rosybrown_border = '#111';
  var rosybrown_bottom = '#AFA4A4';
  var rosybrown_middle = '#C2B6B6';
  var rosybrown_top = '#C8BDBD';

  var brown_border = '#111';
  var brown_bottom = '#796868';
  var brown_middle = '#867474';
  var brown_top = '#928282';

  return [
    {
      "id": "1",
      "name": "Alex Exler",
      "periods": [
        {"id": "1_1", "start": '1171468800000', "end": 1171987200000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "1_2", "start": 1174921200000, "end": 1175612400000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "1_3", "start": 1177599600000, "end": 1178550000000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "1_4", "start": 1182092400000, "end": 1182697200000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "1_5", "start": 1183647600000, "end": 1183906800000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "1_6", "start": 1186412400000, "end": 1187708400000, "stroke": rosybrown_border, "fill": {"angle": 90, "keys": [{"color": rosybrown_bottom, "position": 0}, {"color": rosybrown_middle, "position": 0.38}, {"color": rosybrown_top, "position": 1}]}},
        {"id": "1_7", "start": 1190646000000, "end": 1191337200000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "1_8", "start": 1193760000000, "end": 1194192000000, "stroke": brown_border, "fill": {"angle": 90, "keys": [{"color": brown_bottom, "position": 0}, {"color": brown_middle, "position": 0.38}, {"color": brown_top, "position": 1}]}},
        {"id": "1_9", "start": 1196870400000, "end": 1197302400000, "stroke": rosybrown_border, "fill": {"angle": 90, "keys": [{"color": rosybrown_bottom, "position": 0}, {"color": rosybrown_middle, "position": 0.38}, {"color": rosybrown_top, "position": 1}]}},
        {"id": "1_10", "start": 1201017600000, "end": 1201449600000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "1_11", "start": 1207148400000, "end": 1207666800000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "1_12", "start": 1209913200000, "end": 1210518000000, "stroke": brown_border, "fill": {"angle": 90, "keys": [{"color": brown_bottom, "position": 0}, {"color": brown_middle, "position": 0.38}, {"color": brown_top, "position": 1}]}},
        {"id": "1_13", "start": 1213542000000, "end": 1213801200000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "1_14", "start": 1214838000000, "end": 1215356400000, "stroke": brown_border, "fill": {"angle": 90, "keys": [{"color": brown_bottom, "position": 0}, {"color": brown_middle, "position": 0.38}, {"color": brown_top, "position": 1}]}},
        {"id": "1_15", "start": 1216566000000, "end": 1216911600000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "1_16", "start": 1218380400000, "end": 1219330800000, "stroke": brown_border, "fill": {"angle": 90, "keys": [{"color": brown_bottom, "position": 0}, {"color": brown_middle, "position": 0.38}, {"color": brown_top, "position": 1}]}},
        {"id": "1_17", "start": 1222182000000, "end": 1222614000000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "1_18", "start": 1225728000000, "end": 1226851200000, "stroke": rosybrown_border, "fill": {"angle": 90, "keys": [{"color": rosybrown_bottom, "position": 0}, {"color": rosybrown_middle, "position": 0.38}, {"color": rosybrown_top, "position": 1}]}},
        {"id": "1_19", "start": 1229356800000, "end": 1229961600000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}}]
    },
    {
      "id": "2",
      "name": "Philip Kineyko",
      "periods": [
        {"id": "2_1", "start": 1173024000000, "end": 1173715200000, "stroke": rosybrown_border, "fill": {"angle": 90, "keys": [{"color": rosybrown_bottom, "position": 0}, {"color": rosybrown_middle, "position": 0.38}, {"color": rosybrown_top, "position": 1}]}},
        {"id": "2_2", "start": 1173888000000, "end": 1174406400000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "2_3", "start": 1176994800000, "end": 1177945200000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "2_4", "start": 1180364400000, "end": 1180882800000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "2_5", "start": 1182956400000, "end": 1183647600000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}}]
    },
    {
      "id": "3",
      "name": "Luke Liakos",
      "periods": [
        {"id": "3_1", "start": 1169740800000, "end": 1170172800000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "3_2", "start": 1171987200000, "end": 1172505600000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "3_3", "start": 1175439600000, "end": 1176217200000, "stroke": rosybrown_border, "fill": {"angle": 90, "keys": [{"color": rosybrown_bottom, "position": 0}, {"color": rosybrown_middle, "position": 0.38}, {"color": rosybrown_top, "position": 1}]}},
        {"id": "3_4", "start": 1176908400000, "end": 1178463600000, "stroke": rosybrown_border, "fill": {"angle": 90, "keys": [{"color": rosybrown_bottom, "position": 0}, {"color": rosybrown_middle, "position": 0.38}, {"color": rosybrown_top, "position": 1}]}},
        {"id": "3_5", "start": 1180364400000, "end": 1180537200000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "3_6", "start": 1184684400000, "end": 1185721200000, "stroke": rosybrown_border, "fill": {"angle": 90, "keys": [{"color": rosybrown_bottom, "position": 0}, {"color": rosybrown_middle, "position": 0.38}, {"color": rosybrown_top, "position": 1}]}},
        {"id": "3_7", "start": 1187535600000, "end": 1188226800000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "3_8", "start": 1189350000000, "end": 1190041200000, "stroke": brown_border, "fill": {"angle": 90, "keys": [{"color": brown_bottom, "position": 0}, {"color": brown_middle, "position": 0.38}, {"color": brown_top, "position": 1}]}},
        {"id": "3_9", "start": 1190559600000, "end": 1191250800000, "stroke": rosybrown_border, "fill": {"angle": 90, "keys": [{"color": rosybrown_bottom, "position": 0}, {"color": rosybrown_middle, "position": 0.38}, {"color": rosybrown_top, "position": 1}]}},
        {"id": "3_10", "start": 1193065200000, "end": 1193846400000, "stroke": brown_border, "fill": {"angle": 90, "keys": [{"color": brown_bottom, "position": 0}, {"color": brown_middle, "position": 0.38}, {"color": brown_top, "position": 1}]}},
        {"id": "3_11", "start": 1197561600000, "end": 1197907200000, "stroke": brown_border, "fill": {"angle": 90, "keys": [{"color": brown_bottom, "position": 0}, {"color": brown_middle, "position": 0.38}, {"color": brown_top, "position": 1}]}},
        {"id": "3_12", "start": 1199376000000, "end": 1200240000000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "3_13", "start": 1202140800000, "end": 1202745600000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "3_14", "start": 1207580400000, "end": 1208098800000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "3_15", "start": 1211900400000, "end": 1212418800000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "3_16", "start": 1215702000000, "end": 1215961200000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "3_17", "start": 1218985200000, "end": 1219158000000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}}]
    },
    {
      "id": "4",
      "name": "Judy Penfold",
      "periods": [
        {"id": "4_1", "start": 1171814400000, "end": 1172419200000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "4_2", "start": 1173628800000, "end": 1174320000000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "4_3", "start": 1177945200000, "end": 1178463600000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "4_4", "start": 1181228400000, "end": 1181833200000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "4_5", "start": 1185807600000, "end": 1186326000000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "4_6", "start": 1190214000000, "end": 1190818800000, "stroke": brown_border, "fill": {"angle": 90, "keys": [{"color": brown_bottom, "position": 0}, {"color": brown_middle, "position": 0.38}, {"color": brown_top, "position": 1}]}}]
    },
    {
      "id": "5",
      "name": "Patricia Darmon",
      "periods": [
        {"id": "5_1", "start": 1171296000000, "end": 1171382400000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "5_2", "start": 1174233600000, "end": 1174579200000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "5_3", "start": 1176303600000, "end": 1176822000000, "stroke": rosybrown_border, "fill": {"angle": 90, "keys": [{"color": rosybrown_bottom, "position": 0}, {"color": rosybrown_middle, "position": 0.38}, {"color": rosybrown_top, "position": 1}]}},
        {"id": "5_4", "start": 1177858800000, "end": 1178031600000, "stroke": brown_border, "fill": {"angle": 90, "keys": [{"color": brown_bottom, "position": 0}, {"color": brown_middle, "position": 0.38}, {"color": brown_top, "position": 1}]}},
        {"id": "5_5", "start": 1181574000000, "end": 1182265200000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "5_6", "start": 1185462000000, "end": 1186066800000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "5_7", "start": 1190127600000, "end": 1190905200000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "5_8", "start": 1194278400000, "end": 1195142400000, "stroke": brown_border, "fill": {"angle": 90, "keys": [{"color": brown_bottom, "position": 0}, {"color": brown_middle, "position": 0.38}, {"color": brown_top, "position": 1}]}},
        {"id": "5_9", "start": 1196265600000, "end": 1196611200000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "5_10", "start": 1197388800000, "end": 1197561600000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "5_11", "start": 1200844800000, "end": 1201017600000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "5_12", "start": 1202313600000, "end": 1203004800000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "5_13", "start": 1205251200000, "end": 1205769600000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "5_14", "start": 1207494000000, "end": 1208185200000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "5_15", "start": 1212678000000, "end": 1213282800000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "5_16", "start": 1215442800000, "end": 1216220400000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "5_17", "start": 1216566000000, "end": 1217170800000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "5_18", "start": 1220799600000, "end": 1221404400000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "5_19", "start": 1223823600000, "end": 1223996400000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "5_20", "start": 1227801600000, "end": 1228752000000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}}]
    },
    {
      "id": "6",
      "name": "Jong Park",
      "periods": [
        {"id": "6_1", "start": 1171814400000, "end": 1172505600000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "6_2", "start": 1173628800000, "end": 1174233600000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "6_3", "start": 1178636400000, "end": 1179154800000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "6_4", "start": 1180537200000, "end": 1180882800000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "6_5", "start": 1183993200000, "end": 1184770800000, "stroke": rosybrown_border, "fill": {"angle": 90, "keys": [{"color": rosybrown_bottom, "position": 0}, {"color": rosybrown_middle, "position": 0.38}, {"color": rosybrown_top, "position": 1}]}},
        {"id": "6_6", "start": 1190300400000, "end": 1191164400000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "6_7", "start": 1193673600000, "end": 1193846400000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "6_8", "start": 1196179200000, "end": 1197302400000, "stroke": brown_border, "fill": {"angle": 90, "keys": [{"color": brown_bottom, "position": 0}, {"color": brown_middle, "position": 0.38}, {"color": brown_top, "position": 1}]}},
        {"id": "6_9", "start": 1197561600000, "end": 1198166400000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "6_10", "start": 1199721600000, "end": 1199894400000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "6_11", "start": 1200931200000, "end": 1201190400000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "6_12", "start": 1202140800000, "end": 1203609600000, "stroke": rosybrown_border, "fill": {"angle": 90, "keys": [{"color": rosybrown_bottom, "position": 0}, {"color": rosybrown_middle, "position": 0.38}, {"color": rosybrown_top, "position": 1}]}},
        {"id": "6_13", "start": 1204041600000, "end": 1204646400000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "6_14", "start": 1205337600000, "end": 1206460800000, "stroke": rosybrown_border, "fill": {"angle": 90, "keys": [{"color": rosybrown_bottom, "position": 0}, {"color": rosybrown_middle, "position": 0.38}, {"color": rosybrown_top, "position": 1}]}},
        {"id": "6_15", "start": 1209308400000, "end": 1209654000000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "6_16", "start": 1210604400000, "end": 1210863600000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "6_17", "start": 1212678000000, "end": 1214492400000, "stroke": rosybrown_border, "fill": {"angle": 90, "keys": [{"color": rosybrown_bottom, "position": 0}, {"color": rosybrown_middle, "position": 0.38}, {"color": rosybrown_top, "position": 1}]}},
        {"id": "6_18", "start": 1215529200000, "end": 1215702000000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}}]
    },
    {
      "id": "7",
      "name": "Trevor Moore",
      "periods": [
        {"id": "7_1", "start": 1170691200000, "end": 1170777600000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "7_2", "start": 1173110400000, "end": 1174233600000, "stroke": rosybrown_border, "fill": {"angle": 90, "keys": [{"color": rosybrown_bottom, "position": 0}, {"color": rosybrown_middle, "position": 0.38}, {"color": rosybrown_top, "position": 1}]}},
        {"id": "7_3", "start": 1178636400000, "end": 1179327600000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "7_4", "start": 1180969200000, "end": 1181660400000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "7_5", "start": 1185721200000, "end": 1186412400000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "7_6", "start": 1189954800000, "end": 1190559600000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "7_7", "start": 1191769200000, "end": 1192460400000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "7_8", "start": 1196179200000, "end": 1196784000000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "7_9", "start": 1199894400000, "end": 1200240000000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "7_10", "start": 1201104000000, "end": 1201536000000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "7_11", "start": 1206374400000, "end": 1206975600000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "7_12", "start": 1209394800000, "end": 1209481200000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "7_13", "start": 1210690800000, "end": 1211295600000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "7_14", "start": 1213887600000, "end": 1214233200000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "7_15", "start": 1217343600000, "end": 1218726000000, "stroke": rosybrown_border, "fill": {"angle": 90, "keys": [{"color": rosybrown_bottom, "position": 0}, {"color": rosybrown_middle, "position": 0.38}, {"color": rosybrown_top, "position": 1}]}},
        {"id": "7_16", "start": 1220281200000, "end": 1220886000000, "stroke": brown_border, "fill": {"angle": 90, "keys": [{"color": brown_bottom, "position": 0}, {"color": brown_middle, "position": 0.38}, {"color": brown_top, "position": 1}]}}]
    },
    {
      "id": "8",
      "name": "Eddie Bridges",
      "periods": [
        {"id": "8_1", "start": 1170604800000, "end": 1171209600000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "8_2", "start": 1173283200000, "end": 1174233600000, "stroke": brown_border, "fill": {"angle": 90, "keys": [{"color": brown_bottom, "position": 0}, {"color": brown_middle, "position": 0.38}, {"color": brown_top, "position": 1}]}},
        {"id": "8_3", "start": 1177858800000, "end": 1178204400000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "8_4", "start": 1181487600000, "end": 1183302000000, "stroke": rosybrown_border, "fill": {"angle": 90, "keys": [{"color": rosybrown_bottom, "position": 0}, {"color": rosybrown_middle, "position": 0.38}, {"color": rosybrown_top, "position": 1}]}},
        {"id": "8_5", "start": 1187017200000, "end": 1187535600000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "8_6", "start": 1190127600000, "end": 1190646000000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "8_7", "start": 1191423600000, "end": 1192374000000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "8_8", "start": 1193151600000, "end": 1193760000000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "8_9", "start": 1194883200000, "end": 1196352000000, "stroke": rosybrown_border, "fill": {"angle": 90, "keys": [{"color": rosybrown_bottom, "position": 0}, {"color": rosybrown_middle, "position": 0.38}, {"color": rosybrown_top, "position": 1}]}},
        {"id": "8_10", "start": 1200844800000, "end": 1201449600000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "8_11", "start": 1204214400000, "end": 1204473600000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}}]
    },
    {
      "id": "9",
      "name": "Douglas Gunder",
      "periods": [
        {"id": "9_1", "start": 1170864000000, "end": 1171468800000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "9_2", "start": 1172505600000, "end": 1173369600000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "9_3", "start": 1176649200000, "end": 1176908400000, "stroke": brown_border, "fill": {"angle": 90, "keys": [{"color": brown_bottom, "position": 0}, {"color": brown_middle, "position": 0.38}, {"color": brown_top, "position": 1}]}},
        {"id": "9_4", "start": 1178118000000, "end": 1178550000000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "9_5", "start": 1179154800000, "end": 1179327600000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "9_6", "start": 1182265200000, "end": 1183561200000, "stroke": rosybrown_border, "fill": {"angle": 90, "keys": [{"color": rosybrown_bottom, "position": 0}, {"color": rosybrown_middle, "position": 0.38}, {"color": rosybrown_top, "position": 1}]}},
        {"id": "9_7", "start": 1186066800000, "end": 1186585200000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "9_8", "start": 1191855600000, "end": 1193065200000, "stroke": brown_border, "fill": {"angle": 90, "keys": [{"color": brown_bottom, "position": 0}, {"color": brown_middle, "position": 0.38}, {"color": brown_top, "position": 1}]}},
        {"id": "9_9", "start": 1193587200000, "end": 1194364800000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "9_10", "start": 1197561600000, "end": 1198166400000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "9_11", "start": 1200326400000, "end": 1200931200000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "9_12", "start": 1205078400000, "end": 1205683200000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "9_13", "start": 1207839600000, "end": 1208703600000, "stroke": brown_border, "fill": {"angle": 90, "keys": [{"color": brown_bottom, "position": 0}, {"color": brown_middle, "position": 0.38}, {"color": brown_top, "position": 1}]}},
        {"id": "9_14", "start": 1213023600000, "end": 1213628400000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "9_15", "start": 1217257200000, "end": 1218034800000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}}]
    },
    {
      "id": "10",
      "name": "Joseph Marshall",
      "periods": [
        {"id": "10_1", "start": 1171555200000, "end": 1171814400000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "10_2", "start": 1177945200000, "end": 1179759600000, "stroke": rosybrown_border, "fill": {"angle": 90, "keys": [{"color": rosybrown_bottom, "position": 0}, {"color": rosybrown_middle, "position": 0.38}, {"color": rosybrown_top, "position": 1}]}},
        {"id": "10_3", "start": 1181487600000, "end": 1182178800000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "10_4", "start": 1184079600000, "end": 1184770800000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "10_5", "start": 1187017200000, "end": 1187535600000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "10_6", "start": 1189954800000, "end": 1190559600000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "10_7", "start": 1191510000000, "end": 1191769200000, "stroke": brown_border, "fill": {"angle": 90, "keys": [{"color": brown_bottom, "position": 0}, {"color": brown_middle, "position": 0.38}, {"color": brown_top, "position": 1}]}},
        {"id": "10_8", "start": 1195401600000, "end": 1196179200000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "10_9", "start": 1196870400000, "end": 1197302400000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "10_10", "start": 1201449600000, "end": 1202140800000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "10_11", "start": 1205078400000, "end": 1205683200000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "10_12", "start": 1207753200000, "end": 1208185200000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "10_13", "start": 1210258800000, "end": 1210518000000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}}]
    },
    {
      "id": "11",
      "name": "Harry Joiner",
      "periods": [
        {"id": "11_1", "start": 1171555200000, "end": 1172160000000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "11_2", "start": 1176130800000, "end": 1176217200000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "11_3", "start": 1179154800000, "end": 1179673200000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "11_4", "start": 1183388400000, "end": 1184166000000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "11_5", "start": 1186585200000, "end": 1187190000000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "11_6", "start": 1190300400000, "end": 1190905200000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "11_7", "start": 1192633200000, "end": 1193238000000, "stroke": rosybrown_border, "fill": {"angle": 90, "keys": [{"color": rosybrown_bottom, "position": 0}, {"color": rosybrown_middle, "position": 0.38}, {"color": rosybrown_top, "position": 1}]}},
        {"id": "11_8", "start": 1197302400000, "end": 1199030400000, "stroke": rosybrown_border, "fill": {"angle": 90, "keys": [{"color": rosybrown_bottom, "position": 0}, {"color": rosybrown_middle, "position": 0.38}, {"color": rosybrown_top, "position": 1}]}},
        {"id": "11_9", "start": 1200931200000, "end": 1201190400000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}}]
    },
    {
      "id": "12",
      "name": "Dorothy Michael",
      "periods": [
        {"id": "12_1", "start": 1171987200000, "end": 1172678400000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "12_2", "start": 1176822000000, "end": 1177340400000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "12_3", "start": 1181833200000, "end": 1182438000000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "12_4", "start": 1184252400000, "end": 1184857200000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "12_5", "start": 1187535600000, "end": 1188226800000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "12_6", "start": 1190559600000, "end": 1190818800000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "12_7", "start": 1196956800000, "end": 1197388800000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}}]
    },
    {
      "id": "13",
      "name": "Kevyn Ford",
      "periods": [
        {"id": "13_1", "start": 1170691200000, "end": 1171296000000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "13_2", "start": 1172505600000, "end": 1173110400000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "13_3", "start": 1180364400000, "end": 1180623600000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "13_4", "start": 1182438000000, "end": 1182783600000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "13_5", "start": 1183561200000, "end": 1183906800000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "13_6", "start": 1186066800000, "end": 1186930800000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "13_7", "start": 1188140400000, "end": 1188313200000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "13_8", "start": 1191337200000, "end": 1191855600000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "13_9", "start": 1196006400000, "end": 1196265600000, "stroke": rosybrown_border, "fill": {"angle": 90, "keys": [{"color": rosybrown_bottom, "position": 0}, {"color": rosybrown_middle, "position": 0.38}, {"color": rosybrown_top, "position": 1}]}},
        {"id": "13_10", "start": 1200585600000, "end": 1201449600000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "13_11", "start": 1203868800000, "end": 1204473600000, "stroke": brown_border, "fill": {"angle": 90, "keys": [{"color": brown_bottom, "position": 0}, {"color": brown_middle, "position": 0.38}, {"color": brown_top, "position": 1}]}},
        {"id": "13_12", "start": 1206889200000, "end": 1207494000000, "stroke": brown_border, "fill": {"angle": 90, "keys": [{"color": brown_bottom, "position": 0}, {"color": brown_middle, "position": 0.38}, {"color": brown_top, "position": 1}]}},
        {"id": "13_13", "start": 1207839600000, "end": 1208185200000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "13_14", "start": 1208790000000, "end": 1209567600000, "stroke": brown_border, "fill": {"angle": 90, "keys": [{"color": brown_bottom, "position": 0}, {"color": brown_middle, "position": 0.38}, {"color": brown_top, "position": 1}]}},
        {"id": "13_15", "start": 1211727600000, "end": 1211900400000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "13_16", "start": 1213628400000, "end": 1213801200000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "13_17", "start": 1215529200000, "end": 1215961200000, "stroke": brown_border, "fill": {"angle": 90, "keys": [{"color": brown_bottom, "position": 0}, {"color": brown_middle, "position": 0.38}, {"color": brown_top, "position": 1}]}},
        {"id": "13_18", "start": 1219330800000, "end": 1219590000000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "13_19", "start": 1222786800000, "end": 1222959600000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "13_20", "start": 1225987200000, "end": 1226592000000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}}]
    },
    {
      "id": "14",
      "name": "Rene Kaufmann",
      "periods": [
        {"id": "14_1", "start": 1169136000000, "end": 1169395200000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "14_2", "start": 1174320000000, "end": 1174834800000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "14_3", "start": 1177340400000, "end": 1177599600000, "stroke": brown_border, "fill": {"angle": 90, "keys": [{"color": brown_bottom, "position": 0}, {"color": brown_middle, "position": 0.38}, {"color": brown_top, "position": 1}]}},
        {"id": "14_4", "start": 1180450800000, "end": 1181142000000, "stroke": brown_border, "fill": {"angle": 90, "keys": [{"color": brown_bottom, "position": 0}, {"color": brown_middle, "position": 0.38}, {"color": brown_top, "position": 1}]}},
        {"id": "14_5", "start": 1185116400000, "end": 1185721200000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "14_6", "start": 1189695600000, "end": 1190559600000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "14_7", "start": 1193673600000, "end": 1194451200000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "14_8", "start": 1199635200000, "end": 1199808000000, "stroke": brown_border, "fill": {"angle": 90, "keys": [{"color": brown_bottom, "position": 0}, {"color": brown_middle, "position": 0.38}, {"color": brown_top, "position": 1}]}},
        {"id": "14_9", "start": 1201449600000, "end": 1202140800000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "14_10", "start": 1203868800000, "end": 1204041600000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "14_11", "start": 1206975600000, "end": 1207666800000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "14_12", "start": 1212937200000, "end": 1213714800000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "14_13", "start": 1214146800000, "end": 1214838000000, "stroke": rosybrown_border, "fill": {"angle": 90, "keys": [{"color": rosybrown_bottom, "position": 0}, {"color": rosybrown_middle, "position": 0.38}, {"color": rosybrown_top, "position": 1}]}},
        {"id": "14_14", "start": 1218121200000, "end": 1219071600000, "stroke": rosybrown_border, "fill": {"angle": 90, "keys": [{"color": rosybrown_bottom, "position": 0}, {"color": rosybrown_middle, "position": 0.38}, {"color": rosybrown_top, "position": 1}]}},
        {"id": "14_15", "start": 1221750000000, "end": 1222614000000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "14_16", "start": 1223910000000, "end": 1224687600000, "stroke": brown_border, "fill": {"angle": 90, "keys": [{"color": brown_bottom, "position": 0}, {"color": brown_middle, "position": 0.38}, {"color": brown_top, "position": 1}]}},
        {"id": "14_17", "start": 1229875200000, "end": 1230652800000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}}]
    },
    {
      "id": "15",
      "name": "John Miller",
      "periods": [
        {"id": "15_1", "start": 1170691200000, "end": 1171468800000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "15_2", "start": 1174921200000, "end": 1175094000000, "stroke": brown_border, "fill": {"angle": 90, "keys": [{"color": brown_bottom, "position": 0}, {"color": brown_middle, "position": 0.38}, {"color": brown_top, "position": 1}]}},
        {"id": "15_3", "start": 1178463600000, "end": 1179154800000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "15_4", "start": 1179759600000, "end": 1180537200000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "15_5", "start": 1182783600000, "end": 1183302000000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "15_6", "start": 1185807600000, "end": 1186326000000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "15_7", "start": 1187794800000, "end": 1188399600000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "15_8", "start": 1191855600000, "end": 1192460400000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "15_9", "start": 1199030400000, "end": 1199635200000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "15_10", "start": 1201449600000, "end": 1202313600000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "15_11", "start": 1203868800000, "end": 1204732800000, "stroke": rosybrown_border, "fill": {"angle": 90, "keys": [{"color": rosybrown_bottom, "position": 0}, {"color": rosybrown_middle, "position": 0.38}, {"color": rosybrown_top, "position": 1}]}},
        {"id": "15_12", "start": 1210258800000, "end": 1210863600000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}}]
    },
    {
      "id": "16",
      "name": "Scott Lynch",
      "periods": [
        {"id": "16_1", "start": 1169654400000, "end": 1170172800000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "16_2", "start": 1171814400000, "end": 1172592000000, "stroke": brown_border, "fill": {"angle": 90, "keys": [{"color": brown_bottom, "position": 0}, {"color": brown_middle, "position": 0.38}, {"color": brown_top, "position": 1}]}},
        {"id": "16_3", "start": 1173801600000, "end": 1175094000000, "stroke": rosybrown_border, "fill": {"angle": 90, "keys": [{"color": rosybrown_bottom, "position": 0}, {"color": rosybrown_middle, "position": 0.38}, {"color": rosybrown_top, "position": 1}]}},
        {"id": "16_4", "start": 1178463600000, "end": 1178809200000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "16_5", "start": 1179759600000, "end": 1180623600000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "16_6", "start": 1186326000000, "end": 1186930800000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "16_7", "start": 1187708400000, "end": 1188226800000, "stroke": brown_border, "fill": {"angle": 90, "keys": [{"color": brown_bottom, "position": 0}, {"color": brown_middle, "position": 0.38}, {"color": brown_top, "position": 1}]}},
        {"id": "16_8", "start": 1188745200000, "end": 1190041200000, "stroke": rosybrown_border, "fill": {"angle": 90, "keys": [{"color": rosybrown_bottom, "position": 0}, {"color": rosybrown_middle, "position": 0.38}, {"color": rosybrown_top, "position": 1}]}},
        {"id": "16_9", "start": 1194278400000, "end": 1195056000000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "16_10", "start": 1198425600000, "end": 1199721600000, "stroke": rosybrown_border, "fill": {"angle": 90, "keys": [{"color": rosybrown_bottom, "position": 0}, {"color": rosybrown_middle, "position": 0.38}, {"color": rosybrown_top, "position": 1}]}},
        {"id": "16_11", "start": 1201449600000, "end": 1202227200000, "stroke": rosybrown_border, "fill": {"angle": 90, "keys": [{"color": rosybrown_bottom, "position": 0}, {"color": rosybrown_middle, "position": 0.38}, {"color": rosybrown_top, "position": 1}]}},
        {"id": "16_12", "start": 1206374400000, "end": 1207148400000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "16_13", "start": 1208790000000, "end": 1208876400000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "16_14", "start": 1210518000000, "end": 1210690800000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "16_15", "start": 1212332400000, "end": 1212937200000, "stroke": brown_border, "fill": {"angle": 90, "keys": [{"color": brown_bottom, "position": 0}, {"color": brown_middle, "position": 0.38}, {"color": brown_top, "position": 1}]}},
        {"id": "16_16", "start": 1214233200000, "end": 1215097200000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "16_17", "start": 1216566000000, "end": 1216825200000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "16_18", "start": 1217862000000, "end": 1218034800000, "stroke": brown_border, "fill": {"angle": 90, "keys": [{"color": brown_bottom, "position": 0}, {"color": brown_middle, "position": 0.38}, {"color": brown_top, "position": 1}]}},
        {"id": "16_19", "start": 1218380400000, "end": 1219071600000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "16_20", "start": 1221663600000, "end": 1222095600000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "16_21", "start": 1228665600000, "end": 1229443200000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}}]
    },
    {
      "id": "17",
      "name": "Victor Zamalin",
      "periods": [
        {"id": "17_1", "start": 1168876800000, "end": 1169568000000, "stroke": rosybrown_border, "fill": {"angle": 90, "keys": [{"color": rosybrown_bottom, "position": 0}, {"color": rosybrown_middle, "position": 0.38}, {"color": rosybrown_top, "position": 1}]}},
        {"id": "17_2", "start": 1170000000000, "end": 1170691200000, "stroke": brown_border, "fill": {"angle": 90, "keys": [{"color": brown_bottom, "position": 0}, {"color": brown_middle, "position": 0.38}, {"color": brown_top, "position": 1}]}},
        {"id": "17_3", "start": 1172678400000, "end": 1173110400000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "17_4", "start": 1174579200000, "end": 1174834800000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "17_5", "start": 1175094000000, "end": 1175526000000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "17_6", "start": 1179759600000, "end": 1180018800000, "stroke": brown_border, "fill": {"angle": 90, "keys": [{"color": brown_bottom, "position": 0}, {"color": brown_middle, "position": 0.38}, {"color": brown_top, "position": 1}]}},
        {"id": "17_7", "start": 1182178800000, "end": 1182956400000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "17_8", "start": 1186671600000, "end": 1187017200000, "stroke": brown_border, "fill": {"angle": 90, "keys": [{"color": brown_bottom, "position": 0}, {"color": brown_middle, "position": 0.38}, {"color": brown_top, "position": 1}]}},
        {"id": "17_9", "start": 1189522800000, "end": 1189609200000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "17_10", "start": 1190905200000, "end": 1191510000000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "17_11", "start": 1193065200000, "end": 1194278400000, "stroke": rosybrown_border, "fill": {"angle": 90, "keys": [{"color": rosybrown_bottom, "position": 0}, {"color": rosybrown_middle, "position": 0.38}, {"color": rosybrown_top, "position": 1}]}},
        {"id": "17_12", "start": 1195747200000, "end": 1196697600000, "stroke": rosybrown_border, "fill": {"angle": 90, "keys": [{"color": rosybrown_bottom, "position": 0}, {"color": rosybrown_middle, "position": 0.38}, {"color": rosybrown_top, "position": 1}]}},
        {"id": "17_13", "start": 1199030400000, "end": 1199635200000, "stroke": rosybrown_border, "fill": {"angle": 90, "keys": [{"color": rosybrown_bottom, "position": 0}, {"color": rosybrown_middle, "position": 0.38}, {"color": rosybrown_top, "position": 1}]}},
        {"id": "17_14", "start": 1202659200000, "end": 1203523200000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "17_15", "start": 1206633600000, "end": 1207580400000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}}]
    },
    {
      "id": "18",
      "name": "James Sherwood",
      "periods": [
        {"id": "18_1", "start": 1169049600000, "end": 1169481600000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "18_2", "start": 1170604800000, "end": 1170777600000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "18_3", "start": 1174921200000, "end": 1175526000000, "stroke": brown_border, "fill": {"angle": 90, "keys": [{"color": brown_bottom, "position": 0}, {"color": brown_middle, "position": 0.38}, {"color": brown_top, "position": 1}]}},
        {"id": "18_4", "start": 1176649200000, "end": 1177340400000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "18_5", "start": 1178550000000, "end": 1179759600000, "stroke": rosybrown_border, "fill": {"angle": 90, "keys": [{"color": rosybrown_bottom, "position": 0}, {"color": rosybrown_middle, "position": 0.38}, {"color": rosybrown_top, "position": 1}]}},
        {"id": "18_6", "start": 1183906800000, "end": 1184079600000, "stroke": brown_border, "fill": {"angle": 90, "keys": [{"color": brown_bottom, "position": 0}, {"color": brown_middle, "position": 0.38}, {"color": brown_top, "position": 1}]}},
        {"id": "18_7", "start": 1188140400000, "end": 1188831600000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "18_8", "start": 1191250800000, "end": 1191769200000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "18_9", "start": 1194883200000, "end": 1194969600000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}}]
    },
    {
      "id": "19",
      "name": "Mark Green",
      "periods": [
        {"id": "19_1", "start": 1172592000000, "end": 1172678400000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "19_2", "start": 1175526000000, "end": 1176044400000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "19_3", "start": 1177340400000, "end": 1178031600000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "19_4", "start": 1179673200000, "end": 1180364400000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "19_5", "start": 1181142000000, "end": 1181487600000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "19_6", "start": 1182092400000, "end": 1182956400000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "19_7", "start": 1185807600000, "end": 1186066800000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "19_8", "start": 1187535600000, "end": 1188745200000, "stroke": rosybrown_border, "fill": {"angle": 90, "keys": [{"color": rosybrown_bottom, "position": 0}, {"color": rosybrown_middle, "position": 0.38}, {"color": rosybrown_top, "position": 1}]}},
        {"id": "19_9", "start": 1192028400000, "end": 1192978800000, "stroke": rosybrown_border, "fill": {"angle": 90, "keys": [{"color": rosybrown_bottom, "position": 0}, {"color": rosybrown_middle, "position": 0.38}, {"color": rosybrown_top, "position": 1}]}},
        {"id": "19_10", "start": 1196006400000, "end": 1197216000000, "stroke": rosybrown_border, "fill": {"angle": 90, "keys": [{"color": rosybrown_bottom, "position": 0}, {"color": rosybrown_middle, "position": 0.38}, {"color": rosybrown_top, "position": 1}]}}]
    },
    {
      "id": "20",
      "name": "Victor Melecio",
      "periods": [
        {"id": "20_1", "start": 1169049600000, "end": 1170086400000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "20_2", "start": 1171468800000, "end": 1171987200000, "stroke": brown_border, "fill": {"angle": 90, "keys": [{"color": brown_bottom, "position": 0}, {"color": brown_middle, "position": 0.38}, {"color": brown_top, "position": 1}]}},
        {"id": "20_3", "start": 1173888000000, "end": 1174921200000, "stroke": rosybrown_border, "fill": {"angle": 90, "keys": [{"color": rosybrown_bottom, "position": 0}, {"color": rosybrown_middle, "position": 0.38}, {"color": rosybrown_top, "position": 1}]}},
        {"id": "20_4", "start": 1175785200000, "end": 1176390000000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "20_5", "start": 1177945200000, "end": 1178809200000, "stroke": brown_border, "fill": {"angle": 90, "keys": [{"color": brown_bottom, "position": 0}, {"color": brown_middle, "position": 0.38}, {"color": brown_top, "position": 1}]}},
        {"id": "20_6", "start": 1180018800000, "end": 1180450800000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "20_7", "start": 1182697200000, "end": 1183302000000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "20_8", "start": 1184166000000, "end": 1185894000000, "stroke": rosybrown_border, "fill": {"angle": 90, "keys": [{"color": rosybrown_bottom, "position": 0}, {"color": rosybrown_middle, "position": 0.38}, {"color": rosybrown_top, "position": 1}]}},
        {"id": "20_9", "start": 1190041200000, "end": 1190559600000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "20_10", "start": 1193760000000, "end": 1195401600000, "stroke": rosybrown_border, "fill": {"angle": 90, "keys": [{"color": rosybrown_bottom, "position": 0}, {"color": rosybrown_middle, "position": 0.38}, {"color": rosybrown_top, "position": 1}]}},
        {"id": "20_11", "start": 1195574400000, "end": 1196611200000, "stroke": brown_border, "fill": {"angle": 90, "keys": [{"color": brown_bottom, "position": 0}, {"color": brown_middle, "position": 0.38}, {"color": brown_top, "position": 1}]}},
        {"id": "20_12", "start": 1197820800000, "end": 1199116800000, "stroke": rosybrown_border, "fill": {"angle": 90, "keys": [{"color": rosybrown_bottom, "position": 0}, {"color": rosybrown_middle, "position": 0.38}, {"color": rosybrown_top, "position": 1}]}},
        {"id": "20_13", "start": 1201536000000, "end": 1202313600000, "stroke": rosybrown_border, "fill": {"angle": 90, "keys": [{"color": rosybrown_bottom, "position": 0}, {"color": rosybrown_middle, "position": 0.38}, {"color": rosybrown_top, "position": 1}]}},
        {"id": "20_14", "start": 1204560000000, "end": 1205164800000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "20_15", "start": 1208703600000, "end": 1209394800000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "20_16", "start": 1211727600000, "end": 1211900400000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}},
        {"id": "20_17", "start": 1214838000000, "end": 1215097200000, "stroke": moccasin_border, "fill": {"angle": 90, "keys": [{"color": moccasin_bottom, "position": 0}, {"color": moccasin_middle, "position": 0.38}, {"color": moccasin_top, "position": 1}]}}]
    }
  ];
}

function formatToUTCDate(val) {
  var date = new Date(val);
  return 'Date.UTC(' + date.getUTCFullYear() + ', ' + date.getUTCMonth() + ', ' + date.getUTCDate() + ', ' + date.getUTCHours() + ')';
}


function convertData() {
  var data = getData();
  var res = '[';
  for (var i = 0; i < data.length; i++) {
    var item = data[i];
    var str = '{ \'id\': \'' + item.id + '\', \'name\': \'' + item.name + '\', \'periods\': [';
    var periods = item.periods;
    for (var j = 0; j < periods.length; j++) {
      var period = periods[j];
      var last = (j == periods.length - 1) ? '' : ',';
      str += '{\'id\': \'' + period.id + '\', \'start\': ' + formatToUTCDate(period.start) + ', \'end\': ' +
          formatToUTCDate(period.end) + '}' + last + '\n';
    }
    str += ']\n},';
    res += str;
  }
  res += '];';
  return res;
}

var chart;
anychart.onDocumentReady(function() {
  chart = anychart.pie();
  chart.title(true);
  chart.data([
    {name: 'Candidate', value: 10},
    {name: 'Candidate2', value:7},
    {name: 'Candidate3', value:17},
    {name: 'Candidate4', value:4},
    {name: 'Candidate5', value:22}
  ]);
  chart.legend().position(anychart.enums.Orientation.BOTTOM);
  chart.legend().title()
      .text('Candidates sdfsdfs dsf saf sdf lsdf ksadf lksfkl sadjfkl sdlfjsd fklsd fjdslf jklsdf ljksdsd fsdf sdf sdf sdfs fsd fsdf sdf sd').enabled(true)
      .letterSpacing('2px')
      .margin(5)
      .fontSize(11);

  chart.legend().titleSeparator(true);
  //chart.legend().itemsLayout('h');

  chart.container('container').draw();














  var legend;
  legend = anychart.ui.legend();
  legend.position('left').itemsLayout('v');
  legend.items([
    {text: 'Name 3'},
    {text: 'Name 4'},
    {text: 'Candidate3', value: 17},
    {text: 'Candidate4', value: 4},
    {text: 'Candidate5', value: 22},
    {text: 'Candidate1', value: 22}
  ]);
  legend.paginator().enabled(true).margin(5);
  legend
      .title(
      {
        text: 'Default ds sdfsdklfsdfkl sdflks dfjslkdf jsdflk sjdlkf sjkdfkl sdlf jlksdfjlk sjlkdf kljs;dflk slkdf',
        //text: 'Default ds sdfsdklfsdfkl ',
        //text: 'Default',
        orientation: 'left',
        align: 'center',
        rotation: 0,
        padding: {right: 5, top: 2, left: 5, bottom: 3}
      })
      .titleSeparator(null)
      .itemsLayout('horizontal');
  legend.container('container').draw();
















  var stage = acgraph.create('container');
  chart = anychart.bar();

  var data = [
    {name: 'Chrome', value: 59.2},
    {name: 'IE', value: 8.9},
    {name: 'Firefox', value: 24.9},
    {name: 'Safari', value: 3.8},
    {name: 'Opera', value: 1.8}
  ];
  var palette = anychart.palettes.distinctColors().colors();
  var legendItems = [];

  for (var index in data) {
    data[index].fill = palette[index];
    legendItems.push(
        {
          text: data[index].name,
          iconType: 'square',
          iconFill: palette[index]
        }
    )
  }














  var customLegend = anychart.ui.legend();
  customLegend.enabled(true);
  customLegend.itemsLayout('vertical');
  customLegend.items(legendItems);
  customLegend.position('right').align('bottom');

  chart.bar(data);
  chart.title().enabled(true).orientation('left');
  chart.container(stage).draw();

  customLegend.parentBounds(anychart.math.rect(0, 0, chart.container().width(), chart.container().height()-20));
  customLegend.container(stage).draw();













  var stage = acgraph.create('container');
  chart = anychart.sparkline([1, 5, -5, 6, 8, 12]);
  chart.title().enabled(true).text('Default');
  chart.container(stage).draw();











  var stage = acgraph.create('container');
  var data = [
    {name: 'Name 1'},
    {name: 'Name 2'}
  ];

  var legend = anychart.ui.legend();
  legend.items(data)
      .title('Position_LEFT')
      .position('left');
  legend.container(stage).draw();

  var legend1 = anychart.ui.legend();
  legend1.items(data)
      .title('Position_RIGHT')
      .position('right');
  legend1.container(stage).draw();

  var legend2 = anychart.ui.legend();
  legend2.items(data)
      .title('Position_BOTTOM')
      .position('bottom');
  legend2.container(stage).draw();

  var legend3 = anychart.ui.legend();
  legend3.items(data)
      .title('Position_TOP')
      .position('top');

  legend3.container(stage).draw();












  var stage = acgraph.create('container');
  var data = [
    {name: 'Name 1'},
    {name: 'Name 2'}
  ];

  legend = anychart.ui.legend();
  legend.parentBounds(0, 0, 150, 60)
      .items(data)
      .title('Solid, opacity, thickness')
      .background().stroke('red .5', 2);
  legend.container(stage).draw();

  legend1 = anychart.ui.legend();
  legend1.parentBounds(150, 0, 150, 60)
      .items(data)
      .title('Str Solid, opacity, thickness')
      .background().stroke('5px green .2');
  legend1.container(stage).draw();

  legend2 = anychart.ui.legend();
  legend2.parentBounds(0, 60, 150, 60)
      .items(data)
      .title('Many Solid')
      .background().stroke(['red', 'blue', 'white', 'green 0.3'], 6, '5 6');
  legend2.container(stage).draw();

  legend3 = anychart.ui.legend();
  legend3.parentBounds(150, 60, 150, 60)
      .items(data)
      .title('LineJoin, LineCap')
      .background().stroke('orange', 5, '15', acgraph.vector.StrokeLineJoin.ROUND, acgraph.vector.StrokeLineCap.SQUARE);
  legend3.container(stage).draw();

  var legend4 = anychart.ui.legend();
  legend4.parentBounds(0, 120, 150, 60)
      .items(data)
      .title('Array')
      .background().stroke(['green', 'yellow', 'red'], 5);
  legend4.container(stage).draw();

  var legend5 = anychart.ui.legend();
  legend5.parentBounds(150, 120, 150, 60)
      .items(data)
      .title('Object')
      .background().stroke({color: '#f00', thickness: 5, opacity: 0.9});
  legend5.container(stage).draw();
});
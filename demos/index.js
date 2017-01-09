anychart.onDocumentLoad(function() {
  var stage = anychart.graphics.create('container', 600, 300);
  // anytest.setUp(600, 300)
  //     .description('Проверяем метод dispose на элементах: <br/>' +
  //         '1 скриншот - элементы отрисованы <br/>' +
  //         '2 скриншот - элементы уничтожены dispose <br/>' +
  //         '3 скриншот - проверяем отрисовку элементов после dispose. Они не должны отрисоваться')
  //     .setCheckMsg('Error: 2 Description: Scale is not set. Use scale() method to set it.');

  lScale = anychart.scales.linear();
//   axis = anychart.standalones.axes.linear();
//   axis.scale(lScale)
//       .parentBounds(new acgraph.math.Rect(60, 5, 100, 100))
//       .minorTicks()
//       .length(7)
//       .stroke('2 green');
//   axis.container(stage).draw();
// //-----------------------------------------
//   bg = anychart.standalones.background();
//   bg.fill('blue').bounds(anychart.math.rect(180, 20, 50, 50));
//   bg.container(stage).draw();
// //-----------------------------------------
//   data = [
//     {id: '1', name: '1'},
//     {id: '2', name: '2'},
//     {id: '3', name: '1-3', parent: '1'}
//   ];
//   tree = anychart.data.tree();
//   tree.addData(data);
//   dataGrid = anychart.standalones.dataGrid();
//   dataGrid.data(tree).titleHeight(25);
//   dataGrid.bounds(anychart.math.rect(250, 20, 100, 100));
//   dataGrid.container(stage).draw();
// //-----------------------------------------
//   label = anychart.standalones.label()
//       .text('label dispose')
//       .parentBounds(anychart.math.rect(350, 20, 100, 100));
//   label.container(stage).draw();
// //-----------------------------------------
//   labels = anychart.standalones.labelsFactory();
//   labels.enabled(true);
//   points = [
//     {value: {x: 30, y: 55}},
//     {value: {x: 30, y: 130}}
//   ];
//
//   for (i = 0; i < 2; i++) {
//     labels.add({value: 'labels ' + (i + 1)}, points[i])
//         .background({fill: 'white .1'});
//   }
//   labels.container(stage).draw();
// //-----------------------------------------
//   legend = anychart.standalones.legend();
//   legend.parentBounds(anychart.math.rect(410, 20, 190, 100));
//   legend.items([
//     {name: 'item 1'},
//     {name: 'item 2'},
//     {name: 'item 3'}
//   ]);
//   legend.container(stage).draw();
// //-----------------------------------------
//   linemarker = anychart.standalones.axisMarkers.line();
//   linemarker.scale(lScale)
//       .value(0.3)
//       .stroke('2 red')
//       .layout('vertical')
//       .parentBounds(new acgraph.math.Rect(50, 100, 200, 67));
//   linemarker.container(stage).draw();
//-----------------------------------------
  count = 2;
  markers = anychart.standalones.markersFactory();
  markers.enabled(true)
      .size(15)
      .fill('red')
      .type('star1')
      .positionFormatter(function() {
        return {x: 150 * (this.index + 1), y: 150};
      });
  for (index = 0; index < count; index++) {
    markers.add({index: index});
    markers.container(stage).draw();
  }
//-----------------------------------------
//   rangemarker = anychart.standalones.axisMarkers.range();
//   rangemarker.scale(lScale)
//       .from(0)
//       .to(0.3)
//       .fill('green .2')
//       .layout('vertical')
//       .parentBounds(new acgraph.math.Rect(350, 120, 200, 67));
//   rangemarker.container(stage).draw();
// //-----------------------------------------
//   table = anychart.standalones.table();
//   table.contents([
//     ['Table', 'Table'],
//     ['Table', 'Table']
//   ])
//       .bounds(new acgraph.math.Rect(10, 200, 550, 67));
//   table.container(stage).draw();
// //-----------------------------------------
//   textmarker = anychart.standalones.axisMarkers.text()
//       .parentBounds(new acgraph.math.Rect(230, 100, 250, 100))
//       .scale(lScale)
//       .text('Textmarker')
//       .layout('vertical')
//       .value(0)
//       .fontColor('black');
//   textmarker.container(stage).draw();
// //-----------------------------------------
//   title = anychart.standalones.title();
//   title.text('Title')
//       .fontSize(14)
//       .fontColor('brown')
//       .parentBounds(new acgraph.math.Rect(240, 50, 250, 100));
//   title.container(stage).draw();
// //-----------------------------------------
  
      // axis.dispose();
      // bg.dispose();
      // dataGrid.dispose();
      // label.dispose();
      // labels.dispose();
      // legend.dispose();
      // linemarker.dispose();
      markers.dispose();
      // rangemarker.dispose();
      // table.dispose();
      // textmarker.dispose();
      // title.dispose();

      
      
      // axis.container(stage).draw();
      // bg.container(stage).draw();
      // dataGrid.container(stage).draw();
      // label.container(stage).draw();
      // labels.container(stage).draw();
      // legend.container(stage).draw();
      // linemarker.container(stage).draw();
      markers.container(stage).draw();
      // rangemarker.container(stage).draw();
      // table.container(stage).draw();
      // textmarker.container(stage).draw();
      // title.container(stage).draw();
      //
  // stage.resume();
});
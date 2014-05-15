var marker, stage;
function load() {
  var index;
  var count = 12;

  var keys = [
    {offset: 0, color: 'red'},
//    {offset: 0.16, color: 'orange'},
//    {offset: 0.32, color: 'yellow'},
//    {offset: 0.48, color: 'green'},
//    {offset: 0.64, color: 'dodgerblue'},
//    {offset: 0.8, color: 'blue'},
    {offset: 1, color: 'purple'}
  ];



  stage = acgraph.create().container('container');
  marker = new anychart.elements.Multimarker();
  marker
      .container(stage)
      .size(35)
      .fill({keys: keys, cx: 0.5, cy: 0.5})
      .stroke('3 blue')
      .positionFormatter(function(positionProvider, index) {
        return {x: 80 * (1 + index), y: 100}
      })
      .enabled(false)
      .enabledAt(2, true)
      .enabledAt(3, true)
      .enabledAt(4, true)
      .anchor('center');


  /*marker
      .sizeAt(3, 20)
      .fillAt(4, acgraph.hatchFill(acgraph.vector.HatchFill.HatchFillType.WEAVE))
      .strokeAt(5, '5 yellow')
      .typeAt(6, anychart.elements.Marker.Type.STAR5);



  marker.strokeAt(5, '5 blue');
  marker.fillAt(6, 'black 0.4');
  marker.sizeAt(9, 46).anchorAt(9, anychart.utils.NinePositions.LEFT_TOP);
  marker
      .typeAt(7, function(shape, x, y, radius) {
        shape
            .moveTo(x, y)
            .lineTo(x, y - radius)
            .lineTo(x + radius, y)
            .lineTo(x - radius, y)
            .lineTo(x, y + radius)
            .close()
      })
      .anchorAt(8, anychart.utils.NinePositions.BOTTOM);

  for (index = 0; index < 1; index++) {
    marker.draw();
  }
  marker.end();


  marker.fillAt(0, 'lime').anchor(anychart.utils.NinePositions.TOP);*/

  marker.listen('click', function(){console.log(arguments[0].markerIndex);});

  for (index = 0; index < count; index++) {
    marker.draw();
//    marker.container().rect().setBounds(marker.measure(marker.positionFormatter(), index));
  }
  marker.end();


  marker.listen('signal', function() {
    console.log('inv!');
    for (index = 0; index < count; index++) {
      marker.draw();
    }
    marker.end();
  });


}

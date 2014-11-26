var marker;
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



  marker = new anychart.core.ui.Marker();
  marker
      .container('container')
      .size(35)
      .fill({keys: keys, cx: 0.5, cy: 0.5})
      .stroke('3 blue')
      .position({x: 100, y: 100})
      .anchor(anychart.utils.NinePositions.LEFT_BOTTOM)
      .offsetX(10)
      .offsetY(10);

  marker.draw();

  marker
      .parentBounds(marker.container().getBounds())
      .anchor(anychart.utils.NinePositions.CENTER)
      .position({x: '50%', y: '50%'})
      .offsetX(0)
      .offsetY(0);
  marker.draw();

  marker
      .type(anychart.core.ui.Marker.Type.STAR10);
  marker.draw();

  marker
      .fill('!!!')
      .stroke('5 red');
  marker.draw();


//  marker.container().rect(100, 100, 1, 400);
//  marker.container().rect().setBounds(marker.pixelBounds());


  /*listen.listen('invalidated', function() {
    labels.end();

    for (index = 0; index <= count; index++) {
      labels.draw(null, null);
    }
  });*/


}

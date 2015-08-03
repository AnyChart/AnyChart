var marker, hoverMarker, stage, markers;
function load() {
  var index;
  var count = 5;

  var keys = [
    {offset: 0, color: 'red'},
    {offset: 1, color: 'purple'}
  ];

  marker = new anychart.core.ui.MarkersFactory();
  marker.container('container');
  marker.enabled(true);


  for (index = 1; index < count; index++) {
    marker.add({value: {x: 100 * index, y: 100}});
  }
  marker.draw();

  //marker
  //    .size(35)
  //    .fill({keys: keys, cx: 0.5, cy: 0.5})
  //    .stroke('blue')
  //    .anchor('center');
  //marker.draw();
}

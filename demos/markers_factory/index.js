var marker, hoverMarker, stage, markers;
function load() {
  var index;
  var count = 5;

  var keys = [
    {offset: 0, color: 'red'},
    {offset: 1, color: 'purple'}
  ];

  marker = new anychart.elements.MarkersFactory();
  marker.container('container');
  marker.enabled(true);

  hoverMarker = new anychart.elements.MarkersFactory();
  hoverMarker
      .size(40)
      .fill({
        src: 'http://www.officialpsds.com/images/thumbs/UMBRELLA-CORPORATION-LOGO-psd41105.png',
        mode: acgraph.vector.ImageFillMode.FIT})
      .stroke(null)
      .type(anychart.enums.MarkerType.SQUARE);

  marker.listen('mouseover', function(e) {
    var m = e.target;
    m.currentMarkersFactory(hoverMarker);
    m.draw();
  });

  marker.listen('mouseout', function(e) {
    var m = e.target;
    m.currentMarkersFactory(marker);
    m.draw();
  });

  for (index = 1; index < count; index++) {
    marker.add({value: {x: 100 * index, y: 100}});
  }
  marker.draw();

  marker
      .size(35)
      .fill({keys: keys, cx: 0.5, cy: 0.5})
      .stroke('blue')
      .anchor('center');
  marker.draw();
}

var marker, hoverMarker, stage, markers;
function load() {
  var index;
  var count = 10;

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
  marker = new anychart.elements.MarkersFactory();
  marker
      .container(stage)
      .size(35)
      .fill({keys: keys, cx: 0.5, cy: 0.5})
      .stroke('blue')
      .positionFormatter(function() {
        return {x: 80 * (1 + this.getIndex()), y: 100}
      })
      .anchor('center');


  hoverMarker = new anychart.elements.MarkersFactory();
  hoverMarker
      .size(40)
      .fill({
        src: 'http://www.officialpsds.com/images/thumbs/UMBRELLA-CORPORATION-LOGO-psd41105.png',
        mode: acgraph.vector.ImageFillMode.FIT})
      .stroke(null)
      .type(anychart.elements.Marker.Type.SQUARE);

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

  markers = [];

  for (index = 0; index < count; index++) {
    markers[index] = marker.add({});
//    marker.container().rect().setBounds(marker.measure(marker.positionFormatter(), index));
  }
  marker.draw();


  marker.listen('signal', function() {
    for (index = 0; index < count; index++) {
      marker.add({});
    }
    marker.draw();
  });


}

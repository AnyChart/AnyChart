var chart;
var radiusPixel = 0;

function load() {
  var container = 'container';
  var stage = acgraph.create(600, 400, container);
  var layer = acgraph.layer();
  stage.rect(1, 1, stage.width() - 2, stage.height() - 2).fill('none').stroke('0.5 #000');
  /////////////////////////////////////////////////////////

  * var rect = stage.rect(75, 25, 100, 100).stroke('1 blue');
  * var rectBounds = rect.getBounds();
  * var label = new anychart.elements.Label();
  * label.position(anychart.utils.NinePositions.CENTER);
  * label.parentBounds(rectBounds);
  * label.container(stage).draw();
  * // обозначим красным точку поционирования лейбла.
  * stage.circle(rectBounds.left + rectBounds.width / 2, rectBounds.top + rectBounds.height / 2, 2).stroke('3 red');

}

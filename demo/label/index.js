var label;
function load() {
  label = new anychart.elements.Label();
  label.container('container');
  label.position({x: '20%', y: 20});
  label.text('Some label text');
  label.anchor('center');
  label.padding(10, 5, 10, 5);
  label.offsetX(-10);
  label.offsetY(10);
  label.background().fill('green .5').stroke('none');
  label.parentBounds(new anychart.math.Rect(0, 0, 1157, 622));
  label.draw();

  label.listen('invalidated', function() {
    label.draw();
  });
}

var background;
function load() {
  background = new anychart.elements.Background();
  background.container('container');
  background.draw();
  background.listen('invalidated', function() {
    background.draw();
  });
}

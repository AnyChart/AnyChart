var background;
function load() {
  background = new anychart.elements.Background();
  background.container('container');
  background.draw();

  background.listenSignals(function() {
    background.draw();
  });
}

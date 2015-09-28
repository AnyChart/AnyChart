var scroller;
anychart.onDocumentReady(function() {
  var stage = anychart.graphics.create('container');

  scroller = anychart.ui.scroller();
  scroller.setRange(0.25, 0.75);
  scroller.selectedFill('red');
  scroller.fill('green');
  scroller.container(stage).draw();

  scroller.listen('scrollerchangestart', handle);
  scroller.listen('scrollerchange', handle);
  scroller.listen('scrollerchangefinish', handle);
});

function handle(e) {
  console.log(e.source, e.type, e.startRatio, e.endRatio);
}

var stage = null;

anychart.onDocumentReady(function() {
  stage = acgraph.create('container');
  stage.text(100, 100, 'Coming soon...').fontSize(20);
  stage.html(100, 125, 'See <span style="color: #0000ff; text-decoration: underline;">roadmap</span> for more details')
      .fontSize(20)
      .cursor('pointer')
      .listen('click', function() {
        var win = window.open('http://www.anychart.com/support/roadmap.php', '_blank');
        win.focus();
      });
});

anychart.onDocumentReady(function() {
  if (stage.listenOnce) {
    stage.listenOnce(anychart.events.EventType.CHART_DRAW, function() {
      console.log('chart draw');
    });
  }else {
    acgraph.events.listenOnce(stage, acgraph.events.EventType.RENDER_FINISH, function (e){
      console.log('chart draw');
    });

    stage.render();
  }
});
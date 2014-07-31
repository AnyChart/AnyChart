anychart.onDocumentReady(function() {
  var stage = acgraph.create('container', '100%', '100%');
  stage.text(100, 100, 'Coming soon...').fontSize(20);
  stage.html(100, 125, 'See <span style="color: #0000ff; text-decoration: underline;">roadmap</span> for more details')
      .fontSize(20)
      .cursor('pointer')
      .listen('click', function() {
        window.location.href = 'http://www.anychart.com/support/roadmap.php';
      });
});

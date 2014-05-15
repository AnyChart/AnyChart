var title;

function load() {
  title = new anychart.elements.Title();
  title.text('AAAAAAAAA!!!!').container('container').background().fill('red').corners(10);
  title.margin(0).padding(10).hAlign('center').vAlign('center');
  title.draw();
  // еще можно поломать все меняя ориентацию и положение тайтла, если его ширина не фиксирована
  title.listen('invalidated', function() { title.draw(); });
}

function q() {
  title.silentlyInvalidate(0xffff);
  // вместо title.silentlyInvalidate(0xffff); можно написать и title.width(300).width(null)
  title.draw();
}

function w() {
  var q = title.container_.data();
  title.container_.dispose();
  var a = acgraph.create().container('container');
  a.data(q);
}

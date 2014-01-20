var title;

function load() {
  title = new anychart.elements.Title();
  title.text('I\'m a title text!!\nHAY!!').container('container').background().fill('red 0.3').corners(10);
  title.margin(10).padding(10).hAlign('center').vAlign('center').width(200).height(100);
  title.draw();
  // еще можно поломать все меняя ориентацию и положение тайтла, если его ширина не фиксирована
  title.listen('invalidated', function() { title.draw(); });
}

function oo(value) {
  title.orientation(value);
}

function aa(value) {
  title.align(value);
}

function mm(side, value) {
  title.margin()[side](value);
}

function pp(side, value) {
  title.padding()[side](value);
}

var title, rect, rect2, bg;

function load() {
  title = new anychart.elements.Title();
  title.text('Line chart with Logarithmic Y-Axis and Data Labels').container('container').background().enabled(false).fill('red 0.3').corners(10);
  title.margin(0).padding(0);
  //title.hAlign('center').vAlign('center');
  //  title.height(100);
  //  title.width(100);
  //title.background().enabled(true);
  title.draw();
  rect = title.container().rect();
  rect2 = title.container().rect();
  rect.setBounds(title.getContentBounds());
  rect2.setBounds(title.getRemainingBounds());
  bg = title.background();
  // еще можно поломать все меняя ориентацию и положение тайтла, если его ширина не фиксирована
  title.listen('signal', function() {
    title.draw();
    rect.setBounds(title.getContentBounds());
    rect2.setBounds(title.getRemainingBounds());
    console.log(title.getContentBounds().height, title.getContentBounds().width);
  });
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

function qq(value) {
  title.enabled(value);
}

function qwer() {
//  bg.suspendSignalsDispatching();
  bg.suspendSignalsDispatching();
  bg.enabled(false);
  bg.resumeSignalsDispatching(true);
  bg.fill('green');
  bg.enabled(true);
//  bg.resumeSignalsDispatching(true);
}

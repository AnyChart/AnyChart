var charts=[];
var radiusPixel = 0;
var pointsSumm;
var data = [];
function load() {
  var container = 'container';
  var stage = acgraph.create(800, 800, container);
  var layer = acgraph.layer();
  stage.rect(1, 1, stage.width() - 2, stage.height() - 2).fill('none').stroke('0.5 #000');
  /////////////////////////////////////////////////////////

  var chartsGridSize = [4, 6];
  var chartsGridItemSize = {
    w: stage.width() / chartsGridSize[0],
    h: stage.height() / chartsGridSize[1]
  };

  var chartTypes = ['column', 'line', 'area', 'spline'];

  for (var i =0; i< chartsGridSize[0]; i++) {
    for (var j = 0; j < chartsGridSize[1]; j++) {
      var chart = new anychart.cartesian.Chart();
      chart.bounds(i*chartsGridItemSize.w, j*chartsGridItemSize.h, chartsGridItemSize.w, chartsGridItemSize.h);
      chart.title(null);
      chart.yScale().maximum(1.2).ticks().count(3);
      chart.xScale().ticks().interval(4);
      chart.xAxis().title(null);
      chart.yAxis().title(null);
      // grid series
      chart.grid()
          .oddFill('none')
          .evenFill('none')
          .stroke('grey .1');
      chart.grid()
          .scale(chart.xScale())
          .direction('vertical')
          .oddFill('none')
          .evenFill('none')
          .stroke('grey .3');
      chart.rangeMarker().from(0.2).to(0.9).fill('grey 0.3');
      // series
      chart[chartTypes[i%chartTypes.length]](getDataFromSomeSource())
        .tooltip(null)
          .markers()
          .enabled(false);
      // draw
      chart.background(null).margin(0).container(stage).draw();
    }
  }

//  stage.listen(acgraph.events.EventType.CLICK, streaming);

  // add watermark
  var watermark = new anychart.elements.Label();
  watermark.text('AnyChart Trial Version')
      .fontOpacity(.05)
      .adjustFontSize(true, false)
      .width('100%')
      .height('100%')
      .vAlign('center')
      .hAlign('center')
      .parentBounds(stage.getBounds())
      .padding(20)
      .hoverable(false)
      .container(stage)
      .draw();
}

function getDataFromSomeSource(){
  var data_ = [];
  for(var length = random(20,40), i=0; i< length;i++)
    data_.push({'x': (length + i)%24, 'y': Math.random()});
  return data_;
}

function random(min, max){
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
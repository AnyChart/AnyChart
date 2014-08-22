function load() {
  var q = 0;
  function checkLinear(a, b) {
    var scale = new anychart.scales.Linear();
    scale.minimumGap(0).maximumGap(0);
    scale.resetDataRange().extendDataRange(a, b);
    var min = Math.min(a, b);
    var max = Math.max(a, b);
    var dMin = (min - scale.minimum()) / (max - min) * 100;
    var dMax = (scale.maximum() - max) / (max - min) * 100;
    //if (dMin > 20 || dMax > 20) {
    console.log([dMin, dMax], [min, max], [scale.minimum(), scale.maximum()], [scale.ticks().get().length, scale.minorTicks().get().length], scale.ticks().get(), scale.minorTicks().get());
      //q++;
    //}
  }
  function checkLog(a, b) {
    var scale = new anychart.scales.Logarithmic();
    scale.logBase(10);
    scale.minimumGap(0).maximumGap(0);
    scale.resetDataRange().extendDataRange(a, b);
    scale.minorTicks().mode('linear');
    var min = Math.min(a, b);
    var max = Math.max(a, b);
    var dMin = (min - scale.minimum()) / (max - min) * 100;
    var dMax = (scale.maximum() - max) / (max - min) * 100;
    //if (dMin > 20 || dMax > 20) {
    console.log([min, max], [scale.minimum(), scale.maximum()], scale.ticks().get(), scale.minorTicks().get());
    //q++;
    //}
  }

  checkLog(0, 1);
  checkLog(0.1, 0.3);
  checkLog(0.6, 0.8);
  checkLog(0.4, 0.6);
  checkLog(0, 10);
  checkLog(0, 100);
  checkLog(0, 1000);
  checkLog(500, 1000);
  checkLog(600, 1000);
  checkLog(600, 800);
  checkLog(100, 300);
  checkLog(300, 400);
  checkLog(800, 900);
  console.log('---------------');
  checkLog(0.023, 0.9982);
  checkLog(0.1572, 0.3763);
  checkLog(0.66734, 0.837456);
  checkLog(0.37897, 0.663456);
  checkLog(0.0001, 0.0008);
  checkLog(15236, 123578);
  //checkLinear(0, 1);
  //checkLinear(0.1, 0.3);
  //checkLinear(0.6, 0.8);
  //checkLinear(0.4, 0.6);
  //checkLinear(0, 10);
  //checkLinear(0, 100);
  //checkLinear(0, 1000);
  //checkLinear(500, 1000);
  //checkLinear(600, 1000);
  //checkLinear(600, 800);
  //checkLinear(100, 300);
  //checkLinear(300, 400);
  //checkLinear(800, 900);
  //console.log('---------------');
  //checkLinear(0.023, 0.9982);
  //checkLinear(0.1572, 0.3763);
  //checkLinear(0.66734, 0.837456);
  //checkLinear(0.37897, 0.663456);
  //checkLinear(0.0001, 0.0008);
  //checkLinear(15236, 123578);
  //var times = 40;
  //var time = +new Date();
  //for (var i = 0; i < times; i++) {
  //  checkLinear(Math.random() * 1000, Math.random() * 100000);
  //}
  //console.log(new Date() - time, q / times);
}


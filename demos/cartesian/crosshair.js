var chart;

function load() {
  chart = anychart.cartesianChart();

  chart.title().enabled(true).text('Extra Axes Units Comparison Sample');

  chart.label()
      .padding(10,0)
      .position('topright')
      .anchor('topright')
      .offsetY(15)
      .offsetX(25)
      .width(200)
      .hAlign('center')
      .text('The chart shows different\nice cream cones (with a\ndelicious crispy  taste) sales\nvolume.')
      .background()
      .enabled(true)
      .fill(null)
      .stroke('2 gold')
      .cornerType('roundInner')
      .corners(15);

  // additional axes settings
  var FahrenheitScale = anychart.scales.linear();
  FahrenheitScale.minimum(-260).maximum(3000);
  FahrenheitScale.ticks().interval(500);

  var CelsiumScale = anychart.scales.linear();
  CelsiumScale.minimum(-274)
      .maximum(1500)
      .ticks()
      .interval(500);
  CelsiumScale.minorTicks().interval(100);

  var KelvinScale = anychart.scales.linear();
  KelvinScale.minimum(0)
      .maximum(2000)
      .ticks()
      .interval(500);
  KelvinScale.minorTicks().interval(100);

  chart.xAxis()
      .scale(FahrenheitScale)
      .title()
      .text('Fahrenheit');

  // adjusting axes
  chart.xAxis(1).title().text('Celsium');
  chart.xAxis(1)
      .orientation('top')
      .scale(CelsiumScale);

  chart.xAxis(2)
      .scale(KelvinScale)
      .orientation('top')
      .title()
      .text('Kelvin');


  // adding grid
  chart.grid()
      .stroke('black')
      .layout('horizontal')
      .evenFill(null)
      .oddFill(null);

  // setting data
  var data = anychart.data.set([
    ["Absolute Zero", 0],
    ["Lowest recorded surface temperature on Earth", 184],
    ["Celsius / Fahrenheit's 'cross-over' temperature", 233.15],
    ["Ice melts", 273.15],
    ["Average human body temperature", 309.95],
    ["Highest recorded surface temperature on Earth", 331],
    ["Water boils", 373.1339],
    ["Titanium melts", 1941]
  ]);
  chart.yScale(anychart.scales.ordinal());
  chart.yScale().inverted(true);
  chart.yAxis().title().enabled(false);
  chart.yAxis().orientation('right');

  // setting and adjusting data visualisation
  var markerSeries = chart.marker(data.mapAs({x: [1], value: [0]}));
  markerSeries.tooltip().contentFormatter(function(){
    return this.value+
        '\nKelvin: '+ (this.x).toFixed(2) +
        '\nCelsium: '+ (this.x - 273.15).toFixed(2) +
        '\nFahrenheit: ' + ((this.x - 273.15)*1.8000 + 32).toFixed(2);
  });
  markerSeries.xScale(KelvinScale).yScale(chart.yScale());
  markerSeries.size(5).hoverSize(7);

  chart.lineMarker()
      .stroke('1 red')
      .layout('vertical')
      .scale(CelsiumScale);
  chart.lineMarker(1)
      .stroke('1 green')
      .layout('vertical')
      .scale(FahrenheitScale);

  chart.background().fill(null);
  //chart.background().fill('green .3').enabled(true);

  //chart.crosshair().xLabel().anchor('tl')
  //chart.crosshair().xLabel().axisIndex(1);

  chart.container('container');
  //chart.crosshair().enabled(false);
  chart.padding(0, 20, 0, 0).draw();

  //chart.background('red');
  //chart.background().enabled(false);

  chart.crosshair().enabled(true);

  //chart.crosshair().yLabel().textFormatter(function() {
  //  var value = +(this.value/100000000000).toFixed(1);
  //  if (value > 0)
  //    value = (this.value/100000000000).toFixed(1) + ' 000 bil1.';
  //  return '$' + value;
  //});

  //chart.crosshair().xLabel().padding(10);

  //chart.crosshair().xLabel().axisIndex(1);
  //chart.crosshair().yLabel().axisIndex(1);
  chart.crosshair().yLabel().anchor('rc')

  //chart.crosshair().yLabel().textFormatter(function(value) {
  //  var date = new Date(value['rawValue']);
  //  var options = {year: 'numeric'};
  //  return date.toLocaleDateString('en-US', options);
  //});

  //chart.crosshair().yLabel().textFormatter(function() {
  //  return this.rawValue.toFixed(4);
  //});

  //chart.crosshair().xStroke(null);
  //chart.crosshair().yStroke('none');
  //chart.crosshair().xLabel().enabled(false);
  //chart.crosshair().yLabel().enabled(false);

  console.log(chart.crosshair_.consistency_);

  //anychart.fromJson(chart.toJson()).container('container').draw();
  anychart.fromXml(chart.toXml()).container('container').draw();
}

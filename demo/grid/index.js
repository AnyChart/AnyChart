var chart, base;


function load() {
  chart = new anychart.cartesian.Chart();
  chart.container('container');
  chart.bounds(10, 10, '100%', '100%');
  chart.line([
    [1, 10],
    [2, 30],
    [3 , 5],
    [4, -6],
    [6, 23],
    [7, 15],
    [8, 24],
    [9, 19],
    [10, 29],
    [11, 2],
    [12, -10],
    [13, 5],
    [14, 17],
    [15, 21],
    [16, 25],
    [27, 37],
    [18, 30],
    [19, 27],
    [20, 35],
    [21, 40],
  ]).markers(null);

  chart.yAxis().orientation('left');
  chart.xAxis().orientation('top');
  chart.xAxis().orientation('bottom');
  chart.yAxis().orientation('right');

  chart.grid()
      .direction('horizontal')
      .invert(false)
      .minor(true);

  chart.grid()
      .direction('vertical')
      .invert(false)
      .oddFill('lightgray 0.1')
      .evenFill('white 0.1');

  chart.draw();
}
var chart;
function load() {
  var data = [
    {value: '1', exploded: false},
    {value: '2', exploded: false},
    {value: '3', exploded: false},
    {value: '4', exploded: true},
    {value: '5', exploded: false},
    {value: '6', exploded: false}
  ];

  chart = new anychart.pie.Chart(data);
  chart
      .container('container')
      .title('Pie Chart Demo')
      .explode(30)
      .otherPointFilter(function(val) { return val > 3; })
      .otherPointType('group')
      .sort('desc')
      .draw()
      .palette(['red', 'green', 'blue']);

}

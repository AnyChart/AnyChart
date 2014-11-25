anychart.onDocumentReady(function() {
  var dataSet = anychart.data.set([
    {x: 'a', value: 10},
    {x: 'b', value: 20},
    {x: 'c', value: 15},
    {x: 'd', value: 10},
    {x: 'e', value: 15}
  ]);


  var chart = anychart.columnSet);
  chart.container('container');
  chart.draw();

  //data set operations
  dataSet.append({x: 'f', value: 30});
  dataSet.insert({x: 'g', value: 30}, 1);
  dataSet.remove(2);//should be 'b'

  //data view operation
  var view = dataSet.mapAs(); //return default data view, same call as in anychart.columnChart method

  view.set(1, 'value', 40); //should update 'g' point value
  view.set(1, 'fill', 'gray'); //should update 'g' point fill

  var index = view.find('x', 'e'); //find 'e' point index value (can be used for any field, x, value, fill, or any other)
  view.set(index, 'value', 13);    //should update 'e' point value
  view.set(index, 'fill', 'gray'); //should update 'e' point fill
});


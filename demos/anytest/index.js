var chart1, chart2, chart3, chart4;
anychart.onDocumentLoad(function() {
  anytest.setUp(500,500);

  chart1 = anychart.map();
  chart1.geoData(anychart.maps.australia);
  chart1.axes().left()
      .enabled(true);
  chart1.axes().left().ticks({length:10, position:'in', stroke:'3 green .7'});
  chart1.bounds(0,0,'50%', '50%');
  anytest.drawInStage(chart1);

  chart2 = anychart.map();
  chart2.geoData(anychart.maps.australia);
  chart2.axes().enabled(true);
  chart2.axes().right().minorTicks({length: 20, stroke:'5 yellow .7', position:'in'});
  chart2.bounds('50%',0,'50%', '50%');
  anytest.drawInStage(chart2);

  chart3 = anychart.map();
  chart3.geoData(anychart.maps.australia);
  chart3.axes().top(true);
  chart3.axes().top().minorTicks()
      .enabled(true)
      .stroke('1 red')
      .length(10)
      .position('in');
  chart3.axes().top().minorLabels()
      .enabled(true)
      .rotation(10)
      .offsetY(-30)
      .anchor('centerBottom')
      .fontColor('#B8008A');
  chart3.bounds(0,'50%','50%', '50%');
  anytest.drawInStage(chart3);

  chart4 = anychart.map();
  chart4.geoData(anychart.maps.canada);
  chart4.axes().enabled(true)
      .ticks(null)
      .labels(null)
      .minorTicks({enabled:true, position:'out', length:4, stroke: 'blue'});
  chart4.axes().top().labels()
      .enabled(true)
      .rotation(-90)
      .anchor('centerTop')
      .padding(0)
      .fontSize(7)
      .fontColor('#B8008A');
  chart4.axes().left().labels()
      .enabled(true)
      .fontColor('#008AB8');
  chart4.bounds('50%','50%','50%', '50%');
  anytest.drawInStage(chart4);

  anytest.stageListen(function() {
    anytest.step(function(){
      anytest.CAT.getScreen();
    });
    anytest.step(function(){
      chart1.axes().left().ticks({length:5, position:'in', stroke:'3 green .7'}); // length
      chart2.axes().right().minorTicks({length: 20, stroke:'5 yellow .7', position:'out'}); //position
      chart3.axes().top().minorTicks()
          .enabled(true)
          .stroke('1 red')
          .length(10)
          .position('out'); // position
      chart4.axes().ticks({length: 5, position:'in', stroke:'3 orange .7'})
          .labels({fontColor: '#8A00B8'});
      chart4.axes().minorTicks({enabled:true, position:'out', length:4, stroke: '2 blue'});//stroke
      anytest.CAT.getScreen('afterDrawChangeTicks', -1);
    });

    anytest.exit();

  }).charts4modes('chart1', 'chart2', 'chart3', 'chart4');
  stage.resume();
});
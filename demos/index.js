anychart.onDocumentReady(function() {
  // anychart.licenseKey('test-key-32db1f79-cc9312c4');

  stage = anychart.graphics.create('container', 550, 600);

  var data1 = anychart.data.set([
    [1, 760, 801, 848, 895, 965],
    [2, 733, 853, 939, 980, 1080, [1120, 630]],
    [3, 760, 801, 848, 895, 965, [-1]],
    [4, 724, 802, 806, 871, 950, [1000, 600]],
    [5, 834, 836, 864, 882, 910, [980]]
  ]);

  var data2 = anychart.data.set([
    [1, 735, 850, 935, 980, 1200, [650]],
    [2, 750, 800, 850, 880, 960],
    [3, 850, 850, 870, 890, 930, [650, 720, 950, 980]],
    [4, 720, 760, 830, 875, 925],
    [5, 750, 820, 825, 875, 955]
  ]);


  chart1 = anychart.cartesian();
  var box1 = chart1.box(data1);
  box1.fill('yellow').stroke('#228B22 .8');
  box1.markers({enabled: true, type: 'circle'});
  chart1.bounds(0, 0, '50%', '50%');
  chart1.container(stage).draw();

  chart2 = anychart.box();
  var box2 = chart2.box(data2);
  box2.labels()
      .enabled(true)
      .anchor('bottom');
  box2.stemStroke('blue', 4);
  chart2.bounds('50%', 0, '50%', '50%');
  chart2.container(stage).draw();

  chart3 = anychart.box();
  var box3 = chart3.box(data1);
  box3.markers('true');
  box3.whiskerStroke('red', 5)
      .whiskerWidth(50);
  box3.markers().type('circle');
  chart3.bounds(0, '46%', '100%', '54%');
  chart3.container(stage).draw();


  xml1 = chart1.toXml(false, false);
  // chart1.dispose();
  xml2 = chart2.toXml(false, false);
  // chart2.dispose();
  xml3 = chart3.toXml(false, false);
  // chart3.dispose();

  stage2 = anychart.graphics.create('container1', 550, 600);

  chart1 = anychart.fromXml(xml1);
  chart1.container(stage2).draw();

  chart2 = anychart.fromXml(xml2);
  chart2.container(stage2).draw();

  chart3 = anychart.fromXml(xml3);
  chart3.container(stage2).draw();
});

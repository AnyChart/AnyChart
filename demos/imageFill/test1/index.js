var chart;
anychart.onDocumentLoad(function() {
  var stage = acgraph.create('container');
  stage.suspend();
  stage.image('https://wallpaperscraft.com/image/miranda_lambert_country_music_association_awards_singer_105529_3840x2400.jpg', 0, 0, 130, 100);
  //stage.rect(0, 0, 130, 100).fill({src: 'https://wallpaperscraft.com/image/miranda_lambert_country_music_association_awards_singer_105529_3840x2400.jpg'});
  stage.listen('stagerendered', function(e){console.log(e.type)});
  stage.listen('renderfinish', function(e){console.log(e.type)});
  stage.listen('renderstart', function(e){console.log(e.type)});
  stage.listen('stageresize', function(e){console.log(e.type)});
  stage.resume();
});

function a(a) {
  var config = chart.toJson(false, !!a);
  console.log(config);
  chart.dispose();
  chart = anychart.fromJson(config);
  chart.container('container').draw();
}

function b(a) {
  var config = chart.toXml(false, !!a);
  console.log(config);
  chart.dispose();
  chart = anychart.fromXml(config);
  chart.container('container').draw();
}


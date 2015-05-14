var chart, stage;

var setTooltip = function(series){
  series.tooltip().content().useHtml(true);
  series.tooltip().contentFormatter(function(){
    var revenue1 = '21$';
    var revenue2 = '234$';
    var revenue3 = '5345$';
    var revenue4 = '345$';

    var span_with_styles = '<span style="color: #212121; font-size: 14px">';

    return '<span style="color: #929292; font-size: 13px">' + this.x + '</span><br/>' +
        span_with_styles + 'Florida: </span>' + revenue1 + '<br/>'+
        span_with_styles + 'Texas: </span>' + revenue2 + '<br/>'+
        span_with_styles + 'Nevada: </span>' + revenue3 + '<br/>'+
        span_with_styles + 'Arizona: </span>' + revenue4;
  });
};


anychart.onDocumentReady(function() {
  stage = acgraph.create('container');
  //stage.suspend();
  //chart = anychart.line([1, 3, 4]);
  //
  //var revenue1 = '21$';
  //var revenue2 = '234$';
  //var revenue3 = '5345$';
  //var revenue4 = '345$';
  //
  //
  //var span_with_styles = '<span style="color: #212121; font-size: 14px">';
  //
  //chart.title().useHtml(true).text((function(){
  //  return '<span style="color: #929292; font-size: 13px">' + 0 + '</span><br/>' +
  //      span_with_styles + 'Florida: </span>' + revenue1 + '<br/>'+
  //      span_with_styles + 'Texas: </span>' + revenue2 + '<br/>'+
  //      span_with_styles + 'Nevada: </span>' + revenue3 + '<br/>'+
  //      span_with_styles + 'Arizona: </span>' + revenue4;
  //})());
  //
  //chart.title().background().enabled(true).fill(null);
  //
  //setTooltip(chart.getSeries(0));
  //
  //chart.container('container').draw();

  var text;

  text = stage.html(20, 20,
      '<br><br>1<br><br>' +
      '12111<br><br><br>' +
      '2<br><br>' +
      '2<br>' +
      '2'
  ).textWrap(acgraph.vector.Text.TextWrap.BY_LETTER).width(30);

  stage.rect().setBounds(text.getBounds()).fill(null);


  text = stage.text(60, 20,
      '\n\n1\n\n' +
      '12111\n\n\n' +
      '2\n\n' +
      '2\n' +
      '2'
  ).textWrap(acgraph.vector.Text.TextWrap.BY_LETTER).width(30);

  stage.rect().setBounds(text.getBounds()).fill(null);




  text = stage.html(120, 20,
      '1<br><br>' +
      '12111<br><br><br>' +
      '2<br><br>' +
      '2<br>' +
      '2<br><br>'
  ).textWrap(acgraph.vector.Text.TextWrap.BY_LETTER).width(30);

  stage.rect().setBounds(text.getBounds()).fill(null);


  text = stage.text(160, 20,
      '1\n\n' +
      '12111\n\n\n' +
      '2\n\n' +
      '2\n' +
      '2\n\n'
  ).textWrap(acgraph.vector.Text.TextWrap.BY_LETTER).width(30);

  stage.rect().setBounds(text.getBounds()).fill(null);




  text = stage.html(220, 20,
      '1<br><br>' +
      '12111<br><br><br>' +
      '2<br><br>' +
      '2<br>' +
      '2<br><br>'
  ).textWrap(acgraph.vector.Text.TextWrap.BY_LETTER);

  stage.rect().setBounds(text.getBounds()).fill(null);


  text = stage.text(260, 20,
      '1\n\n' +
      '12111\n\n\n' +
      '2\n\n' +
      '2\n' +
      '2\n\n'
  ).textWrap(acgraph.vector.Text.TextWrap.BY_LETTER);

  stage.rect().setBounds(text.getBounds()).fill(null);





  text = stage.html(320, 20,
      '<br><br>1<br><br>' +
      '12111<br><br><br>' +
      '2<br><br>' +
      '2<br>' +
      '2'
  ).textWrap(acgraph.vector.Text.TextWrap.BY_LETTER);

  stage.rect().setBounds(text.getBounds()).fill(null);


  text = stage.text(360, 20,
      '\n\n1\n\n' +
      '12111\n\n\n' +
      '2\n\n' +
      '2\n' +
      '2'
  ).textWrap(acgraph.vector.Text.TextWrap.BY_LETTER);

  stage.rect().setBounds(text.getBounds()).fill(null);






  text = stage.html(420, 20,
      '<br><br>1<br><br>' +
      '12111<br><br><br>' +
      '2<br><br>' +
      '2<br>' +
      '2'
  ).textWrap(acgraph.vector.Text.TextWrap.NO_WRAP);

  stage.rect().setBounds(text.getBounds()).fill(null);


  text = stage.text(460, 20,
      '\n\n1\n\n' +
      '12111\n\n\n' +
      '2\n\n' +
      '2\n' +
      '2'
  ).textWrap(acgraph.vector.Text.TextWrap.NO_WRAP);

  stage.rect().setBounds(text.getBounds()).fill(null);





  text = stage.html(520, 20,
      '1<br><br>' +
      '12111<br><br><br>' +
      '2<br><br>' +
      '2<br>' +
      '23' +
      '44<br>' +
      '444'
  ).textWrap(acgraph.vector.Text.TextWrap.BY_LETTER);

  stage.rect().setBounds(text.getBounds()).fill(null);


  text = stage.text(560, 20,
      '1\n\n' +
      '12111\n\n\n' +
      '2\n\n' +
      '2\n' +
      '23' +
      '44\n' +
      '444'
  ).textWrap(acgraph.vector.Text.TextWrap.BY_LETTER);

  stage.rect().setBounds(text.getBounds()).fill(null);



  //stage.resume();
});
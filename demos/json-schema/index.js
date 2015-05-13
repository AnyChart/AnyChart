var validate;
$(document).ready(function() {
  var json, schema, rootSchema, resultEditor, jsonEditor, schemaEditor, chart;

  resultEditor = ace.edit("result");
  resultEditor.setTheme("ace/theme/monokai");
  resultEditor.setReadOnly(true);
  resultEditor.getSession().setMode("ace/mode/json");

  var data = [
    {x: 'P1' , value: '128.14', stroke: "black"},
    ['P2' , '112.61'],
    ['P3' , '163.21'],
    ['P4' , '229.98'],
    ['P5' , '90.54'],
    ['P6' , '104.19'],
    ['P7' , '150.67'],
    ['P8' , '120.43'],
    ['P9' , '143.76'],
    ['P10', '191.34'],
    ['P11', '134.17'],
    ['P12', '145.72'],
    ['P13', '222.56'],
    ['P14', '187.12'],
    ['P15', '154.32'],
    ['P16', '133.08']
  ];

    var data = [
      {x: 'East Europe', low: 1, q1: 5, median: 8, q3: 12, high: 16},
      {x: 'West Europe', low: 1, q1: 7, median: 10, q3: 17, high: 22},
      {x: 'Australia', low: 1, q1: 8, median: 12, q3: 19, high: 26},
      {x: 'South America', low: 2, q1: 8, median: 12, q3: 21, high: 28},
      {x: 'North America', low: 3, q1: 10, median: 17, q3: 28, high: 30},
      {x: 'Oceania', low: 1, q1: 9, median: 16, q3: 22, high: 24},
      {x: 'North Africa', low: 1, q1: 8, median: 14, q3: 18, high: 24},
      {x: 'West Africa', low: 1, q1: 6, median: 8, q3: 13, high: 16},
      {x: 'Central Africa', low: 2, q1: 4, median: 9, q3: 12, high: 15},
      {x: 'Southern Africa', low: 1, q1: 4, median: 8, q3: 11, high: 14}
    ];

  chart = anychart.box();
    chart.background(null);

    //set container id for the chart
    chart.container('container');

    //set chart title text settings
    var colorTitle = '#929292';
    var colorAxis = '#bebebe';
    chart.title().text('Oceanic Airlines Delays December, 2014');
    chart.title().hAlign('center').fontWeight('normal').fontColor(colorTitle).fontFamily('Verdana').fontSize('16px');

    //set axes settings
    chart.xAxis().stroke(colorAxis);
    chart.xAxis().ticks().stroke(colorAxis);
    chart.xAxis().title('Salary Grades');
    chart.xAxis().title().text('Directions').fontWeight('normal').fontFamily('Verdana').fontSize('14px').fontColor(colorAxis);
    chart.xAxis().staggerMode(true);

    chart.yAxis().title().text('Delay in minutes').fontWeight('normal').fontFamily('Verdana').fontSize('14px');
    chart.yAxis().labels().fontColor(colorAxis);

    chart.yAxis().stroke(colorAxis);
    chart.yAxis().ticks().stroke(colorAxis);
    chart.yAxis().minorTicks().stroke(colorAxis);
    chart.yAxis().labels().fontColor(colorTitle);
    chart.xAxis().labels().fontColor(colorTitle);
    chart.yAxis().title().fontColor(colorAxis);

    chart.grid().stroke('#DEDEDE').oddFill(null).evenFill(null).zIndex(10.1);
    chart.minorGrid().stroke('#ECECEC').zIndex(10);

    //create box chart series with our data
    var series = chart.box(data);
    series.fill('#82BECA');
    series.stroke(null);

    //hide whisker
    series.whiskerWidth(0);
    series.hoverWhiskerWidth(0);
    series.stemStroke('#474747');
    series.medianStroke('2 #474747');

    //initiate chart drawing
    chart.draw();

  var config = chart.toJson();


  validate = function() {
    json = jsonEditor.getValue();
    schema = JSON.parse(schemaEditor.getValue());

    //$.ajax({
    //  type: "POST",
    //  url: "http://localhost:8080/validate",
    //  data: {config: json, schema: schema},
    //  crossDomain: true,
    //  success: function(data) {
    //    resultEditor.setValue(JSON.stringify(data, undefined, 4), 1);
    //    resultEditor.clearSelection();
    //  },
    //  dataType: "json"
    //});

    //var validResp = tv4.validateMultiple(JSON.parse(json), JSON.parse(schema));
    var validResp;

    validResp = tv4.validateMultiple(schema, rootSchema);
    if (validResp.valid) {
      validResp = tv4.validateMultiple(config, schema);
    }

    resultEditor.setValue(JSON.stringify(validResp, undefined, 4), 1);
    resultEditor.clearSelection();
  };


  $('#json').html(JSON.stringify(config, undefined, 4));

  jsonEditor = ace.edit("json");
  jsonEditor.setTheme("ace/theme/monokai");
  jsonEditor.getSession().setMode("ace/mode/json");

  $.getJSON("rootSchema.json", function(data) {
    rootSchema = data;

    $.getJSON("../../json-schema.json", function(data) {
      schema = JSON.stringify(data, undefined, 4);
      $('#schema').html(schema);

      schemaEditor = ace.edit("schema");
      schemaEditor.setTheme("ace/theme/monokai");
      schemaEditor.getSession().setMode("ace/mode/json");

      validate();
    });
  });


  //$.getJSON("config1.json", function(data) {
  //  json = JSON.stringify(data, undefined, 4);
  //  $('#json').html(json);
  //
  //  jsonEditor = ace.edit("json");
  //  jsonEditor.setTheme("ace/theme/monokai");
  //  jsonEditor.getSession().setMode("ace/mode/json");
  //
  //  $.getJSON("json-schema.json", function(data) {
  //    schema = JSON.stringify(data, undefined, 4);
  //    $('#schema').html(schema);
  //
  //    schemaEditor = ace.edit("schema");
  //    schemaEditor.setTheme("ace/theme/monokai");
  //    schemaEditor.getSession().setMode("ace/mode/json");
  //
  //    validate();
  //  });
  //});
});

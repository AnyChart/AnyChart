var validate;
$(document).ready(function() {
  var json, schema, resultEditor, jsonEditor, schemaEditor;

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

  var chart = anychart.polar();
  chart.container('container');
  chart.title().text('Bar Chart');

  chart.area(data);
  //chart.bar(data);
  //chart.bubble(data);
  //chart.candlestick(data);
  //chart.column(data);
  //chart.line(data);
  //chart.marker(data);
  //chart.ohlc(data);
  //chart.rangeArea(data);
  //chart.rangeBar(data);
  //chart.rangeColumn(data);
  //chart.rangeSplineArea(data);
  //chart.rangeStepArea(data);
  //chart.spline(data);
  //chart.splineArea(data);
  //chart.stepArea(data);
  //chart.stepLine(data);

  chart.draw();
  var config = chart.toJson();



  validate = function() {
    json = jsonEditor.getValue();
    schema = schemaEditor.getValue();

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

    var validResp = tv4.validateMultiple(JSON.parse(json), JSON.parse(schema));


    resultEditor.setValue(JSON.stringify(validResp, undefined, 4), 1);
    resultEditor.clearSelection();
  };


  //$('#json').html(JSON.stringify(config, undefined, 4));
  //
  //jsonEditor = ace.edit("json");
  //jsonEditor.setTheme("ace/theme/monokai");
  //jsonEditor.getSession().setMode("ace/mode/json");
  //
  //$.getJSON("json-schema.json", function(data) {
  //  schema = JSON.stringify(data, undefined, 4);
  //  $('#schema').html(schema);
  //
  //  schemaEditor = ace.edit("schema");
  //  schemaEditor.setTheme("ace/theme/monokai");
  //  schemaEditor.getSession().setMode("ace/mode/json");
  //
  //  validate();
  //});


  $.getJSON("config1.json", function(data) {
    json = JSON.stringify(data, undefined, 4);
    $('#json').html(json);

    jsonEditor = ace.edit("json");
    jsonEditor.setTheme("ace/theme/monokai");
    jsonEditor.getSession().setMode("ace/mode/json");

    $.getJSON("json-schema.json", function(data) {
      schema = JSON.stringify(data, undefined, 4);
      $('#schema').html(schema);

      schemaEditor = ace.edit("schema");
      schemaEditor.setTheme("ace/theme/monokai");
      schemaEditor.getSession().setMode("ace/mode/json");

      validate();
    });
  });
});

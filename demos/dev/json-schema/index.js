var validate;
$(document).ready(function() {
  var json, schema, resultEditor, jsonEditor, schemaEditor;

  resultEditor = ace.edit("result");
  resultEditor.setTheme("ace/theme/monokai");
  resultEditor.setReadOnly(true);
  resultEditor.getSession().setMode("ace/mode/json");


  validate = function() {
    json = jsonEditor.getValue();
    schema = schemaEditor.getValue();
    $.ajax({
      type: "POST",
      url: "http://localhost:8080/validate",
      data: {config: json, schema: schema},
      crossDomain: true,
      success: function(data) {
        resultEditor.setValue(JSON.stringify(data, undefined, 4), 1);
        resultEditor.clearSelection();
      },
      dataType: "json"
    });
  };


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

var min = 1900;
var max = 2000;
var i, len, parent_settings, custom_settings, tap_panes, parent, tab_panel;

var components = ['Chart', 'Scale', 'Axes', 'Grids', 'Crosshair'];
var axes = [null, 'top', 'right', 'bottom', 'left'];
var grids = [null, 'vertical', 'horizontal'];
var maps = {
  'World_source': 'http://cdn.anychart.com/geodata/1.2.0/custom/world_source/world_source.js',
  'World': 'http://cdn.anychart.com/geodata/1.2.0/custom/world/world.js'
};

function getMaps(list) {
  var countries = list['countries'];
  var keys = Object.keys(countries);
  var cdn_url = 'http://cdn.anychart.com/geodata/1.2.0/countries/';

  for (var i = 0; i < keys.length; i++) {
    maps[keys[i]] = cdn_url + keys[i] + '/' + countries[keys[i]]['js'];
  }

  $(document).ready(function() {
    init();
  });
}

(function() {
  $.ajax({
    type: 'GET',
    url: 'http://cdn.anychart.com/geodata/1.2.0/countries.json',
    success: function(json) {
      getMaps(json);
    }
  });
})();

function drawChart() {
  anychart.licenseKey('test-key-32db1f79-cc9312c4');

  stage = anychart.graphics.create('container');
  stage.credits(false);

  chart = anychart.map();
  // chart.crs(anychart.enums.MapProjections.BONNE);
  chart.geoData('anychart.maps.world_source');

  var series = chart.choropleth(generateData());

  var scale = anychart.scales.ordinalColor([
    {less: 1907},
    {from: 1907, to: 1920},
    {from: 1920, to: 1940},
    {from: 1940, to: 1950},
    {from: 1950, to: 1960},
    {from: 1960, to: 1970},
    {from: 1970, to: 1980},
    {greater: 1980}
  ]);

  scale.colors(['#42a5f5', '#64b5f6', '#90caf9', '#ffa726', '#fb8c00', '#f57c00', '#ef6c00', '#e65100']);
  series.colorScale(scale);
  // series.labels(true);

  // chart.grids().enabled(true);
  // chart.interactivity().zoomOnMouseWheel(true);

  chart.crosshair().enabled(true).displayMode('sticky');


  // var data = [
  //   {'id': 'AU.NS', 'size': 25},
  //   {'id': 'AU.NT', 'size': 15},
  //   {'id': 'AU.WA', 'size': 83},
  //   {'id': 'AU.SA', 'size': 21},
  //   {'id': 'AU.VI', 'size': 5},
  //   {'id': 'AU.QL', 'size': 2},
  //   {'id': 'AU.TS', 'size': 90}
  // ]
  var series1 = chart.bubble([
    {lat: 67, long: 180, size: 5},
    {lat: 67, long: -180, size: 5}
  ]);

  chart.maxBubbleSize(20);
  chart.minBubbleSize(5);

  chart.container(stage).draw();


  chart.height('50%');
  chartFromXML = null;
  chart.listen(anychart.enums.EventType.CHART_DRAW, function(e) {
    if (chartFromXML) chartFromXML.dispose();
    var xml = chart.toXml();
    console.log(xml);
    chartFromXML = anychart.fromXml(xml);
    chartFromXML.bounds(0, '50%', '100%', '50%');
    chartFromXML.container(stage).draw();
  });
}

var randomExt = function(a, b) {
  return Math.round(Math.random() * (b - a + 1) + a);
};

var generateData = function() {
  var data = [];
  features = chart.geoData()['features'];
  for (var i = 0, len = features.length; i < len; i++) {
    var feature = features[i];
    if (feature['properties']) {
      id = feature['properties'][chart.geoIdField()];
      data.push({'id': id, 'value': randomExt(min, max), size: randomExt(1, 100)});
    }
  }
  return data;
};

function createChosen(parent, id, label, description, items, opt_formatter, opt_callback) {
  var form = $('<div class="form-horizontal"></div>');
  form.append('<div class="form-group"><div class="col-xs-6"><label class="control-label" for="' + id + '">' + label + '</label></div><div class="col-xs-6"><select class="chosen-select" data-placeholder="' + description + '" id="' + id + '"></select></div></div>');
  $(parent).append(form);

  var chosen = $('#' + id);

  var type = typeof items;
  var isObject = type == 'object' && items != null || type == 'function';
  var option_text;

  if (isObject) {
    for (var item in items) {
      chosen.append('<option value="' + items[item] + '">' + item + '</option>');
    }
  } else {
    for (var i = 0, len = items.length; i < len; i++) {
      item = items[i];
      option_text = opt_formatter ? opt_formatter(item) : item;
      chosen.append('<option value="' + item + '">' + option_text + '</option>');
    }
  }

  var callChain = id.split('_');
  var entry = chart;
  var value;

  for (i = 0, len = callChain.length; i < len; i++) {
    var obj = callChain[i];
    if (i == callChain.length - 1) {
      value = entry[obj]();
    } else {
      entry = entry[obj]();
    }
  }
  chosen.val(value);

  chosen.chosen({width: '100%'});

  var callback = opt_callback ? opt_callback :
      function(e) {
        var id_ = $(this).attr('id');
        var value = $(this).val();
        var callChain = id_.split('_');

        var entry = chart;
        for (var i = 0, len = callChain.length; i < len; i++) {
          var obj = callChain[i];
          if (i == callChain.length - 1) {
            entry[obj](value);
          } else {
            entry = entry[obj]();
          }
        }
      };
  chosen.chosen().change(callback);
}

function createCheckBox(parent, id, label, opt_comparator) {
  var checkbox = $('<div class="checkbox"><label><input id="' + id + '" type="checkbox"> ' + label + '</label></div>');
  $(parent).append(checkbox);

  var elem = $('#' + id);
  var callChain = id.split('_');
  var entry = chart;
  var state;

  for (var i = 0, len = callChain.length; i < len; i++) {
    var obj = callChain[i];
    if (i == callChain.length - 1) {
      state = entry[obj]().enabled != void 0 ? entry[obj]().enabled() : entry[obj]();
      if (opt_comparator) state = opt_comparator(state);
    } else {
      entry = entry[obj]();
    }
  }

  elem.attr('checked', state);
  elem.on('click', function(e) {
    var id_ = $(this).attr('id');
    var state = $(this).is(':checked');
    var callChain_ = id_.split('_');

    var entry_ = chart;
    for (var i = 0, len = callChain_.length; i < len; i++) {
      var obj_ = callChain_[i];
      if (i == callChain_.length - 1) {
        entry_[obj_](state);
      } else {
        entry_ = entry_[obj_]();
      }
    }
  });
}

function createTextInput(parent, id, label, placeHolder) {
  var form = $('<div class="form-horizontal"></div>');
  var form_group = $('<div class="form-group"><div class="col-xs-6"><label class="control-label" for="' + id + '">' + label + '</label></div></div>');
  var col = $('<div class="col-xs-6"></div>');
  var input = $('<input class="form-control" type="text" id="' + id + '" placeholder="' + placeHolder + '">');

  col.append(input);
  form_group.append(col);
  form.append(form_group);
  $(parent).append(form);

  var callChain = id.split('_');
  var entry = chart;
  var value;

  for (var i = 0, len = callChain.length; i < len; i++) {
    var obj = callChain[i];
    if (i == callChain.length - 1) {
      value = entry[obj]();
    } else {
      entry = entry[obj]();
    }
  }

  var elem = $('#' + id);
  elem.val(value);

  var callback = function(e) {
    var id_ = $(this).attr('id');
    var value = $(this).val();
    var callChain = id_.split('_');

    var entry = chart;
    for (var i = 0, len = callChain.length; i < len; i++) {
      var obj = callChain[i];
      if (i == callChain.length - 1) {
        entry[obj](value);
      } else {
        entry = entry[obj]();
      }
    }
  };

  elem.on('change', callback);
}

function createRangeInput(parent, id, label, min, max, step) {
  var form = $('<div class="form-horizontal"></div>');
  var form_group = $('<div class="form-group"><div class="col-xs-6"><label class="control-label" for="' + id + '">' + label + '</label></div></div>');
  var col = $('<div class="col-xs-6"></div>');
  var input = $('<input style="width: 100%" class="form-control"  type="text" id="' + id + '" data-slider-id="' + id + '_slider"/>');

  col.append(input);
  form_group.append(col);
  form.append(form_group);
  $(parent).append(form);

  var callChain = id.split('_');
  var entry = chart;
  var value;

  for (var i = 0, len = callChain.length; i < len; i++) {
    var obj = callChain[i];
    if (i == callChain.length - 1) {
      value = entry[obj]();
    } else {
      entry = entry[obj]();
    }
  }

  $(input).slider({
    min: min,
    max: max,
    step: step,
    value: value
  });

  var callback = function(e) {
    var id_ = $(this).attr('id');
    var value = $(this).slider('getValue');
    var callChain = id_.split('_');

    var entry = chart;
    for (var i = 0, len = callChain.length; i < len; i++) {
      var obj = callChain[i];
      if (i == callChain.length - 1) {
        entry[obj](value);
      } else {
        entry = entry[obj]();
      }
    }
  };

  input.on('change', callback);
  // $('#' + id + '_slider').css({'width': '100%'});
}

function createColorPicker(parent, id, label, placeHolder) {
  var form = $('<div class="form-horizontal"></div>');
  var form_group = $('<div class="form-group"><div class="col-xs-6"><label class="control-label" for="' + id + '">' + label + '</label></div></div>');
  var col = $('<div class="col-xs-6"></div>');
  var input = $('<div id="' + id + '" class="input-group colorpicker-component"><input class="form-control" type="text" placeholder="' + placeHolder + '"><span class="input-group-addon"><i></i></span></div>');

  col.append(input);
  form_group.append(col);
  form.append(form_group);
  parent.append(form);

  var callChain = id.split('_');
  var entry = chart;
  var value;

  for (var i = 0, len = callChain.length; i < len; i++) {
    var obj = callChain[i];
    if (i == callChain.length - 1) {
      value = entry[obj]();
    } else {
      entry = entry[obj]();
    }
  }

  var elem = $('#' + id);
  $(elem.children()[0]).val(value == 'none' ? 'transparent' : value);

  var callback = function(e) {
    var inputValue = $($(this).children()[0]).val();
    var value;
    var transparent = 'rgba(0, 0, 0, 0)';
    if (inputValue == 'none' || inputValue == 'null') {
      $(this).colorpicker('setValue', transparent);
      value = transparent;
    } else {
      value = $(this).colorpicker('getValue');
    }
    var id_ = $(this).attr('id');
    var callChain = id_.split('_');

    var entry = chart;
    for (var i = 0, len = callChain.length; i < len; i++) {
      var obj = callChain[i];
      if (i == callChain.length - 1) {
        entry[obj](value == transparent ? 'none' : value);
      } else {
        entry = entry[obj]();
      }
    }
  };
  elem.colorpicker().on('changeColor', callback);
}

function createTabPanel(parent, title, id, opt_expanded) {
  var panel = $('<div class="panel panel-default"></div>');
  var head = $('<div class="panel-heading" data-toggle="collapse" data-target="#' + id + '" aria-expanded="' + !!opt_expanded + '" aria-controls="' + id + '">' + title + '</div>');
  var body = $('<div class="panel-body collapse ' + (!!opt_expanded ? 'in' : '') + '" id="' + id + '"></div>');
  var nav_tabs = $('<ul class="nav nav-tabs" role="tablist"></ul>');
  var contentContainer = $('<div class="tab-content"></div>');

  body.append(nav_tabs).append(contentContainer);
  panel.append(head).append(body);

  $(parent).append(panel);

  return contentContainer;
}

function createPanelTab(parent, id, active) {
  active = active ? 'active"' : '';
  var tab_title = id;
  id = id.toLowerCase();

  var nav_tabs = $(parent).parent().children('.nav-tabs')[0];
  $(nav_tabs).append('<li role="presentation" class="' + active + '"><a href="#' + id + '_tab" aria-controls="' + id + '" role="tab" data-toggle="tab">' + tab_title + '</a></li>');

  var tap_panel = $('<div role="tabpanel" class="tab-pane panel-body ' + active + '" id="' + id + '_tab"></div>');
  $(parent).append(tap_panel);

  return tap_panel;
}

function createAccordion(parent, id) {
  var accordion = $('<div class="panel-group" id="' + id + '" role="tablist" aria-multiselectable="true">');
  if (parent) $(parent).append(accordion);
  return accordion;
}

function createAccordionItem(parent, id, title, opt_expanded) {
  var head = $('<div class="panel-heading ' + (opt_expanded ? '' : 'collapsed') + '" id="' + id + '" data-toggle="collapse" data-parent="#' + parent.attr('id') + '" href="#collapse_' + id + '" aria-expanded="' + !!opt_expanded + '" aria-controls="#collapse_' + id + '">' + title + '</div>');
  var contentContainer = $('<div class="panel-body"></div>');
  var body = $('<div id="collapse_' + id + '" class="panel-collapse collapse ' + (opt_expanded ? 'in' : '') + '" role="tabpanel" aria-labelledby="' + id + '"></div>');
  var panel = $('<div class="panel panel-default"></div>');
  body.append(contentContainer);
  panel.append(head).append(body);
  if (parent) $(parent).append(panel);
  return contentContainer;
}

function init() {
  drawChart();

  //root panel

  tap_panes = createTabPanel('#chart_settings', 'Settings', 'root_panel', true);
  for (i = 0, len = components.length; i < len; i++) {
    tab_panel = createPanelTab(tap_panes, components[i], components[i] == 'Chart');
  }

  //chart

  createChosen('#chart_tab', 'crs', 'Projection', 'Choose your projection ...', anychart.enums.MapProjections);
  createChosen('#chart_tab', 'geoData', 'Geo data', 'Choose map ...', maps, undefined, function(e) {
    var id_ = $(this).attr('id');
    var value = $(this).val();
    var text = $(this).find('option:selected').text();
    var callChain = id_.split('_');

    var url = value;
    geoData = 'anychart.maps.' + text.toLowerCase();

    $.ajax({
      type: 'GET',
      url: url,
      dataType: 'script',
      success: function() {

        var entry = chart;
        for (var i = 0, len = callChain.length; i < len; i++) {
          var obj = callChain[i];
          if (i == callChain.length - 1) {
            entry[obj](geoData);
          } else {
            entry = entry[obj]();
          }
        }
        chart.getSeries(0).data(generateData());
      }
    });
  });

  var chartAccordion = createAccordion('#chart_tab', 'chart_accordion');
  var chartAccordionItem = createAccordionItem(chartAccordion, 'chart_paddingAccordionItem', 'Padding', false);
  createTextInput(chartAccordionItem, 'padding_top', 'Top', 'Top');
  createTextInput(chartAccordionItem, 'padding_right', 'Right', 'Right');
  createTextInput(chartAccordionItem, 'padding_bottom', 'Bottom', 'Bottom');
  createTextInput(chartAccordionItem, 'padding_left', 'Left', 'Left');

  //scale

  createTextInput('#scale_tab', 'scale_precision', 'precision', 'precision');
  createTextInput('#scale_tab', 'scale_gap', 'gap', 'gap');

  var scaleExtremsAccordion = createAccordion('#scale_tab', 'scale_extrems_accordion');
  var scaleExtremsAccordionItem = createAccordionItem(scaleExtremsAccordion, 'scale_extremsAccordionItem', 'Extrems', true);
  createRangeInput(scaleExtremsAccordionItem, 'scale_minimumX', 'minimumX', -180, 180, 1);
  createRangeInput(scaleExtremsAccordionItem, 'scale_maximumX', 'maximumX', -180, 180, 1);
  createRangeInput(scaleExtremsAccordionItem, 'scale_minimumY', 'minimumY', -90, 90, 1);
  createRangeInput(scaleExtremsAccordionItem, 'scale_maximumY', 'maximumY', -90, 90, 1);
  // createTextInput('#scale_tab', 'scale_minimumX', 'minimumX', 'West longitude offset');
  // createTextInput('#scale_tab', 'scale_maximumX', 'maximumX', 'East longitude offset');
  // createTextInput('#scale_tab', 'scale_minimumY', 'minimumY', 'South latitude offset');
  // createTextInput('#scale_tab', 'scale_maximumY', 'maximumY', 'North latitude offset');
  createTextInput('#scale_tab', 'scale_xTicks_interval', 'X ticks interval', 'interval');
  createTextInput('#scale_tab', 'scale_xMinorTicks_interval', 'X minor ticks interval', 'interval');
  createTextInput('#scale_tab', 'scale_yTicks_interval', 'Y ticks interval', 'interval');
  createTextInput('#scale_tab', 'scale_yMinorTicks_interval', 'Y minor ticks interval', 'interval');
  createTextInput('#scale_tab', 'scale_xTicks_count', 'X ticks count', 'count');
  createTextInput('#scale_tab', 'scale_xMinorTicks_count', 'X minor ticks count', 'count');
  createTextInput('#scale_tab', 'scale_yTicks_count', 'Y ticks count', 'count');
  createTextInput('#scale_tab', 'scale_yMinorTicks_count', 'Y minor ticks count', 'count');

  //axes

  var axes_tab = $('#axes_tab');
  parent_settings = $('<div></div>');
  axes_tab.append(parent_settings);
  custom_settings = $('<div></div>');
  axes_tab.append(custom_settings);

  tap_panes = createTabPanel(custom_settings, 'Customization', 'axes_customization');

  var axesAccordion, axesAccordionItem;

  for (i = 0, len = axes.length; i < len; i++) {
    var axis = axes[i] ? '_' + axes[i] : '';
    if (axes[i]) {
      tab_panel = createPanelTab(tap_panes, axes[i], axes[i] == 'bottom');
    }
    parent = axis ? tab_panel : parent_settings;

    createCheckBox(parent, 'axes' + axis, 'Enable');
    createCheckBox(parent, 'axes' + axis + '_overlapMode', 'Overlap labels', function(value) {return value == anychart.enums.LabelsOverlapMode.ALLOW_OVERLAP;});
    createColorPicker(parent, 'axes' + axis + '_stroke', 'Stroke', 'some color ... like - \'red\' or \'#ff0000\'');

    axesAccordion = createAccordion(parent, 'axes_accordion' + axis);

    axesAccordionItem = createAccordionItem(axesAccordion, 'axes' + axis + '_titleAccordionItem', 'Title', false);
    createCheckBox(axesAccordionItem, 'axes' + axis + '_title', 'Enable title');
    createTextInput(axesAccordionItem, 'axes' + axis + '_title_text', 'Title', 'Title text');
    createColorPicker(axesAccordionItem, 'axes' + axis + '_title_fontColor', 'Font color', 'some color ... like - \'red\' or \'#ff0000\'');

    axesAccordionItem = createAccordionItem(axesAccordion, 'axes' + axis + '_majorAccordionItem', 'Major settings', false);
    createCheckBox(axesAccordionItem, 'axes' + axis + '_labels', 'Enable major labels');
    createCheckBox(axesAccordionItem, 'axes' + axis + '_ticks', 'Enable major ticks');
    createChosen(axesAccordionItem, 'axes' + axis + '_ticks_position', 'Ticks position', 'Ticks position', anychart.enums.SidePosition);
    createTextInput(axesAccordionItem, 'axes' + axis + '_ticks_length', 'Ticks length', 'Ticks length');
    createTextInput(axesAccordionItem, 'axes' + axis + '_labels_rotation', 'Labels rotation', 'Labels rotation');
    createTextInput(axesAccordionItem, 'axes' + axis + '_labels_anchor', 'Labels anchor', 'Labels anchor');
    createCheckBox(axesAccordionItem, 'axes' + axis + '_drawFirstLabel', 'Draw first label');
    createCheckBox(axesAccordionItem, 'axes' + axis + '_drawLastLabel', 'Draw last label');

    axesAccordionItem = createAccordionItem(axesAccordion, 'axes' + axis + '_minorAccordionItem', 'Minor settings', false);
    createCheckBox(axesAccordionItem, 'axes' + axis + '_minorLabels', 'Enable labels');
    createCheckBox(axesAccordionItem, 'axes' + axis + '_minorTicks', 'Enable ticks');
    createChosen(axesAccordionItem, 'axes' + axis + '_minorTicks_position', 'Ticks position', 'Minor ticks position', anychart.enums.SidePosition);
    createTextInput(axesAccordionItem, 'axes' + axis + '_minorTicks_length', 'Ticks length', 'Minor ticks length');
    createTextInput(axesAccordionItem, 'axes' + axis + '_minorLabels_rotation', 'Labels rotation', 'Minor labels rotation');
    createTextInput(axesAccordionItem, 'axes' + axis + '_minorLabels_anchor', 'Labels anchor', 'Minor labels anchor');
  }

  //grids

  var grids_tab = $('#grids_tab');
  parent_settings = $('<div></div>');
  grids_tab.append(parent_settings);
  custom_settings = $('<div></div>');
  grids_tab.append(custom_settings);

  tap_panes = createTabPanel(custom_settings, 'Customization');

  for (i = 0, len = grids.length; i < len; i++) {
    var grid = grids[i] ? '_' + grids[i] : '';
    if (axes[i]) {
      var tab_panel = createPanelTab(tap_panes, grids[i], grids[i] == 'vertical');
    }
    parent = grid ? tab_panel : parent_settings;

    createCheckBox(parent, 'grids' + grid, 'Enable');
    createCheckBox(parent, 'grids' + grid + '_drawFirstLine', 'Draw first line');
    createCheckBox(parent, 'grids' + grid + '_drawLastLine', 'Draw last line');
    createColorPicker(parent, 'grids' + grid + '_stroke', 'Stroke', 'some color ... like - \'red\' or \'#ff0000\'');
    createColorPicker(parent, 'grids' + grid + '_minorStroke', 'Minor stroke', 'some color ... like - \'red\' or \'#ff0000\'');
    createColorPicker(parent, 'grids' + grid + '_oddFill', 'Odd fill', 'some color ... like - \'red\' or \'#ff0000\'');
    createColorPicker(parent, 'grids' + grid + '_evenFill', 'Even fill', 'some color ... like - \'red\' or \'#ff0000\'');
    createTextInput(parent, 'grids' + grid + '_zIndex', 'Z-index', 'z-index');
  }

  //Crosshair

  var crosshair_tab = $('#crosshair_tab');

  createCheckBox(crosshair_tab, 'crosshair_enabled', 'Enable');
  createColorPicker(crosshair_tab, 'crosshair_xStroke', 'X Stroke', 'some color ... like - \'red\' or \'#ff0000\'');
  createColorPicker(crosshair_tab, 'crosshair_yStroke', 'Y Stroke', 'some color ... like - \'red\' or \'#ff0000\'');
  createChosen(crosshair_tab, 'crosshair_displayMode', 'Display mode', 'Display mode', anychart.enums.CrosshairDisplayMode);
}

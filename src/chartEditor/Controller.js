goog.provide('anychart.chartEditorModule.Controller');

goog.require('anychart.chartEditorModule.events');
goog.require('goog.ui.PopupBase.EventType');



/**
 * @param {anychart.chartEditorModule.Editor} editor
 * @constructor
 */
anychart.chartEditorModule.Controller = function(editor) {
  /**
   * @type {anychart.chartEditorModule.steps.Base.Model}
   * @private
   */
  this.model_ = null;

  /**
   * @type {anychart.chartEditorModule.Editor}
   * @private
   */
  this.editor_ = editor;

  /**
   * @type {Object.<string, *>}
   * @private
   */
  this.settingsMap_ = {};

  // internal events
  goog.events.listen(editor, goog.ui.PopupBase.EventType.HIDE, this.onHide_, false, this);
  goog.events.listen(editor, anychart.chartEditorModule.events.EventType.ADD_SERIES, this.onAddSeries_, false, this);
  goog.events.listen(editor, anychart.chartEditorModule.events.EventType.REMOVE_SERIES, this.onRemoveSeries_, false, this);
  goog.events.listen(editor, anychart.chartEditorModule.events.EventType.REMOVE_ALL_SERIES, this.onRemoveAllSeries_, false, this);
  goog.events.listen(editor, anychart.chartEditorModule.events.EventType.SET_SERIES_MAPPING, this.onSetSeriesMapping_, false, this);
  goog.events.listen(editor, anychart.chartEditorModule.events.EventType.SET_CHART_DATA, this.onSetChartData_, false, this);
  goog.events.listen(editor, anychart.chartEditorModule.events.EventType.SET_PRESET_TYPE, this.onSetPresetType_, false, this);
  goog.events.listen(editor, anychart.chartEditorModule.events.EventType.CHANGE_MODEL, this.onChangeModel_, false, this);
  goog.events.listen(editor, anychart.chartEditorModule.events.EventType.BUILD_CHART, this.onBuildChart_, false, this);
  goog.events.listen(editor, anychart.chartEditorModule.events.EventType.UPDATE_EDITOR, this.onEditorUpdate_, false, this);
};


/**
 *
 * @param {anychart.chartEditorModule.steps.Base.Model} value
 */
anychart.chartEditorModule.Controller.prototype.setModel = function(value) {
  this.model_ = value;
  this.settingsMap_ = {};
};


/**
 * @param {Object} evt
 * @private
 */
anychart.chartEditorModule.Controller.prototype.onEditorUpdate_ = function(evt) {
  this.editor_.update();
};


/**
 * @param {!goog.events.Event} evt Event object.
 * @private
 */
anychart.chartEditorModule.Controller.prototype.onHide_ = function(evt) {
  if (evt.target == this.editor_) {
    this.editor_.dispatchEvent(anychart.enums.EventType.CLOSE);
  }
};


/**
 * @param {{key: string, value: *, rebuild: boolean}} evt
 * @private
 */
anychart.chartEditorModule.Controller.prototype.onChangeModel_ = function(evt) {
  var key = evt.key;
  var value = evt.value;
  var rebuild = evt.rebuild;

  if (!key) return;

  this.settingsMap_[key] = value;
  anychart.chartEditorModule.Controller.getset(this.model_, key, value);

  if (rebuild) this.onBuildChart_();
};


/**
 * @param {{seriesType:? (string), mapping: number, rebuild: boolean}} evt
 * @private
 */
anychart.chartEditorModule.Controller.prototype.onAddSeries_ = function(evt) {
  var id = ++this.model_.lastSeriesId;
  var type = evt.seriesType;

  var mapping;
  if (goog.isDef(evt.mapping)) {
    mapping = evt.mapping;
  } else {
    var unusedMapping = this.getUnusedMapping();
    mapping = isNaN(unusedMapping) ? (this.model_.dataMappings.length - 1) : unusedMapping;
  }

  this.model_.seriesMappings[String(id)] = {type: type, mapping: mapping};
  if (evt.rebuild) this.onBuildChart_();
  this.editor_.update();
};


/**
 * @param {{id: string, rebuild: boolean}} evt
 * @private
 */
anychart.chartEditorModule.Controller.prototype.onRemoveSeries_ = function(evt) {
  delete this.model_.seriesMappings[evt.id];
  if (evt.rebuild) this.onBuildChart_();
  this.editor_.update();
};


/**
 * Remove all series handler.
 * @param {{id: string, rebuild: boolean}} evt
 * @private
 */
anychart.chartEditorModule.Controller.prototype.onRemoveAllSeries_ = function(evt) {
  goog.object.clear(this.model_.seriesMappings);
  if (evt.rebuild) this.onBuildChart_();
  this.editor_.update();
};


/**
 * @param {{id: string, value: number, rebuild: boolean}} evt
 * @private
 */
anychart.chartEditorModule.Controller.prototype.onSetSeriesMapping_ = function(evt) {
  var seriesData = this.model_.seriesMappings[evt.id];
  if (seriesData) {
    seriesData.mapping = evt.value;
    if (evt.rebuild) this.onBuildChart_();
    this.editor_.update();
  }
};


/**
 * @param {{value: number, rebuild: boolean}} evt
 * @private
 */
anychart.chartEditorModule.Controller.prototype.onSetChartData_ = function(evt) {
  this.model_.chartMapping = evt.value;

  if (evt.rebuild) this.onBuildChart_();
  this.editor_.update();
};


/**
 * @param {{category: string, presetType: string}} evt
 * @private
 */
anychart.chartEditorModule.Controller.prototype.onSetPresetType_ = function(evt) {
  this.model_.presetCategory = evt.category;
  this.model_.presetType = evt.presetType;
  this.onPresetChanged_();
  this.onBuildChart_();
  this.editor_.update();
};


/** @private */
anychart.chartEditorModule.Controller.prototype.onPresetChanged_ = function() {
  var category = this.model_.presetCategory;
  var type = this.model_.presetType;

  var presetCategory = this.model_.presets[category];
  var preset = goog.array.find(presetCategory.list, function(item) {
    return item.type == type;
  }, this);

  this.model_.chartConstructor = preset.ctor || presetCategory.ctor;
  this.model_.isSeriesBased = presetCategory.isSeriesBased;
  this.model_.seriesType = preset.seriesType;
  this.model_.presetSettings = preset.settings || [];
};


/**
 * todo: move it from controller to model class
 * @param {anychart.chartEditorModule.steps.Base.Model} model
 * @param {string} key
 * @param {*=} opt_value
 * @param {boolean=} opt_dryRun
 * @return {string}
 */
anychart.chartEditorModule.Controller.getset = function(model, key, opt_value, opt_dryRun) {
  if (goog.isString(opt_value))
    opt_value = opt_value.replace(/\\(r|n|t)/g, function(part, g1) {
      switch (g1) {
        case 'r':
          return '\r';
        case 'n':
          return '\n';
        case 't':
          return '\t';
      }
      return part;
    });

  var keyPath = key.split('.');
  var target = model;
  var name, matchResult, arg, useCall;
  var success = false;

  try {
    for (var i = 0, count = keyPath.length; i < count; i++) {
      name = keyPath[i];
      matchResult = name.match(/(.+)\((.*)\)/);
      if (matchResult) {
        name = matchResult[1];
        arg = matchResult[2] ? matchResult[2] : undefined;
        useCall = true;
      } else {
        arg = undefined;
        useCall = false;
      }
      if (i != count - 1) {
        target = useCall ?
            target[name](arg) :
            target[name];
      } else {
        if (opt_dryRun) {
          success = !!target[name];
        } else {
          target = useCall ?
              target[name](opt_value) :
              goog.isDef(opt_value) ? target[name] = opt_value : target[name];
        }
      }
    }
  } catch (e) {
    var message = 'Could not apply key \'' + key + '\'';
    if (arg) message += ' with argument [' + arg + ']';

    var logger = anychart.window['console'];
    if (logger) {
      var log = logger['warn'] || logger['log'];
      if (typeof log != 'object') {
        log.call(logger, message);
      }
    }
  }

  if (!goog.isDef(opt_value) && goog.isString(target))
    target = target.replace(/(\r|\n|\t)/g, function(part, g1) {
      switch (g1) {
        case '\r':
          return '\\r';
        case '\n':
          return '\\n';
        case '\t':
          return '\\t';
      }
      return part;
    });

  return opt_dryRun ? success : target;
};


/**
 * @param {{container: (Element|string)}=} opt_evt
 * @private
 */
anychart.chartEditorModule.Controller.prototype.onBuildChart_ = function(opt_evt) {
  if (this.model_.chart && typeof this.model_.chart['dispose'] == 'function') {
    this.model_.chart['dispose']();
  }

  if (!this.model_.dataMappings.length) return;

  var i, count;
  var chart = this.model_.anychart[this.model_.chartConstructor]();
  var container = opt_evt ? opt_evt.container || this.model_.chartContainer : this.model_.chartContainer;

  this.model_.chart = chart;
  this.model_.chartContainer = container;
  this.model_['chart'] = this.model_.chart; // required for compiled version

  if (this.model_.isSeriesBased) {
    // create/update series
    var id, series, seriesData, seriesType;
    for (id in this.model_.seriesMappings) {
      seriesData = this.model_.seriesMappings[id];
      series = chart['getSeries'](id);
      seriesType = seriesData.type || this.model_.seriesType;
      var mapping = this.model_.dataMappings[seriesData.mapping];
      if (!series) {
        series = chart[seriesType](mapping);
        series['id'](id);
      } else {
        series['id'](id);
        series['seriesType'](seriesType);
        series['data'](mapping);
      }
    }

    // remove old series
    for (i = 0, count = chart['getSeriesCount'](); i < count; i++) {
      series = chart['getSeriesAt'](i);
      id = series['id']();
      if (!this.model_.seriesMappings[id]) chart['removeSeriesAt'](i);
    }
  } else {
    chart['data'](this.model_.dataMappings[this.model_.chartMapping]);
  }

  var key;

  // presets
  for (key in this.model_.presetSettings) {
    anychart.chartEditorModule.Controller.getset(this.model_, key, this.model_.presetSettings[key]);
  }

  // settings set by user
  for (key in this.settingsMap_) {
    anychart.chartEditorModule.Controller.getset(this.model_, key, this.settingsMap_[key]);
  }

  chart['container'](container);
  chart['draw']();
};


/** @return {string} */
anychart.chartEditorModule.Controller.prototype.getBuildCode = function() {
  var fArgs = '';
  var fCode = '';
  var fDataSets = '';
  var fMappings = '';
  var fGlobalSettings = '';
  var fChart = '';
  var i, count;
  var subs = goog.string.subs;
  var stringify = this.model_.window['JSON']['stringify'];

  // function arguments and data sets
  for (i = 0, count = this.model_.dataSets.length; i < count; i++) {
    fArgs += subs('data%s,', i);
    fDataSets += subs('var dataSet%s=data%s[\'mapAs\'] ? data%s : anychart.data.set(data%s);', i, i, i, i);
  }
  fArgs = fArgs.substring(0, fArgs.length - 1); // remove last comma

  // data mapping
  for (i = 0, count = this.model_.dataMappings.length; i < count; i++) {
    var mapping = this.model_.dataMappings[i];
    var dataSet = mapping['getDataSets']()[0];
    var arrayMapping = mapping['getArrayMapping']() == anychart.window['anychart']['data']['Mapping']['DEFAULT_ARRAY_MAPPING'] ?
        'undefined' :
        stringify(mapping['getArrayMapping']());
    var objectMapping = mapping['getObjectMapping']() == anychart.window['anychart']['data']['Mapping']['DEFAULT_OBJECT_MAPPING'] ?
        'undefined' :
        stringify(mapping['getObjectMapping']());
    fMappings += subs('var mapping%s=dataSet%s.mapAs(%s,%s);', i, this.indexOfDataSet(dataSet), arrayMapping, objectMapping);

  }

  // chart type
  fChart += subs('var chart = anychart.%s();', this.model_.chartConstructor);


  if (this.model_.isSeriesBased) {
    // chart series
    for (var id in this.model_.seriesMappings) {
      var series = this.model_.seriesMappings[id];
      var seriesType = series.type || this.model_.seriesType;
      if (series) {
        fChart += subs('var series%s = chart.%s(mapping%s);', id, seriesType, series.mapping);
        fChart += subs('series%s.id(%s);', id, id);
      }
    }
  } else {
    // chart data
    fChart += subs('chart.data(mapping%s);', this.model_.chartMapping);
  }

  // presets
  var presets = anychart.chartEditorModule.Controller.settingsMapToString(this.model_.presetSettings, this.model_);
  fChart += presets[0];
  fGlobalSettings += presets[1];

  // chart settings and global settings
  var settings = anychart.chartEditorModule.Controller.settingsMapToString(this.settingsMap_, this.model_);
  fChart += settings[0];
  fGlobalSettings += settings[1];

  // compile result code
  fCode += fGlobalSettings + fDataSets + fMappings + fChart;
  fCode += 'return chart;';
  return goog.string.subs('(function(){return function (%s){%s};})();', fArgs, fCode);
};


/**
 * @param {Object.<*>} map
 * @param {anychart.chartEditorModule.steps.Base.Model} model
 * @return {Array.<string>}
 */
anychart.chartEditorModule.Controller.settingsMapToString = function(map, model) {
  var fChart = '';
  var fGlobalSettings = '';

  for (var key in map) {
    var rawValue = map[key];
    var value = rawValue;
    var settingsCanByApplyed = anychart.chartEditorModule.Controller.getset(model, key, rawValue, true);

    if (settingsCanByApplyed) {
      if (goog.isObject(rawValue)) {
        value = anychart.window['JSON']['stringify'](value);
      } else if (goog.isString(rawValue)) {
        value = '"' + value + '"';
      }

      if (goog.string.endsWith(key, '()')) value = key.slice(0, -1) + value + ');';
      else value = key + '=' + value + ';';

      if (goog.string.startsWith(key, 'chart')) fChart += value;
      else fGlobalSettings += value;
    }
  }

  return [fChart, fGlobalSettings];
};


/**
 * todo: move it from controller to model class
 * @param {anychart.data.Set} dataSet
 * @return {number}
 */
anychart.chartEditorModule.Controller.prototype.indexOfDataSet = function(dataSet) {
  var result = -1;
  for (var i = 0, count = this.model_.dataSets.length; i < count; i++) {
    if (this.model_.dataSets[i].instance == dataSet) {
      result = i;
      break;
    }
  }
  return result;
};


/**
 * * todo: move it from controller to model class
 * @return {number}
 */
anychart.chartEditorModule.Controller.prototype.getUnusedMapping = function() {
  var result = NaN;

  for (var i = 0, count = this.model_.dataMappings.length; i < count; i++) {
    var seriesMappings = this.getSeriesByMapping(i);
    if (!seriesMappings.length) {
      result = i;
      break;
    }
  }

  return result;
};


/**
 * todo: move it from controller to model class
 * @param {number} mapping
 * @return {Array}
 */
anychart.chartEditorModule.Controller.prototype.getSeriesByMapping = function(mapping) {
  var result = [];

  for (var id in this.model_.seriesMappings) {
    var seriesData = this.model_.seriesMappings[id];
    var seriesMapping = seriesData.mapping;
    if (mapping == seriesMapping) {
      result.push(id);
    }
  }

  return result;
};

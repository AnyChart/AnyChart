goog.provide('anychart.stockModule.PlotControls');
goog.require('anychart.enums');
goog.require('anychart.ui.button.Base');
goog.require('goog.style');
goog.require('goog.ui.Component.EventType');
goog.require('goog.ui.Control');



/**
 * PlotControls class.
 * @constructor
 * @param {anychart.stockModule.Plot} plot
 * @extends {goog.ui.Control}
 */
anychart.stockModule.PlotControls = function(plot) {
  anychart.stockModule.PlotControls.base(this, 'constructor');

  /**
   * Stock plot.
   * @type {anychart.stockModule.Plot}
   * @private
   */
  this.target_ = plot;

  /**
   * Sets plot position.
   * @type {?anychart.enums.PlotPosition}
   * @private
   */
  this.plotPosition_ = null;
};
goog.inherits(anychart.stockModule.PlotControls, goog.ui.Control);


/**
 * Meta information for buttons.
 * @type {Object}
 */
anychart.stockModule.PlotControls.BUTTONS_META = {
  'up': {
    'tooltip': 'Move plot up',
    'icon': 'ac ac-caret-up',
    'fallbackSymbol': '\u25B2',
    'model': {
      'type': 'up'
    }
  },
  'down': {
    'tooltip': 'Move plot down',
    'icon': 'ac ac-caret-down',
    'fallbackSymbol': '\u25bc',
    'model': {
      'type': 'down'
    }
  },
  'zoom': {
    'tooltip': 'Expand/Collapse plot',
    'icon': 'ac ac-enlarge',
    'fallbackSymbol': '\u26f6',
    'toggle': true,
    'model': {
      'type': 'zoom'
    }
  }
};


/**
 * Which buttons to create depending on plot position.
 * @type {Object}
 */
anychart.stockModule.PlotControls.BUTTONS = {
  'single': [
    anychart.stockModule.PlotControls.BUTTONS_META['zoom']
  ],
  'top': [
    anychart.stockModule.PlotControls.BUTTONS_META['down'],
    anychart.stockModule.PlotControls.BUTTONS_META['zoom']
  ],
  'center': [
    anychart.stockModule.PlotControls.BUTTONS_META['up'],
    anychart.stockModule.PlotControls.BUTTONS_META['down'],
    anychart.stockModule.PlotControls.BUTTONS_META['zoom']
  ],
  'bottom': [
    anychart.stockModule.PlotControls.BUTTONS_META['up'],
    anychart.stockModule.PlotControls.BUTTONS_META['zoom']
  ]
};


/**
 * CSS class name for plot controls.
 * @type {string}
 */
anychart.stockModule.PlotControls.CSS_CLASS = goog.getCssName('anychart-plot-controls');


/**
 * Creates DOM structure for plot controls.
 * @private
 */
anychart.stockModule.PlotControls.prototype.createDomInternal_ = function() {
  var element = this.getElement();
  var cssClass = anychart.stockModule.PlotControls.CSS_CLASS;
  goog.dom.classlist.add(element, cssClass);
};


/** @inheritDoc */
anychart.stockModule.PlotControls.prototype.createDom = function() {
  anychart.stockModule.PlotControls.base(this, 'createDom');
  this.createDomInternal_();
};


/**
 * Set's plot position.
 * See description in enum {@see anychart.enums.PlotPosition}
 * @param {anychart.enums.PlotPosition} value
 */
anychart.stockModule.PlotControls.prototype.plotPosition = function(value) {
  if (this.plotPosition_ != value) {
    this.plotPosition_ = value;
  }
};


/**
 * Update's plot controls component.
 * Called to change buttons, and component style (When plot's position changes).
 */
anychart.stockModule.PlotControls.prototype.update = function() {
  if (!this.isInDocument())
    return;
  this.removeChildren(true);

  var bounds = this.target_.getPlotBounds();
  goog.style.setStyle(this.getElement(), {
    'right': this.target_.getChart().padding().right() + 'px',
    'top': bounds.top + 'px'
  });
  var buttonsInfo = anychart.stockModule.PlotControls.BUTTONS[this.plotPosition_];

  var buttonInfo;
  var button;

  var expanded = /** @type {boolean} */ (this.target_.isExpanded());
  for (var i = 0; i < buttonsInfo.length; i++) {
    buttonInfo = buttonsInfo[i];
    button = new anychart.ui.button.Base();
    button.addClassName('anychart-button-standard');
    button.setTooltip(buttonInfo['tooltip']);
    button.setIcon(buttonInfo['icon']);
    button.setFallbackSymbol(buttonInfo['fallbackSymbol']);
    button.setModel(buttonInfo['model']);
    if (buttonInfo['toggle']) {
      expanded ? button.setIcon('ac ac-dot-square-o') : button.setIcon('ac ac-enlarge');
    }

    if (buttonsInfo.length != 1) {
      if (!i) {
        button.setCollapsed(goog.ui.ButtonSide.START);
      } else if (i == buttonsInfo.length - 1) {
        button.setCollapsed(goog.ui.ButtonSide.END);
      } else {
        button.setCollapsed(goog.ui.ButtonSide.BOTH);
      }
    }

    this.addChild(button, true);
  }
};


/** @inheritDoc */
anychart.stockModule.PlotControls.prototype.enterDocument = function() {
  anychart.stockModule.PlotControls.base(this, 'enterDocument');
  this.update();

  var handler = this.getHandler();
  handler.listen(this, goog.ui.Component.EventType.ENTER, function(e) {
    this.preventHiding_ = true;
  });

  handler.listen(this, goog.ui.Component.EventType.LEAVE, function(e) {
    this.preventHiding_ = false;
    this.hide();
  });

  handler.listen(this, goog.ui.Component.EventType.ACTION, this.handleButtonAction_);
};


/**
 * Handles button click.
 * @param {Object} e
 * @private
 */
anychart.stockModule.PlotControls.prototype.handleButtonAction_ = function(e) {
  var button = e.target;

  if (anychart.utils.instanceOf(button, anychart.ui.button.Base)) {
    var model = button.getModel();
    var type = model['type'];

    var currentPlot = this.target_;
    if (type == 'up') {
      currentPlot.moveUp();
    } else if (type == 'down') {
      currentPlot.moveDown();
    } else if (type == 'zoom') {
      currentPlot.toggleExpandedState();
      currentPlot.isExpanded() ? button.setIcon('ac ac-dot-square-o') : button.setIcon('ac ac-enlarge');
    }
    this.preventHiding_ = false;
  }

};


/**
 * Shows plot controls element.
 */
anychart.stockModule.PlotControls.prototype.show = function() {
  goog.dom.classlist.remove(this.getElement(), 'anychart-plot-controls-hidden');
};


/**
 * Hides plot controls element.
 */
anychart.stockModule.PlotControls.prototype.hide = function() {
  if (!this.preventHiding_)
    goog.dom.classlist.add(this.getElement(), 'anychart-plot-controls-hidden');
};


/**
 * Extract plots -> stock -> stage container.
 * @return {Element|undefined}
 */
anychart.stockModule.PlotControls.prototype.extractContainer = function() {
  var container;
  var chart = this.target_.getChart();
  var stage = chart['container']() ? chart['container']()['getStage']() : null;
  if (stage && stage['container']()) {
    container = stage['container']();
  } else {
    container = null;
  }
  return container;
};


/**
 * Calls after 'chartdraw' event dispatched.
 * @private
 */
anychart.stockModule.PlotControls.prototype.delayedRenderOnChartDraw_ = function() {
  this.render();
};


/**
 * Renders plot controls.
 */
anychart.stockModule.PlotControls.prototype.render = function() {
  var container = this.extractContainer();
  if (container) {
    anychart.stockModule.PlotControls.base(this, 'render', container);
  } else {
    var bind = goog.bind(this.delayedRenderOnChartDraw_, this);
    this.target_.getChart().listenOnce(anychart.enums.EventType.CHART_DRAW, bind, false, this);
  }
};

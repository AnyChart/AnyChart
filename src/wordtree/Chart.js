//region Provide and require
goog.provide('anychart.wordtreeModule.Chart');

goog.require('acgraph.vector.Path');
goog.require('acgraph.vector.Text');
goog.require('anychart.core.Chart');
goog.require('anychart.format.Context');
goog.require('anychart.treeDataModule.Tree');
goog.require('anychart.wordtreeModule.Connectors');


//endregion
//region Constructor
/**
 * Wordtree chart class.
 * @constructor
 * @param {?(anychart.treeDataModule.Tree|
 * string|
 * Array<Object>|
 * Array<Array<string>>|
 * Array<string>)=} opt_data Value to set.
 * @param {anychart.enums.TreeFillingMethod=} opt_fillMethod - Fill method.
 * @extends {anychart.core.Chart}
 */
anychart.wordtreeModule.Chart = function(opt_data, opt_fillMethod) {
  anychart.wordtreeModule.Chart.base(this, 'constructor');

  this.bindHandlersToComponent(this,
    this.handleMouseOverAndMove,
    this.handleMouseOut,
    this.handleMouseClick,
    this.handleMouseOverAndMove,
    null,
    null);

  /**
   * Root element of wordtree.
   * @type {?anychart.treeDataModule.Tree.DataItem}
   * @private
   * */
  this.root_ = null;

  /**
   * Array of text elements that already placed on rootLayer.
   * Needs for appearance manipulation.
   * @type {Array<acgraph.vector.Text>}
   * @private
   * */
  this.textElements_ = [];

  /**
   * Array of all tree nodes.
   * Needs for traverse through elements and mark them as visible or hidden.
   * @type {Array<anychart.treeDataModule.Tree.DataItem>}
   * @private
   * */
  this.nodes_ = [];

  /**
   * Current drilled node.
   * @type {?anychart.treeDataModule.Tree.DataItem}
   * @private
   * */
  this.drilledNode_ = null;

  /**
   * Type of wordtree. Setup by data.
   * @type {anychart.wordtreeModule.Chart.Type}
   * @private
   * */
  this.type_;

  /**
   * Word that is root of tree.
   * @type {?string}
   * @private
   * */
  this.searchWord_ = null;

  /**
   * Raw data text or arrays of string.
   * Needs for recreate tree for different word.
   * @type {(string|Array<string>)}
   * @private
   * */
  this.rawData_ = [];

  /**
   * Line height factor.
   * Needs for get font size for specific height.
   * @type {number}
   * @const
   * @private
   * */
  this.lineHeightFactor_ = 1.5;

  /**
   * Connector path.
   * @type {acgraph.vector.Path}
   * @private
   * */
  this.connectorElement_;

  /**
   * Pool of already exists text elements.
   * @type {Array<acgraph.vector.Text>}
   * @private
   * */
  this.textPool_ = [];

  /**
   * Offset for plug node.
   * @type {number}
   * @const
   * @private
   * */
  this.offsetForPlug_ = 20;

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['minFontSize', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW],
    ['maxFontSize', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW],
    ['postfix', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW],
    ['fontFamily', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW],
    ['fontStyle', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['fontWeight', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW],
    ['fontColor', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['fontOpacity', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['fontDecoration', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW]
    //['sortBy', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW, 0, this.sortFunction_, this]
  ]);
  this.data(opt_data, opt_fillMethod);
};
goog.inherits(anychart.wordtreeModule.Chart, anychart.core.Chart);


//endregion
//region Properties
/**
 * Supported signals.
 * @type {number}
 */
anychart.wordtreeModule.Chart.prototype.SUPPORTED_SIGNALS = anychart.core.Chart.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.wordtreeModule.Chart.prototype.SUPPORTED_CONSISTENCY_STATES = anychart.core.Chart.prototype.SUPPORTED_CONSISTENCY_STATES |
  anychart.ConsistencyState.TREE_DATA |
  anychart.ConsistencyState.APPEARANCE;


/**
 * Z-index for wordtree chart.
 * @type {number}
 * */
anychart.wordtreeModule.Chart.Z_INDEX = 30;


/**
 * @typedef {{
 *  type: string,
 *  node: anychart.treeDataModule.Tree.DataItem,
 *  isPlug: boolean
 *}}
 * */
anychart.wordtreeModule.Chart.DOMdata;


/**
 * Properties that should be defined in class prototype.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.wordtreeModule.Chart.OWN_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'minFontSize', anychart.core.settings.numberOrPercentNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'maxFontSize', anychart.core.settings.numberOrPercentNormalizer],
    //fontSettings
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'fontFamily', anychart.core.settings.stringNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'fontStyle', anychart.enums.normalizeFontStyle],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'fontWeight', anychart.core.settings.numberOrStringNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'fontColor', anychart.core.settings.stringOrNullNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'fontOpacity', anychart.core.settings.numberNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'fontDecoration', anychart.enums.normalizeFontDecoration],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'postfix', function(val) {
      if (goog.isDef(val)) {
        if (goog.isNull(val))
          val = this.getThemeOption('postfix');
        return anychart.core.settings.stringNormalizer(val);
      }
    }]
    //[anychart.enums.PropertyHandlerType.SINGLE_ARG, 'sortBy', function(value) {
    //  return (anychart.enums.normalize(anychart.wordtreeModule.Chart.SortType, value, anychart.wordtreeModule.Chart.SortType.AS_IS));
    //}]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.wordtreeModule.Chart, anychart.wordtreeModule.Chart.OWN_DESCRIPTORS);


/**
 * Types of chart
 * @enum {string}
 * */
anychart.wordtreeModule.Chart.Type = {
  IMPLICIT: 'implicit',
  EXPLICIT: 'explicit'
};


// /**
//  * Sort types
//  * @enum {string}
//  * */
// anychart.wordtreeModule.Chart.SortType = {
//   ALPHABET_ASC: 'alphabet-asc',
//   ALPHABET_DESC: 'alphabet-desc',
//   WEIGHT_ASC: 'weight-asc',
//   WEIGHT_DESC: 'weight-desc',
//   AS_IS: 'as-is'
// };


//endregion
//region Infrastructure
/** @inheritDoc */
anychart.wordtreeModule.Chart.prototype.getType = function() {
  return anychart.enums.ChartTypes.WORDTREE;
};


/** @inheritDoc */
anychart.wordtreeModule.Chart.prototype.isNoData = function() {
  return !!(!this.data_ || (this.data_ && !this.data_.numChildren()));
};


/** @inheritDoc */
anychart.wordtreeModule.Chart.prototype.getAllSeries = function() {
  return [];
};


/** @inheritDoc */
anychart.wordtreeModule.Chart.prototype.getDataHolders = function() {
  return [this];
};


/**
 * Return function for get interpolated value between two points.
 * For cubic bezier curve.
 * @param {number} a First value.
 * @param {number} b Second value.
 * @return {Function}
 */
anychart.wordtreeModule.Chart.prototype.interpolateNumber = function(a, b) {
  return function(t) {
    return a * (1 - t) + b * t;
  };
};


/** @inheritDoc */
anychart.wordtreeModule.Chart.prototype.toCsv = function(opt_chartDataExportMode, opt_csvSettings) {
  return anychart.treeDataModule.utils.toCsv(
    /** @type {anychart.treeDataModule.Tree|anychart.treeDataModule.View} */(this.data()), opt_csvSettings);
};


//endregion
//region Connectors
/**
 * Connectors settings.
 * @param {Object=} opt_value settings for connectors.
 * @return {anychart.wordtreeModule.Connectors | anychart.wordtreeModule.Chart}
 * */
anychart.wordtreeModule.Chart.prototype.connectors = function(opt_value) {
  if (!this.connectors_) {
    this.connectors_ = new anychart.wordtreeModule.Connectors();
    this.setupCreated('connectors', this.connectors_);
    this.connectors_.listenSignals(this.onConnectorsSignal, this);
  }
  if (opt_value) {
    this.connectors_.setup(opt_value);
    return this;
  }
  return this.connectors_;
};


//endregion
//region Tooltip data
/**
 * Creates context provider for tooltip.
 * @param {anychart.treeDataModule.Tree.DataItem} element Object with data for tooltip.
 * @return {anychart.format.Context}
 */
anychart.wordtreeModule.Chart.prototype.createContextProvider = function(element) {
  if (!this.contextProvider_)
    this.contextProvider_ = new anychart.format.Context();

  var values = {};

  if (element) {
    values['value'] = {value: element.get('value'), type: anychart.enums.TokenType.STRING};
    values['weight'] = {value: element.meta('weight'), type: anychart.enums.TokenType.NUMBER};
  }
  this.contextProvider_.dataSource(element);
  return /** @type {anychart.format.Context} */ (this.contextProvider_.propagate(values));
};


//endregion
//region Event handlers and interactivity
/**
 * Mark all nodes before passed as hidden.
 * @param {anychart.treeDataModule.Tree.DataItem} node
 * */
anychart.wordtreeModule.Chart.prototype.drill = function(node) {
  var parent = node.getParent();
  if (parent) {
    for (var i = 0; i < parent.numChildren(); i++) {
      var children = parent.getChildAt(i);
      if (children == node) continue;
      children.meta('hidden', true);
    }
    this.drill(parent);
  }
};


/**
 * Drill to passed node.
 * @param {?(
 * Array<anychart.treeDataModule.Tree.DataItem>|
 * anychart.treeDataModule.Tree.DataItem|
 * string)} node
 * */
anychart.wordtreeModule.Chart.prototype.drillTo = function(node) {
  if (node) {
    if (goog.typeOf(node) == 'array')
      node = node[0];
    if (!anychart.utils.instanceOf(node, anychart.treeDataModule.Tree.DataItem)) {
      node = this.data().searchItems('value', node)[0];
      if (!node) return;
    }
    this.drilledNode_ = node;
    this.drill(node);
    this.invalidate(anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Drill up.
 * @return {anychart.wordtreeModule.Chart}
 * */
anychart.wordtreeModule.Chart.prototype.drillUp = function() {
  this.showAll();
  if (this.drilledNode_ && this.drilledNode_.getParent())
    this.drillTo(this.drilledNode_.getParent());
  return this;
};


/**
 * Mark all nodes of current tree as visible.
 * */
anychart.wordtreeModule.Chart.prototype.showAll = function() {
  for (var i = 0; i < this.nodes_.length; i++) {
    this.nodes_[i].meta('hidden', false);
  }
};


/**
 * Connectors invalidation handler.
 * @param {anychart.SignalEvent} signalEvent
 * */
anychart.wordtreeModule.Chart.prototype.onConnectorsSignal = function(signalEvent) {
  var consistency = 0;
  if (signalEvent.hasSignal(anychart.Signal.NEEDS_REDRAW_APPEARANCE)) {
    consistency |= anychart.ConsistencyState.APPEARANCE;
  }

  if (signalEvent.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    consistency |= anychart.ConsistencyState.BOUNDS;
  }

  this.invalidate(consistency, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Listens to data invalidation.
 * @param {anychart.SignalEvent} event
 * @private
 */
anychart.wordtreeModule.Chart.prototype.dataInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.DATA_CHANGED)) {
    this.invalidate(anychart.ConsistencyState.TREE_DATA | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
  }
};


/**
 * Mouse click internal handler.
 * @param {anychart.core.MouseEvent} event - Event object.
 */
anychart.wordtreeModule.Chart.prototype.handleMouseClick = function(event) {
  if (event['button'] != acgraph.events.BrowserEvent.MouseButton.LEFT) return;
  var tag = /** @type {anychart.wordtreeModule.Chart.DOMdata} */(event['domTarget'].tag);
  if (tag && tag.node) {
    this.showAll();
    this.drillTo(tag.node);
  }
};


/** @inheritDoc */
anychart.wordtreeModule.Chart.prototype.handleMouseOverAndMove = function(event) {
  var tag = /** @type {acgraph.vector.Path} */ (event['domTarget']).tag;
  var tooltip;

  //Show tooltip only on nodes with data
  if (tag && tag.node && !tag.isPlug) {
    var node = /** @type {anychart.treeDataModule.Tree.DataItem} */ (tag.node);
    tooltip = this.tooltip();
    tooltip.showFloat(event['clientX'], event['clientY'], this.createContextProvider(node));
  } else {
    this.tooltip().hide();
  }
};


/** @inheritDoc */
anychart.wordtreeModule.Chart.prototype.handleMouseOut = function(event) {
  this.tooltip().hide();
};


//endregion
//region Data manipulation
/**
 * Find passed word in raw data and build tree.
 * Only for implicit chart type.
 * @param {?string=} opt_word Word will root of the tree.
 * @return {anychart.wordtreeModule.Chart|string} Current root word or chart instance for chaining.
 * */
anychart.wordtreeModule.Chart.prototype.word = function(opt_word) {
  if (this.type_ == anychart.wordtreeModule.Chart.Type.IMPLICIT) {
    if (goog.isDef(opt_word)) {
      if (this.searchWord_ != opt_word || this.forceRecreate) {
        this.forceRecreate = false;
        if (goog.isNull(opt_word) || goog.string.isEmptyOrWhitespace(opt_word)) {
          opt_word = this.implicitData[0][0];
        }
        this.searchWord_ = opt_word;
        var implicitDataForCurrentWord = [];
        for (var i = 0; i < this.implicitData.length; i++) {
          var index = goog.array.indexOf(this.implicitData[i], opt_word);
          if (index != -1) {
            var array = goog.array.slice(this.implicitData[i], index);
            implicitDataForCurrentWord.push(array);
          }
        }
        if (!implicitDataForCurrentWord.length) {
          implicitDataForCurrentWord[0] = [opt_word];
        }
        this.generateNodes(implicitDataForCurrentWord);
      }
      return this;
    }
    return this.searchWord_;
  } else {
    return this;
  }
};


/**
 * Generate tree that contains all nodes that we need to display.
 * @param {Array<Array<string>>} implicitDataForCurrentWord Array of string arrays for word.
 * */
anychart.wordtreeModule.Chart.prototype.generateNodes = function(implicitDataForCurrentWord) {
  var data = implicitDataForCurrentWord;
  var word = data[0][0];
  this.data().suspendSignalsDispatching();
  if (this.data().numChildren())
    this.data().removeChildAt(0);
  var node = {'value': word};
  node = this.data().addChildAt(node, 0);
  for (var i = 0; i < data.length; i++) {
    var currentArray = data[i];
    if (currentArray[0] == word) {
      currentArray.shift();
      this.insertArrayInToTree(node, currentArray);
    }
  }

  this.data().resumeSignalsDispatching(true);
};


/**
 * Insert array values into root node.
 * @param {anychart.treeDataModule.Tree.DataItem} rootNode
 * @param {Array<string>} array Array of words.
 * @return {anychart.treeDataModule.Tree.DataItem}
 * */
anychart.wordtreeModule.Chart.prototype.insertArrayInToTree = function(rootNode, array) {
  if (array.length) {
    var children = rootNode.getChildren();
    var has = false;
    var node;
    for (var i = 0; i < rootNode.numChildren(); i++) {
      if (/** @type {string} */(children[i].get('value')) == array[0]) {
        has = true;
        break;
      }
    }
    if (has) {
      array.shift();
      node = children[i];
    } else {
      var data = {
        'value': array[0]
      };

      node = rootNode.addChild(data);
      array.shift();
    }
    return this.insertArrayInToTree(node, array);
  }
  return rootNode;
};


/**
 * Separate text by sentences.
 * @param {string} text Raw text for splitting by sentence.
 * @return {Array<string>} Array of sentences.
 * */
anychart.wordtreeModule.Chart.prototype.getSentences = function(text) {
  var sentences = text.split(/\s*(.+?(?:[?!]+|$|\.(?=\s+[A-Z]|$)))\s*/);
  sentences = goog.array.filter(sentences, function(sentence) {
    return !!sentence.length;
  });
  return sentences;
};


/**
 * Convert sentences into array of words.
 * @param {string} sentence Sentence for splitting by word.
 * @return {Array<string>} Array of words/
 * */
anychart.wordtreeModule.Chart.prototype.getWords = function(sentence) {
  var array = sentence.split(/([!?,;:.&"-]+|\S*[A-Z]\.|\S*(?:[^!?,;:.\s&-]))/);
  array = goog.array.filter(array, function(word) {
    return /** @type {boolean} */(word.length && word != ' ');
  });
  return array;
};


/**
 * Convert text into array of sentences.
 * @param {string} text Text for converting.
 * @return {Array<string>} text represented as array of string arrays.
 * */
anychart.wordtreeModule.Chart.prototype.proceedText = function(text) {
  var sentences = this.getSentences(/** @type {string} */(text));
  var sentencesAsArrayOfWords = [];
  for (var i = 0; i < sentences.length; i++) {
    sentencesAsArrayOfWords.push(this.getWords(sentences[i]));
  }
  return sentencesAsArrayOfWords;
};


/**
 * Proceed data for implicit chart type.
 * @param {string|
 * Array<Array<string>>|
 * Array<string>} data
 * */
anychart.wordtreeModule.Chart.prototype.proceedData = function(data) {
  this.type_ = anychart.wordtreeModule.Chart.Type.IMPLICIT;
  this.rawData_ = data;
  if (goog.typeOf(data) == 'array' && data.length) {
    this.implicitData = [];
    if (goog.typeOf(data[0]) == 'array') {
      for (var i = 0; i < data.length; i++) {
        this.implicitData.push(this.getWords(data[i][0]));
      }
    } else if (goog.typeOf(data[0]) == 'string') {
      for (var i = 0; i < data.length; i++) {
        this.implicitData.push(this.getWords(data[i]));
      }
    }
  } else if (goog.typeOf(data) == 'string') {
    this.implicitData = this.proceedText(/** @type {string} */(data));
  } else {
    this.implicitData = [[data.toString()]];
  }
  if (!this.data_) {
    this.implicitDataSetup_(anychart.data.tree());
  }
  this.forceRecreate = true; //prevent situation when text has same first word and no search word passed
  this.word(this.implicitData[0][0]);
};


/**
 * Data setup for implicit chart type.
 * @param {anychart.treeDataModule.Tree|anychart.treeDataModule.View} data
 * @private
 * */
anychart.wordtreeModule.Chart.prototype.implicitDataSetup_ = function(data) {
  if (goog.isDefAndNotNull(this.data_)) {
    this.data_.unlistenSignals(this.dataInvalidated_, this);
    this.data_.dispose();
  }
  this.data_ = data;
  this.data_.listenSignals(this.dataInvalidated_, this);
  this.invalidate(anychart.ConsistencyState.TREE_DATA | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Get/set data for chart.
 * @param {?(anychart.treeDataModule.Tree|anychart.treeDataModule.View|string|Array<(Array<string>|string|Object)>)=} opt_value
 * @param {anychart.enums.TreeFillingMethod=} opt_fillMethod - Fill method.
 * @return {anychart.treeDataModule.Tree|anychart.wordtreeModule.Chart}
 * */
anychart.wordtreeModule.Chart.prototype.data = function(opt_value, opt_fillMethod) {
  if (goog.isDef(opt_value)) {
    if ((anychart.utils.instanceOf(opt_value, anychart.treeDataModule.Tree) ||
            anychart.utils.instanceOf(opt_value, anychart.treeDataModule.View))) {
      if (this.data_ != opt_value) {
        if (this.data_) {
          this.data_.unlistenSignals(this.dataInvalidated_, this);
        }
        this.data_ = opt_value;
        this.data_.listenSignals(this.dataInvalidated_, this);
        this.type_ = anychart.wordtreeModule.Chart.Type.EXPLICIT;
        this.invalidate(anychart.ConsistencyState.TREE_DATA | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
      }
    } else if (goog.typeOf(opt_value) == 'array' && goog.typeOf(opt_value[0]) == 'object') {
      this.data(/** @type {anychart.treeDataModule.Tree} */(anychart.data.tree(/** @type {Array<Object>} */(opt_value), opt_fillMethod)));
    } else if (goog.isNull(opt_value)) {
      if (this.data_) {
        this.data_.unlistenSignals(this.dataInvalidated_);
        this.data_.dispose();
      }
      this.data_ = null;
      this.invalidate(anychart.ConsistencyState.TREE_DATA | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
    }
    else {
      //implicit data
      this.proceedData(/**
       * @type {string|
       * Array<Object>|
       * Array<Array<string>>|
       * Array<string>} */(opt_value));
    }

    return this;
  }
  return this.data_;
};

//Comment sort method for better time
// /**
//  * Weight comparator.
//  * @param {boolean} ascending
//  * @return {Function}
//  * */
// anychart.wordtreeModule.Chart.weightComparator = function(ascending) {
//   var asc = ascending ? 1 : -1;
//   return function(a, b) {
//     var aValue = a.meta('weight');
//     var bValue = b.meta('weight');
//     return asc * (aValue - bValue);
//   };
// };
//
//
// /**
//  * Alphabet comparator.
//  * @param {boolean} ascending
//  * @return {Function}
//  * */
// anychart.wordtreeModule.Chart.alphabetComparator = function(ascending) {
//   var asc = ascending ? 1 : -1;
//   return function(a, b) {
//     var aValue = a.get('value');
//     var bValue = b.get('value');
//     return asc * (aValue > bValue ? 1 : aValue < bValue ? -1 : 0);
//   };
// };
//
//
// /**
//  * Sort tree by type.
//  * @private
//  * */
// anychart.wordtreeModule.Chart.prototype.sortFunction_ = function() {
//   var type = this.getOption('sortBy');
//   switch (type) {
//     case anychart.wordtreeModule.Chart.SortType.ALPHABET_ASC:
//       this.sort_(this.root_, anychart.wordtreeModule.Chart.alphabetComparator(true));
//       break;
//     case anychart.wordtreeModule.Chart.SortType.ALPHABET_DESC:
//       this.sort_(this.root_, anychart.wordtreeModule.Chart.alphabetComparator(false));
//       break;
//     case anychart.wordtreeModule.Chart.SortType.WEIGHT_ASC:
//       this.sort_(this.root_, anychart.wordtreeModule.Chart.weightComparator(true));
//       break;
//     case anychart.wordtreeModule.Chart.SortType.WEIGHT_DESC:
//       this.sort_(this.root_, anychart.wordtreeModule.Chart.weightComparator(false));
//       break;
//     case anychart.wordtreeModule.Chart.SortType.AS_IS:
//       //Rebuild tree for current word
//       var word = this.searchWord_;
//       this.searchWord_ = null;
//       this.word(word);
//       break;
//     default:
//       break;
//   }
// };
//
//
// /**
//  * Sort children of tree recursive.
//  * @param {anychart.treeDataModule.Tree.DataItem} node
//  * @param {Function} sortFunction
//  * @private
//  * */
// anychart.wordtreeModule.Chart.prototype.sort_ = function(node, sortFunction) {
//   if (node) {
//     //We need direct access for the root children
//     var children = node.getChildrenUnsafe();
//     if (children) {
//       goog.array.sort(children, sortFunction);
//       for (var i = 0; i < children.length; i++) {
//         this.sort_(children[i], sortFunction);
//       }
//     }
//   }
// };


//endregion
//region Drawing
/**
 * Compute fontSize for passed node, based on node height.
 * @param {?anychart.treeDataModule.Tree.DataItem} node
 * @param {boolean} hasHidden Has hidden siblings.
 * @return {number} font size for passed node.
 * */
anychart.wordtreeModule.Chart.prototype.getFontSize = function(node, hasHidden) {
  if (node) {
    var fontSize = node.get('fontSize');
    if (goog.isDefAndNotNull(fontSize)) {
      return /** @type {number} */(fontSize);
    } else {
      var parent = node.getParent();
      if (parent) {
        if (parent.numChildren() == 1 || hasHidden) {
          fontSize = this.getFontSize(parent, hasHidden);
          node.meta('fontSize', fontSize);
          return fontSize;
        }
      }
      var maxFontSize = /** @type {number} */(this.getOption('maxFontSize'));
      var minFontSize = /** @type {number} */(this.getOption('minFontSize'));

      //relation between line height and font size.
      //suppose line height equal node height
      var calculated = /** @type {number} */(node.meta('height')) / this.lineHeightFactor_;
      fontSize = goog.math.clamp(calculated, minFontSize, maxFontSize); //clamp font size between max and min
      node.meta('fontSize', fontSize);
      return fontSize;
    }
  }
  return 0;
};


/**
 * Apply font settings for text elements.
 * */
anychart.wordtreeModule.Chart.prototype.applyFontSettings = function() {
  var node;
  var textElement;

  var fontColor;
  var fontDecoration;
  var fontStyle;
  var fontOpacity;
  var chartFontColor = this.getOption('fontColor');
  var chartFontDecoration = this.getOption('fontDecoration');
  var chartFontStyle = this.getOption('fontStyle');
  var chartFontOpacity = this.getOption('fontOpacity');

  for (var i = 0; i < this.textElements_.length; i++) {
    textElement = this.textElements_[i];

    if (textElement.tag && textElement.tag.node) {
      node = textElement.tag.node;
      fontColor = node.get('fontColor') || chartFontColor;
      fontDecoration = node.get('fontDecoration') || chartFontDecoration;
      fontStyle = node.get('fontStyle') || chartFontStyle;
      fontOpacity = node.get('fontOpacity') || chartFontOpacity;
    }
    textElement.color(/** @type{string} */(fontColor));
    textElement.decoration(/** @type {(acgraph.vector.Text.Decoration|string)} */(fontDecoration));
    textElement.fontStyle(/** @type {(acgraph.vector.Text.FontStyle|string)} */(fontStyle));
    textElement.opacity(/** @type {number} */(fontOpacity));
    textElement.selectable(false);
  }
};


/**
 * Return text element from pool if not empty or create new.
 * @return {acgraph.vector.Text}
 * */
anychart.wordtreeModule.Chart.prototype.getTextElement = function() {
  var element;
  if (this.textPool_.length > 0) {
    element = this.textPool_.pop();
  } else {
    element = new acgraph.vector.Text();
  }
  return element;
};


/**
 * Width of current node, contains sum of word length and left/right padding.
 * @param {?anychart.treeDataModule.Tree.DataItem} node
 * @return {number} width of node in pixels.
 * */
anychart.wordtreeModule.Chart.prototype.nodeWidth = function(node) {
  if (node) {
    var lengthOfWord = /** @type {number} */(node.meta('textWidth'));
    var wordPadding = /** @type {number} */(this.connectors().getOption('offset'));
    var parent = node.getParent();
    if (parent && parent.numChildren() > 1)
      lengthOfWord += wordPadding;
    if (node.numChildren() > 1)
      lengthOfWord += wordPadding;
    return lengthOfWord;
  }
  return 0;
};


/**
 * Set leaf count for node recursive.
 * @param {?anychart.treeDataModule.Tree.DataItem} node
 * @return {number} leaf count of current node.
 * */
anychart.wordtreeModule.Chart.prototype.leaf = function(node) {
  if (node) {
    var childrenCount = node.numChildren();
    var leaf = 0;
    if (childrenCount) {
      for (var i = 0; i < childrenCount; i++) {
        leaf += this.leaf(/** @type {anychart.treeDataModule.Tree.DataItem}} */(node.getChildAt(i)));
      }
    } else {
      leaf = /** @type {number} */(node.get('weight')) || 1;
    }

    node.meta('leafCount', leaf).meta('weight', leaf);
    return leaf;
  }
  return 0;
};


/**
 * Set depth value for node recursive.
 * @param {anychart.treeDataModule.Tree.DataItem|null|undefined} node
 * */
anychart.wordtreeModule.Chart.prototype.depth = function(node) {
  if (node) {
    var childrenCount = node.numChildren();
    var depth = 0;
    var parent = node.getParent();
    if (parent) {
      depth = parent.meta('depth') + 1;
    }
    node.meta('depth', depth);
    for (var i = 0; i < childrenCount; i++) {
      this.depth(/** @type {anychart.treeDataModule.Tree.DataItem} */(node.getChildAt(i)));
    }
  }
};


/**
 * Draw text element and return it.
 * @param {number} x position by x.
 * @param {number} y position by y.
 * @param {string} text
 * @param {number} fontSize
 * @param {string} fontFamily
 * @param {string|number} fontWeight
 * @return {acgraph.vector.Text} text element with main settings.
 * */
anychart.wordtreeModule.Chart.prototype.drawText = function(x, y, text, fontSize, fontFamily, fontWeight) {
  var textElement = /** @type {acgraph.vector.Text} */(this.getTextElement());
  if (!textElement.tag) {
    textElement.tag = /** @type {anychart.wordtreeModule.Chart.DOMdata} */({});
  }

  textElement.text(text);
  textElement.y(y);
  textElement.x(x);
  textElement.fontSize(fontSize);
  textElement.fontFamily(fontFamily);
  textElement.fontWeight(fontWeight);
  textElement.width(null);
  textElement.visible(true);

  this.textElements_.push(textElement);
  return textElement;
};


/**
 * Draw connector between two nodes.
 * @param {number} x0 from x coordinate.
 * @param {number} y0 from y coordinate.
 * @param {number} x1 to x coordinate.
 * @param {number} y1 to y coordinate.
 * @param {number} curveFactor
 * */
anychart.wordtreeModule.Chart.prototype.drawConnector = function(x0, y0, x1, y1, curveFactor) {
  var path = this.connectorElement_;
  var xi = this.interpolateNumber(x0, x1);
  var x2 = xi(curveFactor);
  var x3 = xi(1 - curveFactor);
  path.moveTo(x0, y0).curveTo(x2, y0, x3, y1, x1, y1);
};


/**
 * Draw passed node.
 * @param {anychart.treeDataModule.Tree.DataItem} node
 * @param {boolean} hasHidden Has hidden siblings.
 * */
anychart.wordtreeModule.Chart.prototype.drawNode = function(node, hasHidden) {
  var paddingLeft = 0;
  var parent = node.getParent();
  var word;
  var height;
  var width;

  if (parent && parent.numChildren() > 1) {
    paddingLeft += /** @type {number} */(this.connectors().getOption('offset'));
  }
  word = /** @type {string} */(node.get('value'));

  if (node.numChildren() == 1) {
    word += ' ';
  }

  var wordPositionX = /** @type {number} */(node.meta('nodePositionX')) + paddingLeft;
  var wordPositionY = /** @type {number} */(node.meta('nodePositionY'));
  var fontFamily = /** @type {string} */(node.get('fontFamily') || this.getOption('fontFamily'));
  var fontWeight = /** @type {string|number} */(node.get('fontWeight') || this.getOption('fontWeight'));
  var fontSize = this.getFontSize(node, hasHidden);
  var textElement = this.drawText(wordPositionX, wordPositionY, word, fontSize, fontFamily, fontWeight);

  textElement.tag = /** @type {anychart.wordtreeModule.Chart.DOMdata} */({
    node: node,
    type: 'node',
    isPlug: false
  });

  height = textElement.getTextHeight();
  width = textElement.getTextWidth();

  node.meta('textHeight', height).meta('textWidth', width);

  wordPositionY -= /** @type {number} */(height) / 2;

  var wordEnd = wordPositionX + width;
  var boundsRight = this.contentBounds.getRight();
  if (wordEnd > boundsRight) {
    var difference = wordEnd - boundsRight;
    textElement.width(width - difference - width * 0.05); //set with width some gap
  }

  textElement.x(wordPositionX).y(wordPositionY);
};


/**
 * Draw all children of passed node.
 * @param {?anychart.treeDataModule.Tree.DataItem} node
 * @param {Array<number>} currentNodeStartPosition x and y position for current node.
 * @param {number} xOffsetFromPrevious offset from previous node.
 * @param {number} yMin top position of current node.
 * @param {number} yMax bottom position of current node.
 * */
anychart.wordtreeModule.Chart.prototype.drawAllChildren = function(node, currentNodeStartPosition, xOffsetFromPrevious, yMin, yMax) {
  if (node) {
    node.meta('connectorInXPosition', currentNodeStartPosition[0])
        .meta('connectorInYPosition', currentNodeStartPosition[1])
        .meta('connectorOutXPosition', currentNodeStartPosition[0] + this.nodeWidth(node))
        .meta('connectorOutYPosition', currentNodeStartPosition[1]);
    var boundsRight = this.contentBounds.getRight();
    if (xOffsetFromPrevious < boundsRight) { //Draw nodes only inside bounds
      var connectors = this.connectors();
      var childrenLength = /** @type {number} */(node.numChildren());
      var connectorLength = /** @type {number} */(connectors.getOption('length'));
      var connectorOffset = /** @type {number} */(connectors.getOption('offset'));
      var connectorCurveFactor = /** @type {number} */(connectors.getOption('curveFactor'));
      var minFontSize = /** @type {number} */(this.getOption('minFontSize'));

      if (childrenLength) {
        //Add padding top and bottom
        if (childrenLength > 1) {
          var paddingTopBottom = minFontSize / 10;
          yMin += paddingTopBottom;
          yMax -= paddingTopBottom;
        }
        var yEndPrev = yMin;
        var hasHidden = false;
        var currentChildrenElement;

        //Check if current node has hidden siblings
        for (var i = 0; i < childrenLength; i++) {
          currentChildrenElement = node.getChildAt(i);
          if (currentChildrenElement.meta('hidden')) {
            hasHidden = true;
            break;
          }
        }

        //If children height less then minimum font size draw count of children leaf
        if ((yMax - yMin) / childrenLength < minFontSize * this.lineHeightFactor_ && childrenLength > 1) {
          var text = '+' + node.meta('leafCount') + ' ' + this.getOption('postfix');
          var y = (yMax + yMin) / 2;
          var x = xOffsetFromPrevious;
          var textElement = this.drawText(x, y, text,
              /** @type {number} */(node.meta('fontSize') || minFontSize),
              /** @type {string} */(this.getOption('fontFamily')),
              /** @type {string|number} */(this.getOption('fontWeight')));
          y = y - textElement.getTextHeight() / 2;
          textElement.y(y);
          textElement.tag.node = node;
          textElement.tag.isPlug = true;
          var textWidth = textElement.getTextWidth();
          var wordEnd = x + textWidth;
          if (wordEnd >= boundsRight) {
            textElement.visible(false);
          }

          this.drawConnector(
              /** @type {number} */(node.meta('connectorOutXPosition')),
              /** @type {number} */(node.meta('connectorOutYPosition')),
              /** @type {number} */(node.meta('connectorOutXPosition')) + this.offsetForPlug_,
              (yMax + yMin) / 2,
              /** @type {number} */(connectorCurveFactor)
          );
          return;
        }

        if (hasHidden)
          xOffsetFromPrevious -= connectorLength + connectorOffset;
        for (var i = 0; i < childrenLength; i++) {
          currentChildrenElement = node.getChildAt(i);
          if (currentChildrenElement.meta('hidden')) { //if current children is hidden draw next
            continue;
          }

          var childrenWeight = currentChildrenElement.meta('leafCount');
          var nodeWeight = /** @type{number} */(node.meta('leafCount'));
          var nodeHeight = hasHidden ? (yMax - yMin) : ((yMax - yMin) * Math.max(1, childrenWeight) / Math.max(1, nodeWeight));
          var yStart = yEndPrev;
          var nextChildXOffset = 0;
          var childPosition;
          var halfTextHeight;
          var widthOfNode;
          var currentChildPosition;

          yEndPrev = yStart + nodeHeight;
          x = xOffsetFromPrevious;
          y = (yStart + nodeHeight / 2);
          childPosition = [x, y];

          currentChildrenElement.meta('height', nodeHeight)
              .meta('nodePositionX', x)
              .meta('nodePositionY', y);

          this.drawNode(currentChildrenElement, hasHidden);

          halfTextHeight = /** @type {number} */(node.meta('textHeight')) / 2;
          childPosition[1] -= halfTextHeight;

          if (currentChildrenElement.numChildren() != 1) {
            nextChildXOffset += connectorLength;
          }

          widthOfNode = /** @type {number} */(this.nodeWidth(currentChildrenElement));
          currentChildPosition = [childPosition[0], childPosition[1] + halfTextHeight];
          nextChildXOffset += childPosition[0] + widthOfNode;

          this.drawAllChildren(currentChildrenElement, currentChildPosition, nextChildXOffset, yStart, yStart + nodeHeight);

          if (node.numChildren() > 1 && !hasHidden)
            this.drawConnector(
                /** @type {number} */(node.meta('connectorOutXPosition')),
                /** @type {number} */(node.meta('connectorOutYPosition')),
                /** @type {number} */(currentChildrenElement.meta('connectorInXPosition')),
                /** @type {number} */(currentChildrenElement.meta('connectorInYPosition')),
                connectorCurveFactor);
        }
      }
    }
  }
};


/** @inheritDoc */
anychart.wordtreeModule.Chart.prototype.drawContent = function(bounds) {
  if (this.isConsistent())
    return;

  if (!this.rootLayer) {
    this.rootLayer = this.rootElement.layer();
    this.connectorElement_ = new acgraph.vector.Path();
    this.rootLayer.zIndex(anychart.wordtreeModule.Chart.Z_INDEX);
  }

  if (this.isNoData()) {
    this.rootLayer.removeChildren();
    return;
  }

  var node = this.root_ = this.data_.getChildAt(0);

  // calculates everything that can be calculated from data
  if (this.hasInvalidationState(anychart.ConsistencyState.TREE_DATA)) {
    this.leaf(this.root_);
    this.depth(this.root_);
    this.nodes_.length = 0;
    this.nodes_ = this.data().getTraverser().toArray();

    this.markConsistent(anychart.ConsistencyState.TREE_DATA);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.rootLayer.removeChildren();
    var nodePosition;
    var element;
    var xOffset;
    var xCoord = bounds.left;
    var yCoord = bounds.top;
    var width = bounds.width;
    var height = bounds.height;
    var connectors = this.connectors();
    var connectorsOffset = connectors.getOption('offset');

    //Add text element already drawn in to pool of text elements
    for (var i = 0; i < this.textElements_.length; i++) {
      element = this.textElements_[i];
      this.textPool_.push(element);
    }

    this.textElements_.length = 0;
    this.connectorElement_.clear();
    this.rootLayer.suspend();

    nodePosition = [xCoord + connectorsOffset, yCoord + height / 2];
    node.meta('nodePositionX', nodePosition[0])
        .meta('nodePositionY', nodePosition[1])
        .meta('height', height);
    this.drawNode(node, false);

    xOffset = /** @type {number} */(xCoord + connectorsOffset + this.nodeWidth(node) + (node.numChildren() > 1 ? connectors.getOption('length') : 0));
    this.drawAllChildren(node, nodePosition, xOffset, yCoord, yCoord + height);
    this.connectorElement_.parent(this.rootLayer);
    this.markConsistent(anychart.ConsistencyState.BOUNDS);

    for (var i = 0; i < this.textElements_.length; i++) {
      this.textElements_[i].parent(this.rootLayer);
    }

    this.rootLayer.resume();
    this.invalidate(anychart.ConsistencyState.APPEARANCE); //text element can get different font color from pool, need to set it manually
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.rootLayer.suspend();//suspend layer because method applyFontSettings change settings for many text elements.
    this.connectorElement_.stroke(/** @type {acgraph.vector.Stroke} */(this.connectors().getOption('stroke')));
    this.applyFontSettings();
    this.rootLayer.resume();
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }
};


//endregion
//region Serialize, setup, dispose
/** @inheritDoc */
anychart.wordtreeModule.Chart.prototype.serialize = function() {
  var json = anychart.wordtreeModule.Chart.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.wordtreeModule.Chart.OWN_DESCRIPTORS, json);

  if (this.type_ == anychart.wordtreeModule.Chart.Type.IMPLICIT) {
    //Serialize raw data for user can recreate tree on different word
    json['wordTreeRawData'] = JSON.stringify(this.rawData_);
    json['word'] = this.searchWord_;
  }
  json['treeData'] = this.data().serializeWithoutMeta(['hidden']);
  json['connectors'] = this.connectors().serialize();
  return {'chart': json};
};


/** @inheritDoc */
anychart.wordtreeModule.Chart.prototype.setupByJSON = function(config, opt_default) {
  anychart.wordtreeModule.Chart.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.wordtreeModule.Chart.OWN_DESCRIPTORS, config, opt_default);

  if ('wordTreeRawData' in config) {
    this.data(/** @type {(Array<(Object|Array<string>|string)>)} */(JSON.parse(config['wordTreeRawData'])));
    if ('word' in config) {
      this.word(config['word']);
    }
    if ('treeData' in config) {
      this.implicitDataSetup_(anychart.treeDataModule.Tree.fromJson(config['treeData']));
    }
  } else if ('treeData' in config)
    this.data(/** @type {anychart.treeDataModule.Tree} */(anychart.treeDataModule.Tree.fromJson(config['treeData'])));

  if ('connectors' in config)
    this.connectors().setupInternal(!!opt_default, config['connectors']);
};


/** @inheritDoc */
anychart.wordtreeModule.Chart.prototype.disposeInternal = function() {
  anychart.wordtreeModule.Chart.base(this, 'disposeInternal');
  goog.disposeAll(
      this.connectors_,
      this.connectorElement_,
      this.textElements_,
      this.textPool_,
      this.data_,
      this.rootLayer);
  this.connectors_ = null;
  this.connectorElement_ = null;
  this.data_ = null;
  this.textElements_.length = 0;
  this.textPool_.length = 0;
  this.rootLayer = null;
};


//endregion
//region Exports
(function() {
  var proto = anychart.wordtreeModule.Chart.prototype;
  proto['connectors'] = proto.connectors;
  proto['word'] = proto.word;
  proto['getType'] = proto.getType;
  proto['drillTo'] = proto.drillTo;
  proto['drillUp'] = proto.drillUp;
  proto['toCsv'] = proto.toCsv;
  proto['noData'] = proto.noData;
})();


//endregion

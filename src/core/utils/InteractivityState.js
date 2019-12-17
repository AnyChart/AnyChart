goog.provide('anychart.core.utils.InteractivityState');
goog.provide('anychart.core.utils.LinearGaugeInteractivityState');
goog.provide('anychart.core.utils.PieInteractivityState');



/**
 * Interactivity state class.
 * @param {anychart.core.utils.IInteractiveSeries} target Target for integrate interactivity states.
 * Series of chart or series like chart (pie, PyramidFunnelBase charts and e.g.).
 * @constructor
 */
anychart.core.utils.InteractivityState = function(target) {
  /**
   * Link to series for appearance manipulation.
   * @type {anychart.core.utils.IInteractiveSeries}
   */
  this.target = target;

  /**
   * Array of point indexes. Sorted by point index. Sync with this.stateIndex array.
   * @type {Array.<number>}
   */
  this.stateIndex = [];

  /**
   * Array of point states. Sorted by point index. Sync with this.stateIndex array.
   * @type {Array.<anychart.PointState|number>}
   */
  this.stateValue = [];

  /**
   * Series state.
   * @type {anychart.PointState|number}
   */
  this.seriesState = anychart.PointState.NORMAL;
};


/**
 * Set point state.
 * @param {anychart.PointState|number} state .
 * @param {number} index .
 * @param {(anychart.PointState|number)=} opt_stateToChange .
 * @param {*=} opt_rval
 * @return {*}
 * @protected
 */
anychart.core.utils.InteractivityState.prototype.setPointStateInternal = function(state, index, opt_stateToChange, opt_rval) {
  if (isNaN(index)) return opt_rval;

  var arrIndex = goog.array.binarySearch(this.stateIndex, index);
  //if state is normal - remove state.
  if (state == anychart.PointState.NORMAL) {
    if (arrIndex > 0)
      opt_rval = this.doRemovePointStateInternal(state, arrIndex, opt_rval);
  } else {
    //if state by index doesn't found then adds it
    //else updates state.
    var updatePoint = true;
    var updateSeries = this.updateRules(state, NaN);

    if (arrIndex < 0) {
      goog.array.insertAt(this.stateIndex, index, ~arrIndex);
      goog.array.insertAt(this.stateValue, state, ~arrIndex);
    } else {
      updatePoint = !this.isStateContains(this.stateValue[arrIndex], state);
      if (updatePoint) {
        this.stateValue[arrIndex] |= state;
      } else if (goog.isDef(opt_stateToChange)) {
        this.stateValue[arrIndex] = opt_stateToChange;
      }
    }

    if (this.target.enabled() && this.target.getIterator().select(index)) {
      if (!this.target.isDiscreteBased() && this.target.hoverMode() == anychart.enums.HoverMode.SINGLE) {
        if (updateSeries) {
          this.target.applyAppearanceToSeries(state);
        } else if (goog.isDef(opt_stateToChange) && !updateSeries && this.updateRules(state, NaN)) {
          this.target.applyAppearanceToSeries(opt_stateToChange);
        }
      }
      if (updatePoint) {
        opt_rval = this.target.applyAppearanceToPoint(state, opt_rval);
      } else if (goog.isDef(opt_stateToChange)) {
        opt_rval = this.target.applyAppearanceToPoint(opt_stateToChange, opt_rval);
      }
    }
  }
  return opt_rval;
};


/**
 * Rules of update points.
 * @param {anychart.PointState|number} state .
 * @param {number=} opt_index .
 * @return {boolean}
 * @protected
 */
anychart.core.utils.InteractivityState.prototype.updateRules = function(state, opt_index) {
  var stateToCheck;
  if (goog.isDef(opt_index)) {
    if (isNaN(opt_index)) {
      return !this.hasPointState(anychart.PointState.SELECT) && !this.isStateContains(this.seriesState, anychart.PointState.SELECT);
    } else {
      stateToCheck = this.getPointStateByIndex(+opt_index);
    }
  } else {
    stateToCheck = this.seriesState;
  }

  return !this.isStateContains(stateToCheck, anychart.PointState.SELECT);
};


/**
 * Returns series state relative points states.
 * @return {anychart.PointState|number}
 * @protected
 */
anychart.core.utils.InteractivityState.prototype.getSeriesStateForUpdate = function() {
  if (this.hasPointState(anychart.PointState.SELECT)) {
    return anychart.PointState.SELECT;
  } else if (this.hasPointState(anychart.PointState.HOVER)) {
    return anychart.PointState.HOVER;
  } else {
    return anychart.PointState.NORMAL;
  }
};


/**
 * Sets state for points or series.
 * @param {anychart.PointState|number} state State to set for points or series.
 * @param {(number|Array.<number>|boolean)=} opt_index If it's passed than it means that points with passed indexes will get
 * state, otherwise series will get passed state.
 * @param {(anychart.PointState|number)=} opt_stateToChange If a value is passed than points that already have a state will change
 * their state to opt_stateToChange.
 */
anychart.core.utils.InteractivityState.prototype.setPointState = function(state, opt_index, opt_stateToChange) {
  var i, iterator, index;
  if (goog.isDef(opt_index)) {
    var val = this.target.getStartValueForAppearanceReduction();
    iterator = this.target.getIterator();
    var rowsCount = iterator.getRowsCount();
    var ret = true;
    if (goog.isBoolean(opt_index) && opt_index) {
      var currIndex = iterator.getIndex();
      for (i = rowsCount; i--;) {
        val = this.setPointStateInternal(state, i, opt_stateToChange, val);
        ret = false;
      }
      iterator.select(currIndex);
    } else if (goog.isArray(opt_index)) {
      goog.array.sort(opt_index);
      for (i = opt_index.length; i--;) {
        var ind = +opt_index[i];
        if (ind < rowsCount) {
          val = this.setPointStateInternal(state, ind, opt_stateToChange, val);
          ret = false;
        }
      }
    } else if (+opt_index < rowsCount) {
      val = this.setPointStateInternal(state, +opt_index, opt_stateToChange, val);
      ret = false;
    }
    if (ret)
      return;
    this.target.finalizePointAppearance(val);
  } else if (!this.isStateContains(this.seriesState, state)) {
    var removeState = anychart.PointState.NORMAL;
    if (state == anychart.PointState.NORMAL || state == anychart.PointState.HOVER) {
      removeState = anychart.PointState.HOVER;
    } else if (state == anychart.PointState.SELECT) {
      removeState = anychart.PointState.SELECT | anychart.PointState.HOVER;
    }

    for (i = this.stateValue.length; i--;) {
      if (this.removePointStateByIndex(removeState, i)) {
        if (this.target.getIterator().select(this.stateIndex[i])) {
          this.target.applyAppearanceToPoint(anychart.PointState.NORMAL);
        }

        goog.array.splice(this.stateValue, i, 1);
        goog.array.splice(this.stateIndex, i, 1);
      }
    }
    this.target.finalizePointAppearance();

    if (this.updateRules(state)) {
      if (this.target.isConsistent()) {
        if (this.target.isDiscreteBased()) {
          iterator = this.target.getResetIterator();
          while (iterator.advance()) {
            index = iterator.getIndex();
            if (iterator.select(index) && this.updateRules(state, index)) {
              this.target.applyAppearanceToSeries(state);
            }
          }
        } else {
          if (this.updateRules(state, NaN))
            this.target.applyAppearanceToSeries(state);
        }
      }
      this.seriesState = /** @type {anychart.PointState|number} */(state);
    }
  }
};


/**
 * @param {anychart.PointState|number} state .
 * @param {number} index .
 * @param {*=} opt_rval .
 * @return {*}
 * @protected
 */
anychart.core.utils.InteractivityState.prototype.addPointStateInternal = function(state, index, opt_rval) {
  if (!this.target.getIterator().select(index))
    return opt_rval;

  var arrIndex = goog.array.binarySearch(this.stateIndex, index);
  //if state is normal - do nothing.
  if (state != anychart.PointState.NORMAL) {
    //if state by index doesn't found then adds it
    //else updates state.
    if (arrIndex < 0) {
      goog.array.insertAt(this.stateIndex, index, ~arrIndex);
      goog.array.insertAt(this.stateValue, state, ~arrIndex);

      if (this.seriesState == anychart.PointState.NORMAL)
        opt_rval = this.target.applyAppearanceToPoint(state, opt_rval);

      var updateSeries = this.updateRules(state, NaN);
      if (updateSeries && !this.target.isDiscreteBased() && this.target.hoverMode() == anychart.enums.HoverMode.SINGLE)
        this.target.applyAppearanceToSeries(state);
    } else
      this.stateValue[arrIndex] |= state;
  }
  return opt_rval;
};


/**
 * Adds state to point.
 * @param {anychart.PointState|number} state .
 * @param {(Array.<number>|number)=} opt_index .
 */
anychart.core.utils.InteractivityState.prototype.addPointState = function(state, opt_index) {
  var i;
  if (goog.isDef(opt_index)) {
    //If passed index out of index data, then do nothing
    if (opt_index >= this.target.getIterator().getRowsCount())
      return;
    var val = this.target.getStartValueForAppearanceReduction();
    if (goog.isArray(opt_index)) {
      goog.array.sort(opt_index);
      for (i = opt_index.length; i--;)
        val = this.addPointStateInternal(state, +opt_index[i], val);
    } else {
      val = this.addPointStateInternal(state, +opt_index, val);
    }
    this.target.finalizePointAppearance(val);
  } else {
    if (!this.isStateContains(this.seriesState, state)) {
      for (i = this.stateValue.length; i--;) {
        if (this.removePointStateByIndex(state, i)) {
          goog.array.splice(this.stateValue, i, 1);
          goog.array.splice(this.stateIndex, i, 1);
        }
      }
      this.seriesState = /** @type {anychart.PointState|number} */(state);
    } else if (state == anychart.PointState.HOVER) {
      for (i = this.stateValue.length; i--;) {
        if (this.removePointStateByIndex(state, i)) {
          goog.array.splice(this.stateValue, i, 1);
          goog.array.splice(this.stateIndex, i, 1);
        }
      }
      this.seriesState = anychart.PointState.NORMAL;
    } else if (state == anychart.PointState.SELECT) {
      this.stateValue.length = 0;
      this.stateIndex.length = 0;
      this.seriesState = anychart.PointState.NORMAL;
    }
  }
};


/**
 * Excludes (removes or clears) passed state from current point state.
 * @param {anychart.PointState|number} state State to exclude from current point state.
 * @param {number} index Index of array of states to exclude.
 * @return {boolean} Returns true if state is clear.
 * @protected
 */
anychart.core.utils.InteractivityState.prototype.removePointStateByIndex = function(state, index) {
  return !(this.stateValue[index] &= ~state);
};


/**
 * Apply appearance to target.
 * @param {anychart.PointState|number} state
 * @param {number} arrIndex
 * @param {*=} opt_rval
 * @return {*}
 * @protected
 */
anychart.core.utils.InteractivityState.prototype.doRemovePointStateInternal = function(state, arrIndex, opt_rval) {
  var pointIndex = this.stateIndex[arrIndex];
  if (this.removePointStateByIndex(state, arrIndex)) {
    goog.array.splice(this.stateIndex, arrIndex, 1);
    goog.array.splice(this.stateValue, arrIndex, 1);

    if (this.target.enabled() && this.target.getIterator().select(pointIndex) && this.seriesState == anychart.PointState.NORMAL) {
      opt_rval = this.target.applyAppearanceToPoint(anychart.PointState.NORMAL, opt_rval);
    }
  } else {
    if (this.target.enabled() && this.target.getIterator().select(pointIndex) && this.seriesState == anychart.PointState.NORMAL) {
      opt_rval = this.target.applyAppearanceToPoint(this.stateValue[arrIndex], opt_rval);
    }
  }
  return opt_rval;
};


/**
 * Removes state by index.
 * @param {anychart.PointState|number} state
 * @param {number} index
 * @param {*=} opt_rval
 * @return {*}
 * @protected
 */
anychart.core.utils.InteractivityState.prototype.removePointStateInternal = function(state, index, opt_rval) {
  if (isNaN(index)) return opt_rval;

  var arrIndex = goog.array.binarySearch(this.stateIndex, index);
  if (arrIndex >= 0)
    opt_rval = this.doRemovePointStateInternal(state, arrIndex, opt_rval);

  return opt_rval;
};


/**
 * Removes state for points or series.
 * @param {anychart.PointState|number} state State to remove for points or series.
 * @param {(number|Array.<number>|boolean)=} opt_index If it passed then it means that state of points with passed indexes will be
 * removed, otherwise state of series will set as normal.
 */
anychart.core.utils.InteractivityState.prototype.removePointState = function(state, opt_index) {
  var i, iterator;
  if (goog.isDef(opt_index)) {
    var val = this.target.getStartValueForAppearanceReduction();
    iterator = this.target.getIterator();
    var rowsCount = this.target.getIterator().getRowsCount();
    if (goog.isBoolean(opt_index) && opt_index) {
      var currIndex = iterator.getIndex();
      for (i = rowsCount; i--;)
        val = this.removePointStateInternal(state, i, val);
      iterator.select(currIndex);
    } else if (goog.isArray(opt_index)) {
      goog.array.sort(opt_index);
      for (i = opt_index.length; i--;)
        val = this.removePointStateInternal(state, +opt_index[i], val);
    } else if (isNaN(opt_index)) {
      for (i = this.stateIndex.length; i--;)
        val = this.doRemovePointStateInternal(state, i);
    } else
      val = this.removePointStateInternal(state, +opt_index, val);

    this.target.finalizePointAppearance(val);

    if (!this.target.isDiscreteBased() && this.target.hoverMode() == anychart.enums.HoverMode.SINGLE) {
      this.target.applyAppearanceToSeries(this.getSeriesStateForUpdate());
    }
  } else {
    for (i = this.stateValue.length; i--;) {
      if (this.removePointStateByIndex(state, i)) {
        if (this.target.getIterator().select(this.stateIndex[i])) {
          this.target.applyAppearanceToPoint(anychart.PointState.NORMAL);
        }

        goog.array.splice(this.stateIndex, i, 1);
        goog.array.splice(this.stateValue, i, 1);
      }
    }
    this.target.finalizePointAppearance();

    this.seriesState &= ~state;

    if (this.target.isConsistent()) {
      if (this.target.isDiscreteBased()) {
        iterator = this.target.getResetIterator();

        while (iterator.advance()) {
          var index = iterator.getIndex();
          if (iterator.select(index) && this.updateRules(state, index)) {
            this.target.applyAppearanceToSeries(this.seriesState);
          }
        }
      } else {
        this.target.applyAppearanceToSeries(this.seriesState);
      }
    }
  }
};


/**
 * Point indexes with passed state.
 * @param {anychart.PointState|number} state Point state.
 * @return {Array.<number>}
 */
anychart.core.utils.InteractivityState.prototype.getIndexByPointState = function(state) {
  var result = [];
  for (var i = 0, len = this.stateValue.length; i < len; i++) {
    if (this.hasPointStateByIndex(state, i))
      result.push(this.stateIndex[i]);
  }
  return result;
};


/**
 * Returns point state for index.
 * @param {number} index Point index.
 * @return {anychart.PointState|number}
 */
anychart.core.utils.InteractivityState.prototype.getPointStateByIndex = function(index) {
  var pointIndex = +index;
  if (!isNaN(pointIndex)) {
    var arrIndex = goog.array.binarySearch(this.stateIndex, pointIndex);
    return /** @type {anychart.PointState|number} */(arrIndex >= 0 ? this.stateValue[arrIndex] : anychart.PointState.NORMAL);
  }
  return anychart.PointState.NORMAL;
};


/**
 * Whether there is passed state by point index.
 * @param {anychart.PointState|number} state
 * @param {number} pointIndex
 * @return {boolean}
 */
anychart.core.utils.InteractivityState.prototype.hasPointStateByPointIndex = function(state, pointIndex) {
  var arrIndex = goog.array.binarySearch(this.stateIndex, pointIndex);
  return this.hasPointStateByIndex(state, arrIndex);
};


/**
 * Whether there is passed state by internal array index.
 * @param {anychart.PointState|number} state
 * @param {number} index
 * @return {boolean}
 * @protected
 */
anychart.core.utils.InteractivityState.prototype.hasPointStateByIndex = function(state, index) {
  return !!(state & this.stateValue[index]);
};


/**
 * Whether there is at least one with passed state.
 * @param {anychart.PointState|number} state Point state.
 * @return {boolean}
 */
anychart.core.utils.InteractivityState.prototype.hasPointState = function(state) {
  var index = goog.array.findIndex(this.stateValue, function(item) {
    return !!(item & state);
  });
  return index >= 0;
};


/**
 * Returns current series state.
 * @return {anychart.PointState|number}
 */
anychart.core.utils.InteractivityState.prototype.getSeriesState = function() {
  return this.seriesState;
};


/**
 * Check passed state for contains in other state.
 * @param {anychart.PointState|number} state
 * @param {anychart.PointState|number} stateToCheck
 * @return {boolean}
 */
anychart.core.utils.InteractivityState.prototype.isStateContains = function(state, stateToCheck) {
  return !!(state & stateToCheck);
};


/**
 * Clarifies the state to make it non-mixed. Returns the strongest state.
 * @param {number|anychart.PointState} state
 * @return {anychart.PointState}
 */
anychart.core.utils.InteractivityState.clarifyState = function(state) {
  // currently possible states are:
  // 0 - NORMAL
  // 1 - HOVER
  // 2 - SELECTED
  // 3 - SELECTED (mixed with HOVER)
  // other - SELECTED or HOVER depending on first two bits.
  // this function in case of mixed states returns the clear SELECTED or HOVER state.
  return /** @type {anychart.PointState} */(Math.min(
      state & (anychart.PointState.HOVER | anychart.PointState.SELECT),
      anychart.PointState.SELECT));
};


/**
 * Interactivity state class for linear gauge. Overrides setPointState method.
 * @param {anychart.linearGaugeModule.pointers.Base} target Pie chart.
 * @constructor
 * @extends {anychart.core.utils.InteractivityState}
 */
anychart.core.utils.LinearGaugeInteractivityState = function(target) {
  anychart.core.utils.LinearGaugeInteractivityState.base(this, 'constructor', target);
};
goog.inherits(anychart.core.utils.LinearGaugeInteractivityState, anychart.core.utils.InteractivityState);


/** @inheritDoc */
anychart.core.utils.LinearGaugeInteractivityState.prototype.setPointState = function(state, opt_index, opt_stateToChange) {
  var i;
  if (goog.isDef(opt_index)) {
    var rowsCount = this.target.getIterator().getRowsCount();
    var ret = true;
    if (goog.isArray(opt_index)) {
      goog.array.sort(opt_index);
      for (i = opt_index.length; i--;) {
        var ind = +opt_index[i];
        if (ind < rowsCount) {
          this.setPointStateInternal(state, ind, opt_stateToChange);
          ret = false;
        }
      }
    } else if (+opt_index < rowsCount) {
      this.setPointStateInternal(state, +opt_index, opt_stateToChange);
      ret = false;
    }
    if (ret)
      return;
    this.target.finalizePointAppearance();
  } else if (!this.isStateContains(this.seriesState, state)) {
    var removeState = anychart.PointState.NORMAL;
    if (state == anychart.PointState.NORMAL || state == anychart.PointState.HOVER) {
      removeState = anychart.PointState.HOVER;
    } else if (state == anychart.PointState.SELECT) {
      removeState = anychart.PointState.SELECT | anychart.PointState.HOVER;
    }

    for (i = this.stateValue.length; i--;) {
      if (this.removePointStateByIndex(removeState, i)) {
        if (this.target.getIterator().select(this.stateIndex[i])) {
          this.target.applyAppearanceToPoint(anychart.PointState.NORMAL);
        }

        goog.array.splice(this.stateValue, i, 1);
        goog.array.splice(this.stateIndex, i, 1);
      }
    }
    this.target.finalizePointAppearance();

    if (this.updateRules(state)) {
      if (this.target.isConsistent()) {
        if (this.updateRules(state, 0)) {
          this.target.applyAppearanceToSeries(state);
        }
      }
      this.seriesState = /** @type {anychart.PointState|number} */(state);
    }
  }
};


/** @inheritDoc */
anychart.core.utils.LinearGaugeInteractivityState.prototype.removePointState = function(state, opt_index) {
  var i;
  if (goog.isDef(opt_index)) {
    if (goog.isArray(opt_index)) {
      goog.array.sort(opt_index);
      for (i = opt_index.length; i--;)
        this.removePointStateInternal(state, +opt_index[i]);
    } else if (isNaN(opt_index)) {
      for (i = this.stateIndex.length; i--;)
        this.doRemovePointStateInternal(state, i);
    } else
      this.removePointStateInternal(state, +opt_index);

    this.target.finalizePointAppearance();

    if (!this.target.isDiscreteBased() && this.target.hoverMode() == anychart.enums.HoverMode.SINGLE) {
      this.target.applyAppearanceToSeries(this.getSeriesStateForUpdate());
    }
  } else {
    for (i = this.stateValue.length; i--;) {
      if (this.removePointStateByIndex(state, i)) {
        if (this.target.getIterator().select(this.stateIndex[i])) {
          this.target.applyAppearanceToPoint(anychart.PointState.NORMAL);
        }

        goog.array.splice(this.stateIndex, i, 1);
        goog.array.splice(this.stateValue, i, 1);
      }
    }
    this.target.finalizePointAppearance();

    this.seriesState &= ~state;

    if (this.target.isConsistent()) {
      if (this.updateRules(state, 0)) {
        this.target.applyAppearanceToSeries(this.seriesState);
      }
    }
  }
};

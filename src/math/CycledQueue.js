goog.provide('anychart.math.CycledQueue');
goog.require('anychart.utils');
goog.require('goog.math');



/**
 * Class for queues with random access by indexes. Default maximum queue length is 256. It dequeues automatically when
 * the length of the queue reaches that limit. So if you need larger queue - set the length limit explicitly.
 * @param {number=} opt_lengthLimit The maximum length of the queue. Defaults to 256.
 * @constructor
 */
anychart.math.CycledQueue = function(opt_lengthLimit) {
  /**
   * The length limit of the queue.
   * @type {number}
   * @private
   */
  this.lengthLimit_ = anychart.utils.normalizeToNaturalNumber(opt_lengthLimit, 256, false);

  /**
   * The storage for the queue.
   * @type {Array}
   * @private
   */
  this.storage_ = [];

  /**
   * Where the start of the queue is.
   * @type {number}
   * @private
   */
  this.startIndex_ = 0;

  /**
   * Current queue length.
   * @type {number}
   * @private
   */
  this.currentLength_ = 0;
};


/**
 * Enqueues passed item. If this call dequeued an item - returns it.
 * @param {*} item
 * @return {*}
 */
anychart.math.CycledQueue.prototype.enqueue = function(item) {
  var dequeuedItem = undefined;
  if (this.storage_.length < this.lengthLimit_) { // under limit => no cycling
    this.storage_.push(item);
    this.currentLength_++;
  } else { // storage length reached the limit
    // we put the item to the position next to the last item in queue
    var indexToWrite = (this.startIndex_ + this.currentLength_) % this.lengthLimit_;
    if (this.currentLength_ < this.lengthLimit_) {
      this.currentLength_++;
    } else { // if there are no more room in the queue - that we have dequeued the first element
      dequeuedItem = this.storage_[indexToWrite];
      this.incStart_();
    }
    this.storage_[indexToWrite] = item;
  }
  return dequeuedItem;
};


/**
 * Removes the first item from the queue and returns it.
 * @return {*}
 */
anychart.math.CycledQueue.prototype.dequeue = function() {
  var item;
  if (this.currentLength_) {
    item = this.storage_[this.startIndex_];
    this.incStart_();
    this.currentLength_--;
  }
  return item;
};


/**
 * Returns the queue item at the specified index. The index can be negative - that will interpreted as the index from
 * the end of the queue.
 * @param {number} index
 * @return {*}
 */
anychart.math.CycledQueue.prototype.get = function(index) {
  var storageIndex = (goog.math.modulo(+index, this.currentLength_) + this.startIndex_) % this.storage_.length;
  // if there were any problems with the length of the array - it would be NaN and we return nothing.
  return !isNaN(storageIndex) ? this.storage_[storageIndex] : undefined;
};


/**
 * Returns current queue length.
 * @return {number}
 */
anychart.math.CycledQueue.prototype.getLength = function() {
  return this.currentLength_;
};


/**
 * Clears the queue. You can optionally reset the queue length limit.
 * @param {number=} opt_newLengthLimit
 */
anychart.math.CycledQueue.prototype.clear = function(opt_newLengthLimit) {
  this.storage_.length = 0;
  this.currentLength_ = 0;
  this.startIndex_ = 0;
  this.lengthLimit_ = anychart.utils.normalizeToNaturalNumber(opt_newLengthLimit, this.lengthLimit_, false);
};


/**
 * Increments start pointer.
 * @private
 */
anychart.math.CycledQueue.prototype.incStart_ = function() {
  this.startIndex_ = (this.startIndex_ + 1) % this.storage_.length;
};


/**
 * Returns a queue with random access by indexes. Default maximum queue length is 256. It dequeues automatically when
 * the length of the queue reaches that limit. So if you need larger queue - set the length limit explicitly.
 * @param {number=} opt_lengthLimit The maximum length of the queue. Defaults to 256.
 * @return {!anychart.math.CycledQueue}
 */
anychart.math.cycledQueue = function(opt_lengthLimit) {
  return new anychart.math.CycledQueue(opt_lengthLimit);
};


//exports
(function() {
  var proto = anychart.math.CycledQueue.prototype;
  goog.exportSymbol('anychart.math.cycledQueue', anychart.math.cycledQueue);
  goog.exportSymbol('anychart.calculations.cycledQueue', anychart.math.cycledQueue);
  proto['enqueue'] = proto.enqueue;
  proto['dequeue'] = proto.dequeue;
  proto['get'] = proto.get;
  proto['getLength'] = proto.getLength;
  proto['clear'] = proto.clear;
})();

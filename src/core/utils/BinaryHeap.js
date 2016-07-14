goog.provide('anychart.core.utils.BinaryHeap');



/**
 * Anychart binary heap implementation.
 * https://en.wikipedia.org/wiki/Binary_heap
 * It can be max or min heap this depend from opt_compareFn function.
 * By default it's max binary heap with number type NODEs.
 * @param {Array.<NODE>} arr Heap base array.
 * @param {function(ROOT, CHILD): number=} opt_compareFn Function for comparing heap NODEs.
 * @template ROOT, CHILD, NODE
 * @constructor
 */
anychart.core.utils.BinaryHeap = function(arr, opt_compareFn) {
  this.compareFn = opt_compareFn || goog.array.defaultCompare;
  this.arr = arr;

  for (var i = Math.floor(arr.length / 2); i--;) {
    this.shiftDown(i);
  }
};


/**
 * Move a NODE down in the tree, as long as needed; used to restore heap condition after deletion or replacement.
 * @param {number} index NODE index in heap base array.
 */
anychart.core.utils.BinaryHeap.prototype.shiftDown = function(index) {
  var left = 2 * index + 1;
  var right = 2 * index + 2;
  var largest = index;

  if (left <= this.arr.length && this.compareFn(this.arr[left], this.arr[largest]) > 0) {
    largest = left;
  }
  if (right <= this.arr.length && this.compareFn(this.arr[right], this.arr[largest]) > 0) {
    largest = right;
  }

  if (largest != index) {
    this.swap(index, largest);
    this.shiftDown(largest);
  }
};


/**
 * Swaps NODE at index1 with NODE at index2 in heap base array.
 * @param {number} index1 NODE index in heap base array.
 * @param {number} index2 NODE index in heap base array.
 */
anychart.core.utils.BinaryHeap.prototype.swap = function(index1, index2) {
  var tmp = this.arr[index1];
  this.arr[index1] = this.arr[index2];
  this.arr[index2] = tmp;
};


/**
 * Removes and returns heep root element. And restore heap condition.
 * @return {NODE} .
 */
anychart.core.utils.BinaryHeap.prototype.pop = function() {
  this.swap(0, this.arr.length - 1);
  var resLabel = this.arr.pop();
  this.shiftDown(0);
  return resLabel;
};

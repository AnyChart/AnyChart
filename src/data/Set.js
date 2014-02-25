goog.provide('anychart.data.Set');

goog.require('anychart.data.IView');
goog.require('anychart.data.Mapping');
goog.require('anychart.utils.Invalidatable');
goog.require('goog.array');



/**
 * Хранилище для линейных (не древовидных и не иерархических) данных.<br/>
 * Понимает данные как массив рядов, которые состоят из колонок (см листинг 1).
 * Перед работой с этим хранилищем нужно задать способ адресации колонок в рядах с помощью метода
 * {@link anychart.data.Set#mapAs} (способов адресации колонок для хранилища может быть сколько угодно).<br/>
 * В качестве строки может быть: элемент, массив элементов, объект (под элементом понимается число, строка или функция).
 * Данные могут быть как однородными, так и разнородными, способ чтения данных регламентируется маппингом
 * {@link anychart.data.Set#mapAs}. Пример дефолтного маппинга см в Листингах 3-5 ниже.
 * @example <c>Листинг 1. Представление данных.</c><t>listingOnly</t>
 * // Col1 Col2 Col3
 *  [
 *   [110, 112, 114], // row1
 *   [210, 212, 214], // row2
 *   [310, 312, 314], // row3
 *   [410, 412, 414]  // row4
 *  ]
 * // Col1
 *  [
 *    114, // row1
 *    214, // row2
 *    314, // row3
 *    414  // row4
 *  ]
 * @example <c>Листинг 2. Примеры данных.</c><t>listingOnly</t>
 * // Массив чисел/строк/функций
 *  new anychart.data.Set([
 *    20,
 *    7,
 *    '10',
 *    function(smth){ return smth*10; }
 *    ]);
 * // Массив массивов
 *  new anychart.data.Set([
 *    [1, 22, 13],
 *    [13, 22, 23],
 *    [17, 22, 33],
 *    [21, 22, 43]
 *  ]);
 * // Массив объектов
 *  new anychart.data.Set([
 *    {name: 'Point 1', value: 10},
 *    {name: 'Point 2', value: 7},
 *    {name: 'Point 3', value: 20},
 *    {name: 'Point 4', value: 14}
 *  ]);
 * // Массив смешанных данных
 *  new anychart.data.Set([
 *    {value: 10, name: 'Point 1'},
 *    {value: 7, name: 'Point 2'},
 *    [20, 'Point 3'],
 *    [14, 'Point 4'],
 *    [-14, 'Point 5', function (params) { do_smth; return smth; }],
 *    '17',
 *    22,
 *    function (params) { do_smth; return smth; }
 *  ]);
 * @example <c>Листинг 3. Дефолтный маппинг данных. Числа.</c><t>listingOnly</t>
 * // 'x' - это индекс элемента, а 'value' - значение
 * // то есть:
 *   // исходные данные         интерпретирует как
 *   [
 *    1,                        {x: 0, value: 1}
 *    2,                        {x: 1, value: 2}
 *    '-5',                     {x: 2, value: -5}
 *    function(){ return 1;}    {x: 3, value: 1}
 *   ]
 *   // для случая OHLC - не приспособлена
 * @example <c>Листинг 4. Дефолтный маппинг данных. Массивы.</c><t>listingOnly</t>
 * // 'x' - элемент массива с индексом 0
 * // 'value' - элемент массива с индексом 1
 * // 'size' - элемент массива с индексом 2
 * // элементы массива с индексом более 2 никак не интерпретируются.
 * // то есть:
 *   // исходные данные          интерпретирует как
 *   [
 *      [2],                     {x: 2}
 *      [5, 13],                 {x: 5, value: 13}
 *      [7, '4', 21],            {x: 7, value: 4, size: 21}
 *      [11, 21, 34, 45]         {x: 11, value: 21, size: 34}
 *   ]
 *   // для случая OHLC
 *     // 'open' - элемент массива с индексом 0
 *     // 'high' - элемент массива с индексом 1
 *     // 'low' - элемент массива с индексом 2
 *     // 'close' - элемент массива с индексом 3
 *     // элементы массива с индексом более 3 никак не интерпретируются.
 *     // то есть:
 *     [
 *        [11, 21, 34, 45]         {open: 11, high: 21, low: 34, close: 45}
 *     ]
 * @example <c>Листинг 5. Дефолтный маппинг данных. Объекты.</c><t>listingOnly</t>
 * // В объектах все соответствует именам, кроме того, можно определять несколько
 * // соответсвий и приоритет. Например, поле 'x' ищется в поле 'x', а поле 'value'
 * // в полях: 'value', потом 'y', и в конце в 'close'.
 * // то есть:
 *   // исходные данные                 интерпретирует как
 *   [
 *      {x: 2},                           {x: 2}
 *      {x: 5, value: 13},                {x: 5, value: 13}
 *      {x: 7, y: 4, size: 21},           {x: 7, value: 4, size: 21}
 *      {x: 11, close: 21, size: 34}      {x: 11, value: 21, size: 34}
 *   ]
 *   // для случая OHLC
 *   [
 *     {open: 11, high: 21, low: 34, close: 45}   {open: 11, high: 21, low: 34, close: 45}
 *   ] // то есть:
 *     // 'open' - элемент массива с индексом 0
 *     // 'high' - элемент массива с индексом 1
 *     // 'low' - элемент массива с индексом 2
 *     // 'close' - элемент массива с индексом 3
 *     // элементы массива с индексом более 3 никак не интерпретируются.
 * @param {Array=} opt_data Data for the set can be passed here.
 * @constructor
 * @implements {anychart.data.IView}
 * @extends {anychart.utils.Invalidatable}
 */
anychart.data.Set = function(opt_data) {
  goog.base(this);
  this.data(opt_data || null);
};
goog.inherits(anychart.data.Set, anychart.utils.Invalidatable);


/**
 * Маска состояний рассинхронизации, которые умеет обрабатывать этот объект.
 * @type {number}
 */
anychart.data.Set.prototype.DISPATCHED_CONSISTENCY_STATES =
    anychart.utils.ConsistencyState.DATA;


/**
 * Internal data set storage.
 * @type {!Array}
 */
anychart.data.Set.prototype.storage_;


/**
 * Getter for Set data.
 * @return {!Array} Data array of the Set or the Set for chaining.
 *//**
 * Setter for Set data.
 * @example <t>listingOnly</t>
 * dataSet.data([20, 7, 10, 14]);
 * dataSet.data([
 *    [1, 22, 13],
 *    [13, 22, 23],
 *    [17, 22, 33],
 *    [21, 22, 43]
 *  ]);
 * dataSet.data([
 *    {name: 'Point 1', value: 10},
 *    {name: 'Point 2', value: 7},
 *    {name: 'Point 3', value: 20},
 *    {name: 'Point 4', value: 14}
 *  ]);
 * @param {Array=} opt_value Value to set.
 * @return {!anychart.data.Set} Экземпляр класса {@link anychart.data.Set} для цепочного вызова.
 *//**
 * @ignoreDoc
 * @param {Array=} opt_value .
 * @return {!(anychart.data.Set|Array)} .
 */
anychart.data.Set.prototype.data = function(opt_value) {
  if (goog.isDef(opt_value)) {
    anychart.globalLock.lock();
    if (goog.isArrayLike(opt_value)) {
      /** @type {!Array} */
      var data = goog.array.slice(opt_value, 0);
      for (/** @type {number} */ var i = data.length; i--;) {
        if (goog.isArrayLike(data[i]))
          data[i] = goog.array.slice(data[i], 0);
      }
      this.storage_ = data;
      this.dispatchInvalidationEvent(anychart.utils.ConsistencyState.DATA);
    } else {
      if (this.storage_ && this.storage_.length > 0) {
        this.storage_.length = 0;
        this.dispatchInvalidationEvent(anychart.utils.ConsistencyState.DATA);
      } else {
        this.storage_ = [];
      }
    }
    anychart.globalLock.unlock();
    return this;
  }
  return this.storage_;
};


/**
 * Задает маппинг данных.<br/>
 * Можно единовременно указывать маппинг для разных типов входных данных (см листинги).
 * Дефолтный маппинг можно посмотреть в листингах описания конструктора {@link anychart.data.Set}.
 * @example <c>Кастомизированный Маппинг данных.</c><t>listingOnly</t>
 * // Простой маппинг
 *  dataSet.mapAs({
 *    'value': 0,
 *    'x': 1,
 *    'fill': 2
 *  });
 *   // исходные данные          интерпретирует как
 *   [
 *    [11, 1, 'red 0.5'],       {x: 1, value: 11, fill: 'red 0.5'}
 *    [21, 2, 'green 0.5'],     {x: 2, value: 21, fill: 'green 0.5'}
 *    [14, 3, 'blue 0.5'],      {x: 3, value: 14, fill: 'blue 0.5'}
 *    [11, 4, 'yellow 0.5']     {x: 4, value: 11, fill: 'yellow 0.5'}
 *   ]
 * // Комбинированный маппинг
 *  dataSet.mapAs({
 *    'value': 0,
 *    'x': 1,
 *    'fill': 2
 *   },{
 *    'value': ['close', 'customY'],
 *    'fill': ['fill', 'color']
 *   }, null, ['close']
 *  );
 *  // исходные данные          интерпретирует как
 *   [
 *    [11, 1, 'red 0.5'],       {x: 1, value: 11, fill: 'red 0.5'}
 *    [21, 2, 'green 0.5'],     {x: 2, value: 21, fill: 'green 0.5'}
 *    {
 *      value: 14,
 *      x: 3,                   {x: 3, value: 14, fill: 'blue 0.5'}
 *      fill: 'blue 0.5'
 *    },{
 *      customY: '71',
 *      x: 3,                   {x: 3, value: 71, fill: 'blue 0.5', size 14}
 *      color: 'blue 0.5',
 *      size: 14
 *    },
 *    11,                       {close: 4, value: 11}
 *    function(){ return 99;}   {close: 5, value: 99}
 *   ]
 * @param {!(Object.<number>)=} opt_arrayMapping [{
 *   'x': 0,
 *   'value': 1,
 *   'size': 2,
 *   'open': 1,
 *   'high': 2,
 *   'low': 3,
 *   'close': 4
 * }] Настройки адресации колонок для рядов, представляющих собой массив.
 * @param {!(Object.<Array.<string>>)=} opt_objectMapping [{'value': &#91;'value', 'y', 'close'&#93;}] Настройки
 *  адресации колонок для рядов, являющихся объектами.
 * @param {!(Array.<string>)=} opt_defaultProps [&#91;'value', 'close'&#93;] Имена полей, которым ставить в соответствие
 *  значение ряда, если он является строкой, числом или функцией. Не работает в случаях, если ряд - объект,
 *  даже если нужное поле не было найдено внутри этого объекта.
 * @param {!(Array.<string>)=} opt_indexProps [&#91;'x'&#93;] Имена полей, которым ставить в соответствие текущий индекс
 *  ряда, если другие опции не сработали.
 * @return {!anychart.data.Mapping} The mapping for the data set.
 */
anychart.data.Set.prototype.mapAs = function(opt_arrayMapping, opt_objectMapping, opt_defaultProps, opt_indexProps) {
  var res = new anychart.data.Mapping(this, opt_arrayMapping, opt_objectMapping, opt_defaultProps, opt_indexProps);
  this.registerDisposable(res);
  return res;
};


/**
 * Gets the full row of the set by its index.<br/>
 * <b>Note:</b> If there is no any row for the index - returns <b>undefined</b>.
 * @example <t>listingOnly</t>
 * // Данные
 *  [
 *    [1, 2, 4, 7],
 *    {'high': 14, 'low': 3},
 *    7
 *  ]
 *  dataSet.row(0); // вернет [1, 2, 4, 7]
 *  dataSet.row(1); // вернет {'high': 14, 'low': 3}
 *  dataSet.row(2); // вернет 7
 *  dataSet.row(3); // вернет undefined
 * @param {number} rowIndex Index of the row to fetch.
 * @return {*} The full row current.
 *//**
 * Sets the full row of the set by its index.<br/>
 * <b>Note:</b> Замещает текущее значение. Предыдущее значение возвращается и нигде не сохраняется!
 * @example <t>listingOnly</t>
 * // Данные
 *  [
 *    [1, 2, 4, 7],
 *    {'high': 14, 'low': 3},
 *    7
 *  ]
 *  dataSet.row(2, [2, 2, 2, 2]); // вернет 7
 *  dataSet.row(3, {'low': 4, 'high': 11}); // вернет undefined
 * // Данные после изменений
 *  [
 *    [1, 2, 4, 7],
 *    {'high': 14, 'low': 3},
 *    [2, 2, 2, 2],
 *    {'low': 4, 'high': 11}
 *  ]
 * @param {number} rowIndex Index of the row to fetch.
 * @param {*=} opt_value Value to set.
 * @return {*} Previous value of row.
 *//**
 * @ignoreDoc
 * @param {number} rowIndex Index of the row to fetch.
 * @param {*=} opt_value If passed, the method is treated as a setter.
 * @return {*} The full row current or previous value. May be anything including undefined.
 */
anychart.data.Set.prototype.row = function(rowIndex, opt_value) {
  /** @type {*} */
  var value = this.storage_[rowIndex];
  if (arguments.length > 1) {
    anychart.globalLock.lock();
    this.storage_[rowIndex] = opt_value;
    this.dispatchInvalidationEvent(anychart.utils.ConsistencyState.DATA);
    anychart.globalLock.unlock();
  }
  return value;
};


/**
 * Returns number of rows of current data set.
 * @return {number} Number of rows in the set.
 */
anychart.data.Set.prototype.getRowsCount = function() {
  return this.storage_.length;
};


/**
 * Returns the mapping for the row. This method is not implemented for the Set. Use mapAs() result instead.
 * @param {number} rowIndex Index of the row.
 */
anychart.data.Set.prototype.getRowMapping = function(rowIndex) {
  //TODO(Anton Saukh): replace this throw by proper error handling.
  throw new Error('Asking rowMapping from a Set! What a fag...');
};

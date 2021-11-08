goog.provide('anychart.data.ITreeDataInfo');



/**
 * Tree data item data getter interface.
 * @interface
 */
anychart.data.ITreeDataInfo = function() {};


/**
 * Gets value from data by path specified.
 * @param {...*} var_args - Arguments.
 *
 * Note:
 * For example we have such a structure of object in item:
 *  <code>
 *    'a': {          //Object 'a' - root object in data of tree data item
 *      'b': {        //Object 'b' - Object item.get('a')['b']
 *        'c': [      //Array 'c' as field of object 'c'
 *          {         //0-element of array 'c'. Actually is an Object.
 *            'd': [  //field 'd' of parent Object. Actually is array ['v1', 'v2', 'v3']
 *              'v1',
 *              'v2',
 *              'v3'
 *            ]
 *          }
 *        ]
 *      }
 *    }
 *  </code>
 *
 *  1) Can take arguments like this:
 *    <code>
 *      item.get(['a', 'b', 'c', 0, 'd', 1]);
 *    </code>
 *
 *    It means that element with index 1 in destination array 'd' will be returned as value.
 *
 *  2) The same behaviour is for this case:
 *    <code>
 *      item.get('a', 'b', 'c', 0, 'd', 1);
 *    </code>
 *
 *  4) Note: If path contains some errors, nothing will happen.
 *  Sample of wrong data for the same sample object 'a':
 *    <code>
 *      item.get('a', 'b', 'e', 0, 'd', 1);    //Incorrect name 'e' in path.
 *      item.get('a', 'b', 'c', 2, 'd', 1);    //Incorrect index 2 in path.
 *      item.get(['a', true, 'c', 0, 'd', 1]); //Incorrect (boolean) value in path
 *      //... etc.
 *    </code>
 * @return {*} - Value or undefined if path is invalid.
 */
anychart.data.ITreeDataInfo.prototype.get = function(var_args) {};


/**
 * Gets value from meta by name specified.
 * @param {string} name - Meta name.
 * @return {*} - Value.
 */
anychart.data.ITreeDataInfo.prototype.meta = function(name) {};

/**
 * Defines whether raw data has the field.
 * @param {string} fieldName - Field name.
 * @return {boolean} - fieldName presence.
 */
 anychart.data.ITreeDataInfo.prototype.hasField = function(fieldName) {};

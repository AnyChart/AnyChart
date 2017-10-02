goog.provide('anychart.treeDataModule.utils');
goog.require('anychart.utils');


/**
 * @typedef {{
 *   missedIds: number,
 *   idStatus: number,
 *   nodesCount: number
 * }}
 * @private
 */
anychart.treeDataModule.utils.ToCsvContext_;



/**
 * Creates data suitable to create csv.
 * @param {anychart.treeDataModule.utils.ToCsvContext_} context
 * @param {Object} node Node.
 * @param {Array} rawData Raw data.
 * @param {Object} headers Hash map of seen columns.
 * @param {number} headersLength length of headers.
 * @param {?(string|number)} parentId Parent ID.
 * @param {?(string|number)} originalParent original parent id.
 * @private
 */
anychart.treeDataModule.utils.makeObject_ = function(context, node, rawData, headers, headersLength, parentId, originalParent) {
  var data = goog.object.clone(node['treeDataItemData']);
  if (!goog.isDef(data['id'])) {
    context.missedIds++;
    context.idStatus = -1;
  }
  data['parent'] = [context.nodesCount, parentId, originalParent];
  parentId = context.nodesCount++;
  rawData.push(data);
  for (var key in data) {
    if (!(key in headers))
      headers[key] = headersLength++;
  }
  var children = node['children'];
  if (children && children.length) {
    for (var i = 0, len = children.length; i < len; i++)
      anychart.treeDataModule.utils.makeObject_(context, children[i], rawData, headers, headersLength, parentId, data['id']);
  }
};


/**
 * Returns CSV string with tree data.
 * @param {anychart.treeDataModule.Tree|anychart.treeDataModule.View} data
 * @param {Object.<string, (string|boolean|undefined)>=} opt_csvSettings CSV settings.
 * @return {string} CSV string.
 */
anychart.treeDataModule.utils.toCsv = function(data, opt_csvSettings) {
  if (!data) return '';
  var serialized = data.serialize();
  var roots = serialized['children'];

  var rawData = [];
  var headers = {};
  var i,
      j;
  var context = {
    /**
     * -1 means there is at least one missing id, so use auto generated id|parent and save original id|parent
     *  0 means there is no id at all use auto generated id|parent without original
     *  1 means there are all ids in tree, so do not use auto generated - use original id|parent
     * @type {number}
     * @private
     */
    idStatus: 1,
    missedIds: 0,
    nodesCount: 0
  };
  headers['id'] = 0;
  headers['parent'] = 1;
  for (i = 0; i < roots.length; i++) {
    anychart.treeDataModule.utils.makeObject_(context, roots[i], rawData, headers, 2, null, null);
  }
  if (context.missedIds === context.nodesCount) {
    context.idStatus = 0;
  } else if (context.missedIds === 0) {
    context.idStatus = 1;
  }

  var key;
  var columns = [];

  for (key in headers)
    columns[headers[key]] = key;

  var result = [];
  var rowArray;
  var row;
  var column;
  var parent;
  var finalValue;
  var id,
      parentId;
  if (context.idStatus < 0) {
    headers['__original_id__'] = columns.length;
    headers['__original_parent__'] = columns.length + 1;
    columns.push('__original_id__', '__original_parent__');
  }

  for (i = 0; i < rawData.length; i++) {
    rowArray = new Array(columns.length);
    row = rawData[i];
    // parent - array with
    // 0 - auto generated id
    // 1 - auto generated parent id
    // 2 - original parent id
    parent = row['parent'];

    if (context.idStatus <= 0) {
      id = parent[0];
      parentId = parent[1];
    } else {
      id = row['id'];
      parentId = parent[2];
    }

    for (j = 0; j < columns.length; j++) {
      column = columns[j];
      finalValue = goog.isObject(row[column]) ? goog.json.serialize(row[column]) : row[column];

      if (column === 'id')
        rowArray[j] = id;

      else if (column === 'parent')
        rowArray[j] = goog.isNull(parentId) ? undefined : parentId;

      else if (column === '__original_parent__')
        rowArray[j] = parent[2];

      else if (column === '__original_id__')
        rowArray[j] = row['id'];

      else
        rowArray[j] = finalValue;
    }
    result.push(rowArray);
  }
  return anychart.utils.serializeCsv(columns, result, opt_csvSettings);
};

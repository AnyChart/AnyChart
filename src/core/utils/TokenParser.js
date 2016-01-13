goog.provide('anychart.core.utils.TokenParser');
goog.require('anychart.format');
goog.require('anychart.utils');
goog.require('goog.array');



/**
 * TokenParser.
 * @constructor
 */
anychart.core.utils.TokenParser = function() {
  this.cache_ = {};
};
goog.addSingletonGetter(anychart.core.utils.TokenParser);


/**
 * Parses format string and creates partial term functions.
 * @param {string} format Format string.
 * @return {Array.<Function>} Array of partial tokens.
 */
anychart.core.utils.TokenParser.parse = function(format) {
  var terms = [];
  var boolMap = {
    'true': true,
    'false': false
  };
  var paramToType = {
    'numDecimals': 'number',
    'decimalsCount': 'number',
    'useNegativeSign': 'boolean',
    'useBracketsForNegative': 'boolean',
    'leadingZeros': 'number',
    'trailingZeros': 'boolean',
    'zeroFillDecimals': 'boolean',
    'scale': 'scale'
  };
  var param6to7 = {
    'numDecimals': 'decimalsCount',
    'decimalSeparator': 'decimalPoint',
    'thousandsSeparator': 'groupsSeparator',
    'useNegativeSign': 'useBracketsForNegative',
    'trailingZeros': 'zeroFillDecimals'
  };

  function trimKeys(params) {
    var del = [];
    for (var key in params) {
      if (params.hasOwnProperty(key)) {
        var newKey = anychart.utils.trim(key);
        if (newKey != key) {
          params[newKey] = params[key];
          del.push(key);
        }
      }
    }
    for (var i = del.length; i--;)
      delete params[del[i]];
  }

  function modifyParams(params) {
    var del = [];
    for (var key in params) {
      if (params.hasOwnProperty(key)) {
        var value = params[key];
        if (key in paramToType) {
          var type = paramToType[key];
          if (type == 'number')
            value = anychart.utils.toNumber(value);
          if (type == 'boolean') {
            var boolValue = boolMap[anychart.utils.trim(value).toLowerCase()];
            value = (key == 'useNegativeSign') ? !boolValue : boolValue;
          }
          if (type == 'scale') {
            var arr = anychart.utils.trim(value);
            if (arr in boolMap)
              value = boolMap[arr];
            else {
              var newScale = {};
              arr = arr.split('|');
              var filter = function(item, index) {
                return index % 2 != 0;
              };
              var arrFact = goog.array.filter(arr[0].split(/(\w+)/), filter);
              var arrSuff = goog.array.filter(arr[1].split(/(\w+)/), filter);
              arrFact = goog.array.map(arrFact, function(item) {
                return +item;
              });
              newScale['factors'] = arrFact;
              newScale['suffixes'] = arrSuff;
              value = newScale;
            }
          }
        }
        var newKey = key;
        if (key in param6to7 && param6to7[key]) {
          newKey = param6to7[key];
          if (newKey != key)
            del.push(key);
        }
        params[newKey] = value;
      }
    }
    for (var i = del.length; i--;)
      delete params[del[i]];
  }

  function tokenTerm(token, params, provider) {
    var value = provider['getTokenValue'](token);
    if (!goog.isDef(value))
      return '';
    var type = provider['getTokenType'](token);
    switch (type) {
      case anychart.enums.TokenType.UNKNOWN:
        return '';
      case anychart.enums.TokenType.STRING:
        return String(value);
      case anychart.enums.TokenType.DATE_TIME:
        return anychart.format.dateTime(value, params['dateTimeFormat'], params['timeZone']);
      case anychart.enums.TokenType.NUMBER:
        return anychart.format.number(value, params);
    }
  }

  function stringTerm(token) {
    return token;
  }

  function addTokenTerm(tokenName, tokenParams) {
    trimKeys(params);
    modifyParams(params);
    terms.push(goog.partial(tokenTerm, tokenName, tokenParams));
  }

  function addStringTerm(str) {
    terms.push(goog.partial(stringTerm, str));
  }

  var len = format.length;
  var state = 0; // state of machine
  var c; // character
  var buffer = ''; // buffer
  var tokenName; // name of the token

  var paramsStringBuffer;
  var paramName;
  var paramValue;
  var params;
  var isEscaped = false;

  for (var i = 0; i < len; i++) {
    c = format.charAt(i);
    switch (state) {

      // parsing string constant
      case 0:
        if (c == '{')
          state = 1; // found '{', is it a token?
        else
          buffer += c;
        break;

      // found '{', is it a token?
      case 1:
        if (c == '%') {
          if (buffer.length > 0) {
            addStringTerm(buffer);
          }
          buffer = '%';
          state = 2; // parsing token name
        } else {
          buffer += '{' + c;
          state = 0;
        }
        break;

      // parsing token name
      case 2:
        if (c == '}') {
          if (buffer.length > 1) {
            tokenName = buffer;
            buffer = '';
            state = 3; // decide what to parse now
          } else {
            // token with empty name is treated as a const string
            buffer = '{%}';
            state = 0;
          }
        } else
          buffer += c;
        break;

      // decide what to parse now:
      // next token, token params or string
      case 3:
        if (c == '{') {
          state = 4; // is it token or token params?
        } else {
          addTokenTerm(tokenName, null);
          buffer = c;
          state = 0; // a string const
        }
        break;

      // decide what to parse now:
      // next token or token params
      case 4:
        if (c == '%') {
          // it is a next token!
          addTokenTerm(tokenName, null);
          buffer = '%';
          state = 2; // parsing next token name
        } else {
          paramsStringBuffer = '{' + c;
          buffer = c;
          paramName = '';
          paramValue = '';
          params = {};
          isEscaped = c == '\\';
          state = 5; // parsing token params (name)
        }
        break;

      // parsing token param name
      // (only not escaped ':' char can interrupt param name)
      case 5:
        paramsStringBuffer += c;
        if (isEscaped) {
          buffer += c;
          isEscaped = false;
        } else if (c == '\\') {
          isEscaped = true;
        } else if (c == ':') {
          // name can be empty to support flash anychart parser
          paramName = buffer;
          buffer = '';
          state = 6; // parsing param value
        } else if (c == '}') {
          paramName = anychart.utils.trim(buffer);
          params[paramName] = '';
          addTokenTerm(tokenName, params);
          paramName = '';
          paramValue = '';
          buffer = '';
          paramsStringBuffer = '';
          state = 0; // params finished, going back to start state
        } else
          buffer += c;
        break;

      // parsing param value (only not escaped ',' char can interrupt
      // param value, no spaces are ignored)
      case 6:
        paramsStringBuffer += c;
        if (isEscaped) {
          buffer += c;
          isEscaped = false;
        } else if (c == '\\') {
          isEscaped = true;
        } else if (c == ',') {
          paramValue = buffer;
          params[paramName] = paramValue;
          buffer = '';
          paramName = '';
          paramValue = '';
          state = 5; // parsing param value
        } else if (c == '}') {
          paramValue = buffer;
          params[paramName] = paramValue;
          addTokenTerm(tokenName, params);
          paramName = '';
          paramValue = '';
          buffer = '';
          paramsStringBuffer = '';
          state = 0; // params finished, going back to start state
        } else
          buffer += c;
        break;
    }
  }

  switch (state) {
    // was parsing a string const
    case 0:
      if (buffer.length > 0)
        addStringTerm(buffer);
      break;

    // found '{' and then EOI, so add '{' as string term
    case 1:
      addStringTerm('{');
      break;

    // was parsing token name and then got an EOI
    // buffer contains token name without '{' so add as string term
    case 2:
      addStringTerm('{' + buffer);
      break;

    // Just finished successful token without params parsing.
    // Do nothing.
    case 3:
      addTokenTerm(tokenName, null);
      break;

    // Parsed tokenName, then '{' and then EOI - add '{' string const with token
    case 4:
      addTokenTerm(tokenName, null);
      addStringTerm('{');
      break;

    // was parsing token params and got EOI before '}' -
    // treat params as a string const
    case 5:
    case 6:
      addStringTerm(paramsStringBuffer);
      break;
  }
  return terms;
};


/**
 * Gets text formatter.
 * @param {string} str Format string.
 * @return {Function} Text formatter function.
 */
anychart.core.utils.TokenParser.prototype.getTextFormatter = function(str) {
  if (!this.cache_[str]) {
    var terms = anychart.core.utils.TokenParser.parse(str);
    this.cache_[str] = function(provider) {
      var resultsMap = goog.array.map(terms, function(term) {
        return term(provider);
      });
      return resultsMap.join('');
    };
  }
  return this.cache_[str];
};


/**
 * Clears saved text formatter functions.
 * @return {anychart.core.utils.TokenParser} Self for chaining.
 */
anychart.core.utils.TokenParser.prototype.dropCache = function() {
  this.cache_ = {};
  return this;
};


/**
 * Removes formatter entry from cache by format string.
 * @param {string} str Format.
 * @return {anychart.core.utils.TokenParser} Self for chaining.
 */
anychart.core.utils.TokenParser.prototype.removeCacheEntry = function(str) {
  delete this.cache_[str];
  return this;
};


//exports

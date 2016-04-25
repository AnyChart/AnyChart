goog.provide('anychart.core.utils.ITokenProvider');



/**
 * Token provider interface
 * @interface
 */
anychart.core.utils.ITokenProvider = function() {
};


/**
 * Return token type by token name.
 * @param {string} name Token name.
 * @return {anychart.enums.TokenType} Type of the token.
 */
anychart.core.utils.ITokenProvider.prototype.getTokenType = function(name) {};


/**
 * Return token value by token name.
 * @param {string} name Name of the token.
 * @return {*} Value of the token.
 */
anychart.core.utils.ITokenProvider.prototype.getTokenValue = function(name) {};

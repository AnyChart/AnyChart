goog.provide('anychart.core.utils.InternalLabelsFormatters');

/**
 * Trims passed text by length.
 * By default append ellipsis to the end of trimmed text if it has more characters than needed.
 *
 * @param {string} text - Text for formatting.
 * @param {?number} length - Maximum length of string.
 * @param {string=} [opt_paddingRightChars = '...'] - Characters need to append to the end of text.
 *
 * @return {string} - Formatted text.
 */
anychart.core.utils.InternalLabelsFormatters.textLengthFormatter = function (text, length, opt_paddingRightChars) {
    opt_paddingRightChars = opt_paddingRightChars || '...';

    // null value means show label as is.
    if (goog.isDefAndNotNull(length) && text.length > length) {
        return text.slice(0, length) + opt_paddingRightChars;
    }

    return text;
};

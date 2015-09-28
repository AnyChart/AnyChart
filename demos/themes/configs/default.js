window.anychart = window.anychart || {};
window.anychart.themes = window.anychart.themes || {};

var colorStrokeExtraThin = '#F7F7F7';
var colorStrokeThin = '#EAEAEA';
var colorStrokeNormal = '#CECECE';
var colorStrokeBright = '#c1c1c1';

var colorFillBackground = '#ffffff';
var colorFillExtraThin = '#f5f5f5';
//var colorFillThin = '';
//var colorFillNormal = '';

var fontColorThin = '#969EA5';
var fontColorNormal = '#7c868e';
var fontColorBright = '#545f69';
var fontColorExtraBright = '#212121';

var fontColorReversedNormal = '#DCDCDC';
var fontColorReversedBright = '#ffffff';

var opacityThin = " 0.3";
var opacityNornal = " 0.6";
var opacityStrong = " 0.75";

window.anychart.themes.default = {
    palette: {
        type: "distinct",
        items: "#64b5f6 #1976d2 #ef6c00 #ffd54f #455a64 #96a6a6 #dd2c00 #00838f #00bfa5 #ffa000".split(" ")
    },

    hatchFillPalette: {items: "backwardDiagonal forwardDiagonal horizontal vertical dashedBackwardDiagonal grid dashedForwardDiagonal dashedHorizontal dashedVertical diagonalCross diagonalBrick divot horizontalBrick verticalBrick checkerBoard confetti plaid solidDiamond zigZag weave percent05 percent10 percent20 percent25 percent30 percent40 percent50 percent60 percent70 percent75 percent80 percent90".split(" ")},

    markerPalette: {items: "circle diamond square triangleDown triangleUp diagonalCross pentagon cross line star5 star4 trapezium star7 star6 star10".split(" ")},

    defaultFontSettings: {
        fontSize: 12,
        fontFamily: "'Verdana', Helvetica, Arial, sans-serif",
        fontColor: fontColorNormal,
        textDirection: "ltr",
        fontOpacity: 1,
        fontDecoration: "none",
        fontStyle: "normal",
        fontVariant: "normal",
        fontWeight: "normal",
        letterSpacing: "normal",
        lineHeight: "normal",
        textIndent: 0,
        vAlign: "top",
        hAlign: "start",
        textWrap: "byLetter",
        textOverflow: "",
        selectable: !1,
        disablePointerEvents: !1,
        useHtml: !1
    },

    defaultTitle: {
        enabled: !0,
        fontSize: 16,
        text: "Title text",
        background: {enabled: !1},
        width: null,
        height: null,
        margin: {top: 0, right: 0, bottom: 0, left: 0},
        padding: {top: 10, right: 10, bottom: 5, left: 10},
        align: "center",
        hAlign: "center"
    },

    defaultBackground: {
        enabled: !0,
        fill: colorFillBackground,
        stroke: "none",
        cornerType: "round",
        corners: 0
    },

    defaultTooltip: {
        enabled: !0,
        allowLeaveScreen: !1,
        isFloating: !0,
        title: {
            enabled: !1,
            fontColor: fontColorReversedBright,
            fontSize: "15px",
            vAlign: "top",
            hAlign: "center",
            text: "Tooltip Title",
            background: {enabled: !1},
            rotation: 0,
            width: null,
            height: null,
            margin: 0,
            padding: {top: 5, right: 10, bottom: 5, left: 10},
            align: "left",
            orientation: "top",
            zIndex: 1
        },
        separator: {
            enabled: !1,
            fill: colorStrokeNormal + opacityThin,
            width: "100%",
            height: 1,
            margin: {top: 0, right: 5, bottom: 0, left: 5},
            orientation: "top",
            stroke: "none",
            zIndex: 1
        },
        content: {
            enabled: !0,
            fontColor: fontColorReversedNormal,
            text: "Tooltip Content",
            background: {enabled: !1},
            padding: {top: 5, right: 10, bottom: 5, left: 10},
            width: null,
            height: null,
            anchor: "leftTop",
            position: "leftTop",
            offsetX: 0,
            offsetY: 0,
            minFontSize: 8,
            maxFontSize: 72,
            adjustFontSize: {width: !1, height: !1},
            rotation: 0,
            zIndex: 1
        },
        background: {
            enabled: !0,
            fill: fontColorExtraBright + opacityStrong,
            stroke: null,
            cornerType: "round",
            corners: 3,
            zIndex: 0},
        padding: {top: 0, right: 0, bottom: 0, left: 0},
        offsetX: 10,
        offsetY: 10,
        anchor: "leftTop",
        hideDelay: 0,
        titleFormatter: function () {
            return this.value
        },
        contentFormatter: function () {
            return this.value
        }
    },

    defaultAxis: {
        enabled: !0,
        startAngle: 0,
        drawLastLabel: !0,
        drawFirstLabel: !0,
        staggerMaxLines: 2,
        staggerMode: !1,
        staggerLines: null,
        width: null,
        overlapMode: "noOverlap",
        stroke: colorStrokeNormal,
        margin: {top: 0, right: 0, bottom: 0, left: 0},
        padding: {top: 0, right: 0, bottom: 0, left: 0},
        title: {
            enabled: !1,
            fontSize: 13,
            text: "Axis title",
            margin: {top: 0, right: 0, bottom: 0, left: 0},
            padding: {top: 5, right: 5, bottom: 5, left: 5},
            background: {enabled: !1},
            fontColor: fontColorBright
        },
        labels: {
            enabled: !0,
            offsetX: 0,
            offsetY: 0,
            minFontSize: 8,
            maxFontSize: 72,
            rotation: 0,
            anchor: "center",
            padding: {top: 3, right: 3, bottom: 3, left: 3},
            background: {enabled: !1},
            textFormatter: function () {
                return this.value
            },
            positionFormatter: function () {
                return this.value
            },
            zIndex: 35
        },
        minorLabels: {
            enabled: !1,
            offsetX: 0,
            offsetY: 0,
            minFontSize: 8,
            maxFontSize: 72,
            rotation: 0,
            anchor: "center",
            padding: {top: 3, right: 3, bottom: 3, left: 3},
            fontSize: 10,
            background: {enabled: !1},
            textFormatter: function () {
                return this.value
            },
            positionFormatter: function () {
                return this.value
            },
            zIndex: 35
        },
        ticks: {enabled: !1, length: 6, position: "outside", stroke: colorStrokeNormal, zIndex: 35},
        minorTicks: {enabled: !1, length: 4, position: "outside", stroke: colorStrokeThin, zIndex: 35},
        zIndex: 35
    },

    defaultLabelFactory: {
        minFontSize: 8,
        maxFontSize: 72,
        enabled: !1,
        offsetX: 0,
        offsetY: 0,
        anchor: "leftBottom",
        padding: {top: 3, right: 3, bottom: 3, left: 3},
        rotation: 0,
        background: {enabled: !1},
        textFormatter: function () {
            return this.value
        },
        positionFormatter: function () {
            return this.value
        }
    },

    defaultMarkerFactory: {
        size: 4,
        hoverSize: 6,
        anchor: "center", offsetX: 0, offsetY: 0, rotation: 0, positionFormatter: function () {
            return this.value
        }
    },

    chart: {
        title: {enabled: !1, align: "center", zIndex: 80},
        margin: {top: 0, right: 0, bottom: 0, left: 0},
        padding: {top: 10, right: 30, bottom: 10, left: 10},
        credits: {
            enabled: !0, text: "AnyChart", url: "http://anychart.com",
            alt: "AnyChart.com", inChart: !1
        },

        defaultSeriesSettings: {
            hatchFill: !1,
            base: {
                tooltip: {
                    enabled: !0,
                    title: {enabled: !0},
                    separator: {enabled: !0},
                    titleFormatter: function () {
                        return this.x
                    },
                    contentFormatter: function () {
                        // todo: add if seriesName == 'Series 0'
                        return this.seriesName + ": " + this.value
                    }
                }
            },
            marker: {
                fill: this.sourceColor,
                hoverFill: this.sourceColor,
                stroke: function () {
                    return window.anychart.color.darken(this.sourceColor) + opacityStrong
                }, hoverStroke: function () {
                    return window.anychart.color.darken(this.sourceColor)
                },
                hatchFill: !1
            }
        },

        legend: {
            enabled: !1,
            itemsLayout: "horizontal",
            itemsSpacing: 15,
            items: null,
            itemsFormatter: null,
            itemsTextFormatter: null,
            itemsSourceMode: "default",
            inverted: !1,
            hoverCursor: "pointer",
            iconTextSpacing: 5,
            width: null,
            height: null,
            position: "top",
            align: "center",
            vAlign: "middle",
            margin: {top: 0, right: 0, bottom: 0, left: 0},
            padding: {top: 0, right: 5, bottom: 15, left: 5},
            background: {enabled: !1},
            title: {
                enabled: !1,
                fontSize: 15,
                text: "Legend title",
                orientation: "top",
                hAlign: "left"
            },
            titleSeparator: {
                enabled: !1,
                width: "100%",
                height: 1,
                margin: {top: 5, right: 0, bottom: 5, left: 0},
                orientation: "top",
                fill: colorStrokeThin,
                stroke: null
            },
            paginator: {
                enabled: !0,
                fontColor: fontColorBright,
                padding: {top: 0, right: 0, bottom: 0, left: 0},
                margin: {top: 0, right: 0, bottom: 0, left: 0},
                orientation: "right",
                layout: "horizontal",
                zIndex: 30
            },
            tooltip: {
                enabled: !1,
                title: {
                    enabled: !1,
                    margin: {top: 3, right: 3, bottom: 0, left: 3},
                    padding: {top: 0, right: 0, bottom: 0, left: 0}
                }
            },
            zIndex: 20
        },

        defaultLabelSettings: {
            enabled: !1,
            text: "Chart label",
            background: {enabled: !1},
            padding: {top: 0, right: 0, bottom: 0, left: 0},
            width: null,
            height: null,
            anchor: "leftTop",
            position: "leftTop",
            offsetX: 0,
            offsetY: 0,
            minFontSize: 8,
            maxFontSize: 72,
            adjustFontSize: {width: !1, height: !1},
            rotation: 0,
            zIndex: 50
        },
        chartLabels: [],
        animation: {enabled: !1, duration: 1E3},
        bounds: {
            top: null,
            right: null,
            bottom: null,
            left: null,
            width: null,
            height: null,
            minWidth: null,
            minHeight: null,
            maxWidth: null,
            maxHeight: null
        }
    }
};
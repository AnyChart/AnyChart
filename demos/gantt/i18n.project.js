var chart;

anychart.onDocumentReady(function() {
  anychart.format.locales.ja = {
    'dateTimeLocale': {
      'eras': ['紀元前', '西暦'],
      'erasNames': ['紀元前', '西暦'],
      'narrowMonths': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
      'standaloneNarrowMonths': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
        '11', '12'],
      'months': ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月',
        '9月', '10月', '11月', '12月'],
      'standaloneMonths': ['1月', '2月', '3月', '4月', '5月', '6月', '7月',
        '8月', '9月', '10月', '11月', '12月'],
      'shortMonths': ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月',
        '9月', '10月', '11月', '12月'],
      'standaloneShortMonths': ['1月', '2月', '3月', '4月', '5月', '6月',
        '7月', '8月', '9月', '10月', '11月', '12月'],
      'weekdays': ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日',
        '金曜日', '土曜日'],
      'standaloneWeekdays': ['日曜日', '月曜日', '火曜日', '水曜日',
        '木曜日', '金曜日', '土曜日'],
      'shortWeekdays': ['日', '月', '火', '水', '木', '金', '土'],
      'standaloneShortWeekdays': ['日', '月', '火', '水', '木', '金', '土'],
      'narrowWeekdays': ['日', '月', '火', '水', '木', '金', '土'],
      'standaloneNarrowWeekdays': ['日', '月', '火', '水', '木', '金', '土'],
      'shortQuarters': ['Q1', 'Q2', 'Q3', 'Q4'],
      'quarters': ['第1四半期', '第2四半期', '第3四半期',
        '第4四半期'],
      'ampms': ['午前', '午後'],
      'dateFormats': ['y年M月d日EEEE', 'y年M月d日', 'y/MM/dd', 'y/MM/dd'],
      'timeFormats': ['H時mm分ss秒 zzzz', 'H:mm:ss z', 'H:mm:ss', 'H:mm'],
      'dateTimeFormats': ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
      'firstDayOfWeek': 6,
      'weekendRange': [5, 6],
      'firstWeekCutOfDay': 5
    },
    'numberLocale': {
      'decimalsCount': 2,
      'decimalPoint': '.',
      'groupsSeparator': '',
      'scale': false,
      'zeroFillDecimals': false,
      'scaleSuffixSeparator': ''
    }
  };

  anychart.format.inputLocale = 'ja';
  anychart.format.inputDateTimeFormat = 'yyyy.MM.dd'; //Like '2015.03.12'
  anychart.format.outputLocale = 'ja';
  anychart.format.outputDateTimeFormat = 'dd MMM yyyy'; //Like '12 Mar 2015'


  var treeData = anychart.data.tree(getData(), anychart.enums.TreeFillingMethod.AS_TABLE);
  chart = anychart.ganttProject();
  chart.container('container');
  chart.data(treeData);

  var dataGrid = chart.dataGrid();
  dataGrid.column(0).title().text('#');
  dataGrid.column(1).width(250).title('タイトル');
  dataGrid.column(2).textFormatter(function() {
    var start = this['actualStart'] || this['autoStart'];
    return anychart.format.dateTime(start);
  }).title('開始');

  dataGrid.column(3).textFormatter(function() {
    var end = this['actualEnd'] || this['autoEnd'];
    return (end === void 0) ? '' : anychart.format.dateTime(end); //can be milestone
  }).title('終わり');

  dataGrid.tooltip().textFormatter(tooltipFormatter);
  chart.getTimeline().tooltip().textFormatter(tooltipFormatter);

  chart.draw();

  //chart.fitAll();

});

function tooltipFormatter() {
  var startDate = this['actualStart'] || this['autoStart'];
  var endDate = this['actualEnd'] || this['autoEnd'];
  var progress = this['progressValue'];

  if (progress === void 0) {
    var auto = this['autoProgress'] * 100;
    progress = (Math.round(auto * 100) / 100 || 0) + '%';
  }

  return (startDate ? '開始日: ' + anychart.format.dateTime(startDate) : '') +
      (endDate ? '\n終了日: ' + anychart.format.dateTime(endDate) : '') +
      (progress ? '\n進捗: ' + progress : '');
}


function getData() {
  return [
    {'id': '1', name: 'フェーズ1 - 戦略計画'},
    {'id': '2', 'name': '自己評価', 'parent': '1'},
    {
      'id': '3',
      'name': '事業ビジョンを定義します',
      'parent': '2',
      'actualStart': Date.UTC(2015, 2, 13),//'2015.03.13',
      'actualEnd': '2015.03.24'
    },
    {
      'id': '4',
      'name': '使用可能なスキル、情報とサポートを特定',
      'parent': '2',
      'actualStart': '2015.03.25',
      'actualEnd': '2015.04.06'
    },
    {
      'id': '5',
      'name': '続行するかどうかを決定します',
      'parent': '2',
      'actualStart': '2015.04.07',
      'actualEnd': '2015.04.15',
      'baselineStart': '2015.04.06',
      'baselineEnd': '2015.04.18'
    }

  ];
}

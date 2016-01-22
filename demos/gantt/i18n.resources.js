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
  chart = anychart.ganttResource();
  chart.container('container');
  chart.data(treeData);

  var dataGrid = chart.dataGrid();
  dataGrid.column(0).title().text('#');
  dataGrid.column(1).width(250).title('タイトル');

  dataGrid.tooltip().textFormatter(dgTooltipFormatter);
  chart.getTimeline().tooltip().textFormatter(tlTooltipFormatter);

  chart.draw();
  chart.fitAll();

});

function dgTooltipFormatter() {
  var startDate = this['minPeriodDate'];
  var endDate = this['maxPeriodDate'];
  return (startDate ? '開始日: ' + window['anychart']['format']['dateTime'](startDate) : '') +
      (endDate ? '\n終了日: ' + window['anychart']['format']['dateTime'](endDate) : '');
}


function tlTooltipFormatter() {
  var startDate = this['periodStart'] || this['minPeriodDate'];
  var endDate = this['periodEnd'] || this['maxPeriodDate'];
  return (startDate ? '開始日: ' + window['anychart']['format']['dateTime'](startDate) : '') +
      (endDate ? '\n終了日: ' + window['anychart']['format']['dateTime'](endDate) : '');
}


function getData() {
  return [
    {
      'id': '1',
      'name': '開発',
      'periods': [
        {'id': '11', 'start': '2015.04.14', 'end': '2015.04.20'},
        {'id': '12', 'start': '2015.05.01', 'end': '2015.05.10'},
        {'id': '13', 'start': '2015.05.12', 'end': '2015.05.22'}
      ]
    },

    {
      'id': '2',
      'name': '研究',
      'periods': [
        {'id': '21', 'start': '2015.03.15', 'end': '2015.04.15'},
        {'id': '22', 'start': '2015.05.05', 'end': '2015.05.13'},
        {'id': '23', 'start': '2015.05.15', 'end': '2015.05.17'}
      ]
    },

    {
      'id': '3',
      'name': 'テスト',
      'periods': [
        {'id': '31', 'start': '2015.04.17', 'end': '2015.05.02'},
        {'id': '32', 'start': '2015.05.03', 'end': '2015.05.17'},
        {'id': '33', 'start': '2015.05.19', 'end': '2015.06.02'}
      ]
    },

    {
      'id': '4',
      'name': '追加の相',
      'periods': [
        {'id': '41', 'start': '2015.04.03', 'end': '2015.04.16'},
        {'id': '42', 'start': '2015.05.03', 'end': '2015.05.14'},
        {'id': '43', 'start': '2015.05.16', 'end': '2015.05.26'}
      ]
    }

  ];
}

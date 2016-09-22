var calendar, res;

anychart.onDocumentReady(function() {
  calendar = anychart.scales.calendar();
  calendar.availabilities([
    {each: 'year', on: '2016/09/25'},
    {on: '2016/09/25', from: '10:20', to: '14:15', isWorking: false},
    {each: 'year', from: '2016/09/26', to: '2016/09/28'},
    {each: 'w', on: 0, from: 10, to: 12},
    {each: 'w', on: 0, from: 13, to: 16},
    {each: 'w', on: 1, from: 10, to: 16},
    {each: 'w', on: 1, from: 12, to: 13, isWorking: false},
  ]);
  res = calendar.getWorkingSchedule(new Date(2016, 8, 24, 0), new Date(2016, 8, 30, 0));
  console.log(res.map(function(val) {
    if (!val.length)
      return "Holidays";
    return anychart.format.dateTime(val[0][0], 'EEE dd MMM: \n') + val.map(function(val) {
      return anychart.format.dateTime(val[0], 'HH:mm-') + anychart.format.dateTime(val[1], 'HH:mm');
    }).join('\n');
  }), res);
});

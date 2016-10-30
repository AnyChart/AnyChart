var chart;

anychart.onDocumentReady(function() {
  chart = anychart.resource();
  chart.zoomLevel(1);

  // chart.xScale().skipHolidays(true);
  // chart.xScale().unit('week');
  // chart.calendar().availabilities([
  //   {each: 'none', from: ''}
  // ]);
  // chart.calendar().availabilities([
  //     {each: 'day', starts: '2007-06-02', isWorking: false},
  //     {each: 'day', ends: '2007-03-30', isWorking: false}
  // ]);
  chart.data([
    {
      "name": "Romario",
      "description": "Developer",
      "activities": [
        {
          "name": "Gantt timeline",
          "intervals": [
            {
              "start": '2016-10-01',
              "end": '2016-11-23',
              "minutesPerDay": 120
            }
          ]
        },
        {
          "name": "Chart animation problems",
          "intervals": [
            {
              "start": '2016-10-05',
              "end": '2016-10-15',
              "minutesPerDay": 300
            }
          ]
        },
        {
          "name": "iPad touch problems",
          "intervals": [
            {
              "start": '2016-10-18',
              "end": '2016-10-31',
              "minutesPerDay": 300
            },
            {
              "start": '2016-11-07',
              "end": '2016-11-10',
              "minutesPerDay": 60
            },
          ]
        },
        {
          "name": "Some improvements for chart labels",
          "intervals": [
            {
              "start": '2016-11-07',
              "end": '2016-11-10',
              "minutesPerDay": 240
            },
            {
              "start": '2016-11-11',
              "end": '2016-11-21',
              "minutesPerDay": 300
            }
          ]
        }
      ]
    },
    {
      "name": "Antonio",
      "description": "Developer",
      "activities": [
        {
          "name": "Gantt resource list",
          "intervals": [
            {
              "start": '2016-09-25',
              "end": '2016-10-10',
              "minutesPerDay": 120
            }
          ]
        },
        {
          "name": "Chart minor bug fixes",
          "intervals": [
            {
              "start": '2016-10-26',
              "end": '2016-11-20',
              "minutesPerDay": 120
            }
          ]
        },
        {
          "name": "Chart legend",
          "intervals": [
            {
              "start": '2016-10-05',
              "end": '2016-11-01',
              "minutesPerDay": 120
            }
          ]
        }
      ]
    },
    {
      "name": "Alejandro",
      "description": "Developer",
      "activities": [
        {
          "name": "Pie chart improvement",
          "intervals": [
            {
              "start": '2016-09-25',
              "end": '2016-10-02',
              "minutesPerDay": 120
            }
          ]
        },
        {
          "name": "Pie chart labels problems",
          "intervals": [
            {
              "start": '2016-10-05',
              "end": '2016-11-01',
              "minutesPerDay": 120
            }
          ]
        },
        {
          "name": "Stock chart minor bugs",
          "intervals": [
            {
              "start": '2016-10-01',
              "end": '2016-10-10',
              "minutesPerDay": 120
            }
          ]
        },
        {
          "name": "Chart minor bug fixes",
          "intervals": [
            {
              "start": '2016-10-20',
              "end": '2016-11-20',
              "minutesPerDay": 120
            }
          ]
        }
      ]
    },
    {
      "name": "Sergio",
      "description": "Developer",
      "activities": [
        {
          "name": "Gantt logo",
          "intervals": [
            {
              "start": '2016-09-30',
              "end": '2016-10-03',
              "minutesPerDay": 300
            }
          ]
        },
        {
          "name": "Tooltip bug fix",
          "intervals": [
            {
              "start": '2016-10-04',
              "end": '2016-10-10',
              "minutesPerDay": 300
            }
          ]
        },
        {
          "name": "Chart label",
          "intervals": [
            {
              "start": '2016-10-11',
              "end": '2016-10-15',
              "minutesPerDay": 300
            }
          ]
        },
        {
          "name": "Map series labels improvement",
          "intervals": [
            {
              "start": '2016-10-16',
              "end": '2016-11-23',
              "minutesPerDay": 300
            }
          ]
        }
      ]
    }
  ]);

  chart.timeTrackingMode(anychart.enums.TimeTrackingMode.AVAILABILITY_PER_CHART)

  chart.calendar().availabilities([
    {
      'each': anychart.enums.AvailabilityPeriod.DAY,
      'from': 10,
      'to': 18,
      'isWorking': true
    },
    {
      'each': anychart.enums.AvailabilityPeriod.DAY,
      'from': 14,
      'to': 15,
      'isWorking': false
    },
    {
      'each': anychart.enums.AvailabilityPeriod.WEEK,
      'on': 5,
      'isWorking': false
    },
    {
      'each': anychart.enums.AvailabilityPeriod.WEEK,
      'on': 6,
      'isWorking': false
    }

  ]);

  chart.container('container').draw();
});

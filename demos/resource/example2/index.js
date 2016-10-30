var chart;
anychart.onDocumentReady(function() {
  chart = anychart.resource();
  chart.zoomLevel(0);

  var dateSet = anychart.data.set([
    {
      "name": "Stade de France",
      "city": "Saint-Denis",
      "activities": [
        {
          "name": "France vs Romania",
          "group": "Group A",
          "start": '2016-06-10',
          "end": '2016-06-10'
        },
        {
          "name": "Republic of Ireland vs Sweden",
          "group": "Group E",
          "start": '2016-06-13',
          "end": '2016-06-13'
        },
        {
          "name": "Germany vs Poland",
          "group": "Group C",
          "start": '2016-06-16',
          "end": '2016-06-16'
        },
        {
          "name": "Iceland vs Austria",
          "group": "Group F",
          "start": '2016-06-22',
          "end": '2016-06-22'
        },
        {
          "name": "Round of 16",
          "group": "WE vs RD",
          "start": '2016-06-27',
          "end": '2016-06-27'
        },
        {
          "name": "Quarter Final",
          "group": "W40 vs W44",
          "start": '2016-07-03',
          "end": '2016-07-03'
        },
        {
          "name": "Final Euro 2016",
          "group": "W49 vs W50",
          "start": '2016-07-10',
          "end": '2016-07-10'
        }
      ]
    },
    {
      "name": "Stade Velodrome",
      "city": "Marseille",
      "activities": [
        {
          "name": "England vs Russia",
          "group": "Group B",
          "start": '2016-06-11',
          "end": '2016-06-11'
        },
        {
          "name": "France vs Albania",
          "group": "Group A",
          "start": '2016-06-15',
          "end": '2016-06-15'
        },
        {
          "name": "Iceland vs Hungary",
          "group": "Group F",
          "start": '2016-06-18',
          "end": '2016-06-18'
        },
        {
          "name": "Ukraine vs Poland",
          "group": "Group C",
          "start": '2016-06-21',
          "end": '2016-06-21'
        },
        {
          "name": "Quarter Finals",
          "group": "W37 vs W39",
          "start": '2016-06-30',
          "end": '2016-06-30'
        },
        {
          "name": "Semi Final",
          "group": "W47 vs W48",
          "start": '2016-07-07',
          "end": '2016-07-07'
        }
      ]
    },
    {
      "name": "Stade de Lyon",
      "city": "Lyon",
      "activities": [
        {
          "name": "Belgium vs Italy",
          "group": "Group E",
          "start": '2016-06-13',
          "end": '2016-06-13'
        },
        {
          "name": "Ukraine vs Northern Ireland",
          "group": "Group C",
          "start": '2016-06-16',
          "end": '2016-06-16'
        },
        {
          "name": "Romania vs Albania",
          "group": "Group A",
          "start": '2016-06-19',
          "end": '2016-06-19'
        },
        {
          "name": "Hungary vs Portugal",
          "group": "Group F",
          "start": '2016-06-22',
          "end": '2016-06-22'
        },
        {
          "name": "Round of 16",
          "group": "WA vs 3C/D/E",
          "start": '2016-06-26',
          "end": '2016-06-26'
        },
        {
          "name": "Semi Final",
          "group": "W45 vs W46",
          "start": '2016-07-06',
          "end": '2016-07-06'
        }
      ]
    },
    {
      "name": "Stade Pierre Mauroy",
      "city": "Lille",
      "activities": [
        {
          "name": "Germany vs Ukraine",
          "group": "Group C",
          "start": '2016-06-12',
          "end": '2016-06-12'
        },
        {
          "name": "Russia vs Slovakia",
          "group": "Group B",
          "start": '2016-06-15',
          "end": '2016-06-15'
        },
        {
          "name": "Switzerland vs France",
          "group": "Group A",
          "start": '2016-06-19',
          "end": '2016-06-19'
        },
        {
          "name": "Italy vs Republic of Ireland",
          "group": "Group E",
          "start": '2016-06-22',
          "end": '2016-06-22'
        },
        {
          "name": "Round of 16",
          "group": "WC vs 3A/B/F",
          "start": '2016-06-26',
          "end": '2016-06-26'
        },
        {
          "name": "Quarter Final",
          "group": "W38 vs W42",
          "start": '2016-07-01',
          "end": '2016-07-01'
        }
      ]
    },
    {
      "name": "Parc des Princes",
      "city": "Paris",
      "activities": [
        {
          "name": "Turkey vs Croatia",
          "group": "Group D",
          "start": '2016-06-12',
          "end": '2016-06-12'
        },
        {
          "name": "Romania vs Switzerland",
          "group": "Group A",
          "start": '2016-06-15',
          "end": '2016-06-15'
        },
        {
          "name": "Portugal vs Austria",
          "group": "Group F",
          "start": '2016-06-18',
          "end": '2016-06-18'
        },
        {
          "name": "Northern Ireland vs Germany",
          "group": "Group C",
          "start": '2016-06-21',
          "end": '2016-06-21'
        },
        {
          "name": "Round of 16",
          "group": "WB vs 3A/C/D",
          "start": '2016-06-25',
          "end": '2016-06-25'
        }
      ]
    },
    {
      "name": "Stade de Bordeaux",
      "city": "Bordeaux",
      "activities": [
        {
          "name": "Wales vs Slovakia",
          "group": "Group B",
          "start": '2016-06-11',
          "end": '2016-06-11'
        },
        {
          "name": "Austria vs Hungary",
          "group": "Group F",
          "start": '2016-06-14',
          "end": '2016-06-14'
        },
        {
          "name": "Belgium vs Republic of Ireland",
          "group": "Group E",
          "start": '2016-06-18',
          "end": '2016-06-18'
        },
        {
          "name": "Croatia vs Spain",
          "group": "Group D",
          "start": '2016-06-21',
          "end": '2016-06-21'
        },
        {
          "name": "Quarter Final",
          "group": "W41 vs W43",
          "start": '2016-07-02',
          "end": '2016-07-02'
        }
      ]
    },
    {
      "name": "Stade Geoffroy-Guichard",
      "city": "Saint-Etienne",
      "activities": [
        {
          "name": "Portugal vs Iceland",
          "group": "Group F",
          "start": '2016-06-14',
          "end": '2016-06-14'
        },
        {
          "name": "Czech Republic vs Croatia",
          "group": "Group D",
          "start": '2016-06-17',
          "end": '2016-06-17'
        },
        {
          "name": "Slovakia vs England",
          "group": "Group B",
          "start": '2016-06-20',
          "end": '2016-06-20'
        },
        {
          "name": "Round of 16",
          "group": "RA vs RC",
          "start": '2016-06-25',
          "end": '2016-06-25'
        }
      ]
    },
    {
      "name": "Stade de Nice",
      "city": "Nice",
      "activities": [
        {
          "name": "Poland vs Northern Ireland",
          "group": "Group C",
          "start": '2016-06-12',
          "end": '2016-06-12'
        },
        {
          "name": "Spain vs Turkey",
          "group": "Group D",
          "start": '2016-06-17',
          "end": '2016-06-17'
        },
        {
          "name": "Sweden vs Belgium",
          "group": "Group E",
          "start": '2016-06-22',
          "end": '2016-06-22'
        },
        {
          "name": "Round of 16",
          "group": "RB vs RF",
          "start": '2016-06-27',
          "end": '2016-06-27'
        }
      ]
    },
    {
      "name": "Stade Bollaert-Delelis",
      "city": "Lens",
      "activities": [
        {
          "name": "Albania vs Switzerland",
          "group": "Group A",
          "start": '2016-06-11',
          "end": '2016-06-11'
        },
        {
          "name": "England vs Wales",
          "group": "Group B",
          "start": '2016-06-16',
          "end": '2016-06-16'
        },
        {
          "name": "Czech Republic vs Turkey",
          "group": "Group D",
          "start": '2016-06-21',
          "end": '2016-06-21'
        },
        {
          "name": "Round of 16",
          "group": "WD vs 3B/E/F",
          "start": '2016-06-25',
          "end": '2016-06-25'
        }
      ]
    },
    {
      "name": "Stadium de Toulouse",
      "city": "Toulouse",
      "activities": [
        {
          "name": "Spain vs Czech Republic",
          "group": "Group D",
          "start": '2016-06-13',
          "end": '2016-06-13'
        },
        {
          "name": "Italy vs Sweden",
          "group": "Group E",
          "start": '2016-06-17',
          "end": '2016-06-17'
        },
        {
          "name": "Russia vs Wales",
          "group": "Group B",
          "start": '2016-06-20',
          "end": '2016-06-20'
        },
        {
          "name": "Round of 16",
          "group": "WF vs RE",
          "start": '2016-06-26',
          "end": '2016-06-26'
        }
      ]
    }
  ]);

  chart.data(dateSet.mapAs(undefined, {'description': 'city'}));

  chart.activities().labels().useHtml(true);
  chart.activities().labels().textFormatter(function() {
    return this['activityName'] + '<br><span style="color: #ccc">' + this['activityInfo']['group'] + '</span>';
  });

  chart.pixPerHour(30);
  chart.minRowHeight(80);

  chart.container('container').draw();
});

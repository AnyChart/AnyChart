var chart, dataSet, colorScale, chart1;

anychart.onDocumentReady(function () {
  var data = [
    {
      column: '1',
      row: '1',
      name: 'Hydrogen',
      'Number': 1,
      'Symbol': 'H',
      'ElementCategory': 'Other nonmetals',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '1',
      row: '2',
      name: 'Lithium',
      'Number': '3',
      'Symbol': 'Li',
      'ElementCategory': 'Alkali metals',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '1',
      row: '3',
      name: 'Sodium',
      'Number': '11',
      'Symbol': 'Na',
      'ElementCategory': 'Alkali metals',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '1',
      row: '4',
      name: 'Potassium',
      'Number': '19',
      'Symbol': 'K',
      'ElementCategory': 'Alkali metals',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '1',
      row: '5',
      name: 'Rubidium',
      'Number': '37',
      'Symbol': 'Rb',
      'ElementCategory': 'Alkali metals',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '1',
      row: '6',
      name: 'Caesium',
      'Number': '55',
      'Symbol': 'Cs',
      'ElementCategory': 'Alkali metals',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '1',
      row: '7',
      name: 'Francium',
      'Number': '87',
      'Symbol': 'Fr',
      'ElementCategory': 'Alkali metals',
      'NaturalOccurrence': 'From decay'
    },
    {
      column: '1',
      row: '8',
      'name': 'Ununennium',
      'Number': '119',
      'Symbol': 'Uue',
      'ElementCategory': 'Unknown',
      'NaturalOccurrence': 'Undiscovered'
    },
    {
      column: '2',
      row: '4',
      'name': 'Calcium',
      'Number': '20',
      'Symbol': 'Ca',
      'ElementCategory': 'Alkaline earth metals',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '2',
      row: '3',
      'name': 'Magnesium',
      'Number': '12',
      'Symbol': 'Mg',
      'ElementCategory': 'Alkaline earth metals',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '2',
      row: '8',
      'name': 'Unbunulium',
      'Number': '120',
      'Symbol': 'Ubn',
      'ElementCategory': 'Unknown',
      'NaturalOccurrence': 'Undiscovered'
    },
    {
      column: '2',
      row: '5',
      'name': 'Strontium',
      'Number': '38',
      'Symbol': 'Sr',
      'ElementCategory': 'Alkaline earth metals',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '2',
      row: '6',
      'name': 'Barium',
      'Number': '56',
      'Symbol': 'Ba',
      'ElementCategory': 'Alkaline earth metals',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '2',
      row: '7',
      'name': 'Radium',
      'Number': '88',
      'Symbol': 'Ra',
      'ElementCategory': 'Alkaline earth metals',
      'NaturalOccurrence': 'From decay'
    },
    {
      column: '2',
      row: '2',
      'name': 'Beryllium',
      'Number': '4',
      'Symbol': 'Be',
      'ElementCategory': 'Alkaline earth metals',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '3',
      row: '5',
      'name': 'Yttrium',
      'Number': '39',
      'Symbol': 'Y',
      'ElementCategory': 'Transition elements',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '3',
      row: '4',
      'name': 'Scandium',
      'Number': '21',
      'Symbol': 'Sc',
      'ElementCategory': 'Transition elements',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '4',
      row: '7',
      'name': 'Rutherfordium',
      'Number': '104',
      'Symbol': 'Rf',
      'ElementCategory': 'Transition elements',
      'NaturalOccurrence': 'Syntetic'
    },
    {
      column: '4',
      row: '6',
      'name': 'Hafnium',
      'Number': '72',
      'Symbol': 'Hf',
      'ElementCategory': 'Transition elements',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '4',
      row: '5',
      'name': 'Zircomium',
      'Number': '40',
      'Symbol': 'Zr',
      'ElementCategory': 'Transition elements',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '4',
      row: '4',
      'name': 'Titanium',
      'Number': '22',
      'Symbol': 'Ti',
      'ElementCategory': 'Transition elements',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '5',
      row: '5',
      'name': 'Niobium',
      'Number': '41',
      'Symbol': 'Nb',
      'ElementCategory': 'Transition elements',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '5',
      row: '4',
      'name': 'Vanadium',
      'Number': '23',
      'Symbol': 'V',
      'ElementCategory': 'Transition elements',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '5',
      row: '7',
      'name': 'Dubnium',
      'Number': '105',
      'Symbol': 'Db',
      'ElementCategory': 'Transition elements',
      'NaturalOccurrence': 'Syntetic'
    },
    {
      column: '5',
      row: '6',
      'name': 'Tantalum',
      'Number': '73',
      'Symbol': 'Ta',
      'ElementCategory': 'Transition elements',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '6',
      row: '5',
      'name': 'Molybdenum',
      'Number': '42',
      'Symbol': 'Mo',
      'ElementCategory': 'Transition elements',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '6',
      row: '6',
      'name': 'Tungsten',
      'Number': '74',
      'Symbol': 'W',
      'ElementCategory': 'Transition elements',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '6',
      row: '7',
      'name': 'Seaborgium',
      'Number': '106',
      'Symbol': 'Sg',
      'ElementCategory': 'Transition elements',
      'NaturalOccurrence': 'Syntetic'
    },
    {
      column: '6',
      row: '4',
      'name': 'Chronium',
      'Number': '24',
      'Symbol': 'Cr',
      'ElementCategory': 'Transition elements',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '7',
      row: '7',
      'name': 'Bohrium',
      'Number': '107',
      'Symbol': 'Bh',
      'ElementCategory': 'Transition elements',
      'NaturalOccurrence': 'Syntetic'
    },
    {
      column: '7',
      row: '6',
      'name': 'Rhenium',
      'Number': '75',
      'Symbol': 'Re',
      'ElementCategory': 'Transition elements',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '7',
      row: '4',
      'name': 'Manganese',
      'Number': '25',
      'Symbol': 'Mn',
      'ElementCategory': 'Transition elements',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '7',
      row: '5',
      'name': 'Technetium',
      'Number': '43',
      'Symbol': 'Tc',
      'ElementCategory': 'Transition elements',
      'NaturalOccurrence': 'From decay'
    },
    {
      column: '8',
      row: '5',
      'name': 'Ruthenium',
      'Number': '44',
      'Symbol': 'Ru',
      'ElementCategory': 'Transition elements',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '8',
      row: '4',
      'name': 'Iron',
      'Number': '26',
      'Symbol': 'Fe',
      'ElementCategory': 'Transition elements',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '8',
      row: '7',
      'name': 'Hassium',
      'Number': '108',
      'Symbol': 'Hs',
      'ElementCategory': 'Transition elements',
      'NaturalOccurrence': 'Syntetic'
    },
    {
      column: '8',
      row: '6',
      'name': 'Osmium',
      'Number': '76',
      'Symbol': 'Os',
      'ElementCategory': 'Transition elements',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '9',
      row: '5',
      'name': 'Rhodium',
      'Number': '45',
      'Symbol': 'Rh',
      'ElementCategory': 'Transition elements',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '9',
      row: '4',
      'name': 'Cobalt',
      'Number': '27',
      'Symbol': 'Co',
      'ElementCategory': 'Transition elements',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '9',
      row: '7',
      'name': 'Meitnerium',
      'Number': '109',
      'Symbol': 'Mt',
      'ElementCategory': 'Unknown',
      'NaturalOccurrence': 'Syntetic'
    },
    {
      column: '9',
      row: '6',
      'name': 'Iridium',
      'Number': '77',
      'Symbol': 'Ir',
      'ElementCategory': 'Transition elements',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '10',
      row: '7',
      'name': 'Darmstadtium',
      'Number': '110',
      'Symbol': 'Ds',
      'ElementCategory': 'Unknown',
      'NaturalOccurrence': 'Syntetic'
    },
    {
      column: '10',
      row: '6',
      'name': 'Platinum',
      'Number': '78',
      'Symbol': 'Pt',
      'ElementCategory': 'Transition elements',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '10',
      row: '4',
      'name': 'Nickel',
      'Number': '28',
      'Symbol': 'Ni',
      'ElementCategory': 'Transition elements',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '10',
      row: '5',
      'name': 'Palladium',
      'Number': '46',
      'Symbol': 'Pd',
      'ElementCategory': 'Transition elements',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '11',
      row: '4',
      'name': 'Copper',
      'Number': '29',
      'Symbol': 'Cu',
      'ElementCategory': 'Transition elements',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '11',
      row: '6',
      name: 'Gold',
      'Number': '79',
      'Symbol': 'Au',
      'ElementCategory': 'Transition elements',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '11',
      row: '7',
      'name': 'Roentgenium',
      'Number': '111',
      'Symbol': 'Rg',
      'ElementCategory': 'Unknown',
      'NaturalOccurrence': 'Syntetic'
    },
    {
      column: '11',
      row: '5',
      'name': 'Silver',
      'Number': '47',
      'Symbol': 'Ag',
      'ElementCategory': 'Transition elements',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '12',
      row: '7',
      'name': 'Ununbium',
      'Number': '112',
      'Symbol': 'Uub',
      'ElementCategory': 'Transition elements',
      'NaturalOccurrence': 'Syntetic'
    },
    {
      column: '12',
      row: '6',
      'name': 'Mercury',
      'Number': '80',
      'Symbol': 'Hg',
      'ElementCategory': 'Transition elements',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '12',
      row: '5',
      'name': 'Cadmium',
      'Number': '48',
      'Symbol': 'Cd',
      'ElementCategory': 'Transition elements',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '12',
      row: '4',
      'name': 'Zinc',
      'Number': '30',
      'Symbol': 'Zn',
      'ElementCategory': 'Transition elements',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '13',
      row: '2',
      'name': 'Boron',
      'Number': '5',
      'Symbol': 'B',
      'ElementCategory': 'Metalloids',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '13',
      row: '7',
      'name': 'Ununtrium',
      'Number': '113',
      'Symbol': 'Uut',
      'ElementCategory': 'Unknown',
      'NaturalOccurrence': 'Synthetic'
    },
    {
      column: '13',
      row: '5',
      'name': 'Indium',
      'Number': '49',
      'Symbol': 'In',
      'ElementCategory': 'Other metals',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '13',
      row: '3',
      'name': 'Aluminium',
      'Number': '13',
      'Symbol': 'Al',
      'ElementCategory': 'Other metals',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '13',
      row: '6',
      'name': 'Thallium',
      'Number': '81',
      'Symbol': 'Tl',
      'ElementCategory': 'Other metals',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '13',
      row: '4',
      'name': 'Gallium',
      'Number': '31',
      'Symbol': 'Ga',
      'ElementCategory': 'Other metals',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '14',
      row: '4',
      'name': 'Germanium',
      'Number': '32',
      'Symbol': 'Ge',
      'ElementCategory': 'Metalloids',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '14',
      row: '3',
      'name': 'Silicon',
      'Number': '14',
      'Symbol': 'Si',
      'ElementCategory': 'Metalloids',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '14',
      row: '5',
      'name': 'Tin',
      'Number': '50',
      'Symbol': 'Sn',
      'ElementCategory': 'Other metals',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '14',
      row: '6',
      'name': 'Lead',
      'Number': '82',
      'Symbol': 'Pb',
      'ElementCategory': 'Other metals',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '14',
      row: '7',
      'name': 'Ununquadium',
      'Number': '114',
      'Symbol': 'Uuq',
      'ElementCategory': 'Unknown',
      'NaturalOccurrence': 'Synthetic'
    },
    {
      column: '14',
      row: '2',
      'name': 'Carbon',
      'Number': '6',
      'Symbol': 'C',
      'ElementCategory': 'Other nonmetals',
      'NaturalOccurrence': 'Primordia'
    },
    {
      column: '15',
      row: '6',
      'name': 'Bismuth',
      'Number': '83',
      'Symbol': 'Bi',
      'ElementCategory': 'Other metals',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '15',
      row: '2',
      'name': 'Nitrogen',
      'Number': '7',
      'Symbol': 'N',
      'ElementCategory': 'Other nonmetals',
      'NaturalOccurrence': 'Primordia'
    },
    {
      column: '15',
      row: '5',
      'name': 'Antimony',
      'Number': '51',
      'Symbol': 'Sb',
      'ElementCategory': 'Metalloids',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '15',
      row: '4',
      'name': 'Arsenic',
      'Number': '33',
      'Symbol': 'As',
      'ElementCategory': 'Metalloids',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '15',
      row: '3',
      'name': 'Phosphorus',
      'Number': '15',
      'Symbol': 'P',
      'ElementCategory': 'Other nonmetals',
      'NaturalOccurrence': 'Primordia'
    },
    {
      column: '15',
      row: '7',
      'name': 'Ununpentium',
      'Number': '115',
      'Symbol': 'Uup',
      'ElementCategory': 'Unknown',
      'NaturalOccurrence': 'Synthetic'
    },
    {
      column: '16',
      row: '5',
      'name': 'Tellurium',
      'Number': '52',
      'Symbol': 'Te',
      'ElementCategory': 'Metalloids',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '16',
      row: '4',
      'name': 'Selenium',
      'Number': '34',
      'Symbol': 'Se',
      'ElementCategory': 'Other nonmetals',
      'NaturalOccurrence': 'Primordia'
    },
    {
      column: '16',
      row: '6',
      'name': 'Polonium',
      'Number': '84',
      'Symbol': 'Po',
      'ElementCategory': 'Metalloids',
      'NaturalOccurrence': 'From decay'
    },
    {
      column: '16',
      row: '2',
      'name': 'Oxygen',
      'Number': '8',
      'Symbol': 'O',
      'ElementCategory': 'Other nonmetals',
      'NaturalOccurrence': 'Primordia'
    },
    {
      column: '16',
      row: '3',
      'name': 'Sulfur',
      'Number': '16',
      'Symbol': 'S',
      'ElementCategory': 'Other nonmetals',
      'NaturalOccurrence': 'Primordia'
    },
    {
      column: '16',
      row: '7',
      'name': 'Ununhexium',
      'Number': '116',
      'Symbol': 'Uuh',
      'ElementCategory': 'Unknown',
      'NaturalOccurrence': 'Synthetic'
    },
    {
      column: '17',
      row: '5',
      'name': 'Iodine',
      'Number': '53',
      'Symbol': 'I',
      'ElementCategory': 'Halogens',
      'NaturalOccurrence': 'Primordia'
    },
    {
      column: '17',
      row: '6',
      'name': 'Astatine',
      'Number': '85',
      'Symbol': 'At',
      'ElementCategory': 'Halogens',
      'NaturalOccurrence': 'From decay'
    },
    {
      column: '17',
      row: '2',
      'name': 'Fluorine',
      'Number': '9',
      'Symbol': 'F',
      'ElementCategory': 'Halogens',
      'NaturalOccurrence': 'Primordia'
    },
    {
      column: '17',
      row: '3',
      'name': 'Chlorine',
      'Number': '17',
      'Symbol': 'Cl',
      'ElementCategory': 'Halogens',
      'NaturalOccurrence': 'Primordia'
    },
    {
      column: '17',
      row: '4',
      'name': 'Bromine',
      'Number': '35',
      'Symbol': 'Br',
      'ElementCategory': 'Halogens',
      'NaturalOccurrence': 'Primordia'
    },
    {
      column: '17',
      row: '7',
      'name': 'Ununseptium',
      'Number': '117',
      'Symbol': 'Uus',
      'ElementCategory': 'Unknown',
      'NaturalOccurrence': 'Undiscovered'
    },
    {
      column: '18',
      row: '5',
      'name': 'Xenon',
      'Number': '54',
      'Symbol': 'Xe',
      'ElementCategory': 'Noble gases',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '18',
      row: '6',
      'name': 'Radon',
      'Number': '86',
      'Symbol': 'Rn',
      'ElementCategory': 'Noble gases',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '18',
      row: '4',
      'name': 'Krypton',
      'Number': '36',
      'Symbol': 'Kr',
      'ElementCategory': 'Noble gases',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '18',
      row: '3',
      'name': 'Argon',
      'Number': '18',
      'Symbol': 'Ar',
      'ElementCategory': 'Noble gases',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '18',
      row: '2',
      'name': 'Neon',
      'Number': '10',
      'Symbol': 'Ne',
      'ElementCategory': 'Noble gases',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '18',
      row: '1',
      'name': 'Helium',
      'Number': '2',
      'Symbol': 'He',
      'ElementCategory': 'Noble gases',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '18',
      row: '1',
      'name': 'Helium',
      'Number': '2',
      'Symbol': 'He',
      'ElementCategory': 'Noble gases',
      'NaturalOccurrence': 'Primordial'
    },
    {
      column: '18',
      row: '7',
      'name': 'Ununoctium',
      'Number': '118',
      'Symbol': 'Uuo',
      'ElementCategory': 'Unknown',
      'NaturalOccurrence': 'Synthetic'
    }
  ];
  dataSet = anychart.data.set(data);
  var heatMapData = dataSet.mapAs(undefined, {x: 'column', y: 'row', heat: 'ElementCategory'});
  chart = anychart.heatMap(heatMapData);

  colorScale = anychart.scales.ordinalColor();
  colorScale.ranges([
    {equal: 'Alkali metals', color: '#FF6666'},
    {equal: 'Alkaline earth metals', color: '#FFDEAD'},
    {equal: 'Transition elements', color: '#FFC0C0'},
    {equal: 'Other metals', color: '#CCCCCC'},
    {equal: 'Metalloids', color: '#CCCC99'},
    {equal: 'Other nonmetals', color: '#A0FFA0'},
    {equal: 'Halogens', color: '#FFFF99'},
    {equal: 'Noble gases', color: '#C0FFFF'},
    {equal: 'Unknown', color: '#FCFCFC'}
  ]);

  chart.colorScale(colorScale);
  chart.title('Periodic table');

  chart.tooltip()
      .titleFormatter(function() {
        return this.getDataValue('name')
      })
      .textFormatter(function() {
        var text = 'Atomic number: ' + this.getDataValue('Number') + '\n' +
            'Symbol: ' + this.getDataValue('Symbol') + '\n' +
            'Category: ' + this.getDataValue('ElementCategory');
        return text;

      });

  chart.labels()
      .enabled(true)
      .textFormatter(function() {
        return this.getDataValue('Symbol');
      });

  chart.legend()
      .align('center')
      .position('bottom')
      .itemsLayout('h')
      .enabled(true);

  chart.yAxis()
      .title('Period');

  chart.xAxis()
      .orientation('top')
      .title('Groups');

  chart.container('container').draw();
});


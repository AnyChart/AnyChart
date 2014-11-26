var rawData = [
  {
    'id': '1',
    'name': 'Phase 1 - Strategic Plan',
    'progress': '14%',
    'actualStart': '2000.1.24 0.0',
    'actualEnd': '2000.2.28 0.0'
  },
  {
    'id': '2',
    'name': 'Self-Assessment',
    'parent': '1',
    'progress': '25%',
    'actualStart': '2000.1.24 0.0',
    'actualEnd': '2000.2.2 0.0'
  },
  {
    'id': '3',
    'name': 'Define business vision',
    'parent': '2',
    'progress': '0%',
    'actualStart': '2000.1.24 16.0',
    'actualEnd': '2000.1.25 1.0'
  },
  {
    'id': '4',
    'name': 'Identify available skills, information and support',
    'parent': '2',
    'progress': '0%',
    'actualStart': '2000.1.25 16.0',
    'actualEnd': '2000.1.26 1.0'
  },
  {
    'id': '5',
    'name': 'Decide whether to proceed',
    'parent': '2',
    'progress': '0%',
    'actualStart': '2000.1.28 16.0',
    'actualEnd': '2000.1.29 1.0'
  },
  {
    'id': '6',
    'name': 'Define the Opportunity',
    'parent': '1',
    'progress': '27%',
    'actualStart': '2000.1.29 0.0',
    'actualEnd': '2000.2.14 0.0'
  },
  {
    'id': '7',
    'name': 'Research the market and competition',
    'parent': '6',
    'progress': '0%',
    'actualStart': '2000.1.29 16.0',
    'actualEnd': '2000.2.1 1.0'
  },
  {
    'id': '8',
    'name': 'Interview owners of similar businesses',
    'parent': '6',
    'progress': '60%',
    'actualStart': '2000.2.1 0.0',
    'actualEnd': '2000.2.8 0.0'
  },
  {
    'id': '9',
    'name': 'Identify needed resources',
    'parent': '6',
    'progress': '0%',
    'actualStart': '2000.2.8 16.0',
    'actualEnd': '2000.2.10 1.0'
  },
  {
    'id': '10',
    'name': 'Identify operating cost elements',
    'parent': '6',
    'progress': '0%',
    'actualStart': '2000.2.10 16.0',
    'actualEnd': '2000.2.14 1.0'
  },
  {
    'id': '11',
    'name': 'Evaluate Business Approach',
    'parent': '1',
    'progress': '0%',
    'actualStart': '2000.2.14 16.0',
    'actualEnd': '2000.2.18 1.0'
  },
  {
    'id': '12',
    'name': 'Define new entity requirements',
    'parent': '11',
    'progress': '0%',
    'actualStart': '2000.2.14 16.0',
    'actualEnd': '2000.2.15 1.0'
  },
  {
    'id': '13',
    'name': 'Identify on-going business purchase opportunities',
    'parent': '11',
    'progress': '0%',
    'actualStart': '2000.2.15 16.0',
    'actualEnd': '2000.2.16 1.0'
  },
  {
    'id': '14',
    'name': 'Research franchise possibilities',
    'parent': '11',
    'progress': '0%',
    'actualStart': '2000.2.16 16.0',
    'actualEnd': '2000.2.17 1.0'
  },
  {
    'id': '15',
    'name': 'Summarize business approach',
    'parent': '11',
    'progress': '0%',
    'actualStart': '2000.2.17 16.0',
    'actualEnd': '2000.2.18 1.0'
  },
  {
    'id': '16',
    'name': 'Evaluate Potential Risks and Rewards',
    'parent': '1',
    'progress': '0%',
    'actualStart': '2000.2.15 16.0',
    'actualEnd': '2000.2.25 1.0'
  },
  {
    'id': '17',
    'name': 'Assess market size and stability',
    'parent': '16',
    'progress': '0%',
    'actualStart': '2000.2.15 16.0',
    'actualEnd': '2000.2.17 1.0'
  },
  {
    'id': '18',
    'name': 'Estimate the competition',
    'parent': '16',
    'progress': '0%',
    'actualStart': '2000.2.17 16.0',
    'actualEnd': '2000.2.18 1.0'
  },
  {
    'id': '19',
    'name': 'Assess needed resource availability',
    'parent': '16',
    'progress': '0%',
    'actualStart': '2000.2.22 16.0',
    'actualEnd': '2000.2.24 1.0'
  },
  {
    'id': '20',
    'name': 'Evaluate realistic initial market share',
    'parent': '16',
    'progress': '0%',
    'actualStart': '2000.2.24 16.0',
    'actualEnd': '2000.2.25 1.0'
  },
  {
    'id': '21',
    'name': 'Determine financial requirements',
    'parent': '16',
    'progress': '0%',
    'actualStart': '2000.2.20 16.0',
    'actualEnd': '2000.2.22 1.0'
  },
  {
    'id': '22',
    'name': 'Review personal suitability',
    'parent': '16',
    'progress': '0%',
    'actualStart': '2000.2.22 16.0',
    'actualEnd': '2000.2.23 1.0'
  },
  {
    'id': '23',
    'name': 'Evaluate initial profitability',
    'parent': '16',
    'progress': '0%',
    'actualStart': '2000.2.23 16.0',
    'actualEnd': '2000.2.24 1.0'
  },
  {
    'id': '24',
    'name': 'Review and modify the strategic plan',
    'parent': '1',
    'progress': '0%',
    'actualStart': '2000.2.24 16.0',
    'actualEnd': '2000.2.28 2.0'
  },
  {
    'id': '25',
    'name': 'Confirm decision to proceed',
    'parent': '1',
    'progress': '0%',
    'actualStart': '2000.2.28 2.0',
    'actualEnd': '2000.2.28 2.0'
  },
  {
    'id': '26',
    'name': 'Phase 2 - Define the Business Opportunity',
    'progress': '19%',
    'actualStart': '2000.2.28 0.0',
    'actualEnd': '2000.4.3 0.0'
  },
  {
    'id': '27',
    'name': 'Define the Market',
    'parent': '26',
    'progress': '28%',
    'actualStart': '2000.2.28 0.0',
    'actualEnd': '2000.3.14 0.0'
  },
  {
    'id': '28',
    'name': 'Access available information',
    'parent': '27',
    'progress': '0%',
    'actualStart': '2000.2.28 17.0',
    'actualEnd': '2000.2.29 2.0'
  },
  {
    'id': '29',
    'name': 'Create market analysis plan',
    'parent': '27',
    'progress': '0%',
    'actualStart': '2000.2.29 17.0',
    'actualEnd': '2000.2.31 2.0'
  },
  {
    'id': '30',
    'name': 'Implement market analysis plan',
    'parent': '27',
    'progress': '40%',
    'actualStart': '2000.2.31 0.0',
    'actualEnd': '2000.3.7 0.0'
  },
  {
    'id': '31',
    'name': 'Identify competition',
    'parent': '27',
    'progress': '60%',
    'actualStart': '2000.3.7 0.0',
    'actualEnd': '2000.3.11 0.0'
  },
  {
    'id': '32',
    'name': 'Summarize the market',
    'parent': '27',
    'progress': '0%',
    'actualStart': '2000.3.11 17.0',
    'actualEnd': '2000.3.13 2.0'
  },
  {
    'id': '33',
    'name': 'Identify target market niche',
    'parent': '27',
    'progress': '0%',
    'actualStart': '2000.3.13 17.0',
    'actualEnd': '2000.3.14 2.0'
  },
  {
    'id': '34',
    'name': 'Identify Needed Materials and Supplies',
    'parent': '26',
    'progress': '0%',
    'actualStart': '2000.3.13 17.0',
    'actualEnd': '2000.3.22 2.0'
  },
  {
    'id': '35',
    'name': 'Select a business approach (from "Evaluate Business Approach" above)',
    'parent': '34',
    'progress': '0%',
    'actualStart': '2000.3.13 17.0',
    'actualEnd': '2000.3.15 2.0'
  },
  {
    'id': '36',
    'name': 'Identify management staff resources',
    'parent': '34',
    'progress': '0%',
    'actualStart': '2000.3.17 17.0',
    'actualEnd': '2000.3.18 2.0'
  },
  {
    'id': '37',
    'name': 'Identify staffing requirements',
    'parent': '34',
    'progress': '0%',
    'actualStart': '2000.3.18 17.0',
    'actualEnd': '2000.3.19 2.0'
  },
  {
    'id': '38',
    'name': 'Identify needed raw materials',
    'parent': '34',
    'progress': '0%',
    'actualStart': '2000.3.19 17.0',
    'actualEnd': '2000.3.20 2.0'
  },
  {
    'id': '39',
    'name': 'Identify needed utilities',
    'parent': '34',
    'progress': '0%',
    'actualStart': '2000.3.20 17.0',
    'actualEnd': '2000.3.21 2.0'
  },
  {
    'id': '40',
    'name': 'Summarize operating expenses and financial projections',
    'parent': '34',
    'progress': '0%',
    'actualStart': '2000.3.21 17.0',
    'actualEnd': '2000.3.22 2.0'
  },
  {
    'id': '41',
    'name': 'Evaluate Potential Risks and Rewards',
    'parent': '26',
    'progress': '17%',
    'actualStart': '2000.3.24 0.0',
    'actualEnd': '2000.4.2 0.0'
  },
  {
    'id': '42',
    'name': 'Assess market size and stability',
    'parent': '41',
    'progress': '50%',
    'actualStart': '2000.3.24 0.0',
    'actualEnd': '2000.3.26 0.0'
  },
  {
    'id': '43',
    'name': 'Assess needed resources availability',
    'parent': '41',
    'progress': '0%',
    'actualStart': '2000.3.26 17.0',
    'actualEnd': '2000.3.28 2.0'
  },
  {
    'id': '44',
    'name': 'Forecast financial returns',
    'parent': '41',
    'progress': '0%',
    'actualStart': '2000.3.28 17.0',
    'actualEnd': '2000.4.2 2.0'
  },
  {
    'id': '45',
    'name': 'Review and modify the business opportunity',
    'parent': '26',
    'progress': '0%',
    'actualStart': '2000.4.2 17.0',
    'actualEnd': '2000.4.3 2.0'
  },
  {
    'id': '46',
    'name': 'Confirm decision to proceed',
    'parent': '26',
    'progress': '0%',
    'actualStart': '2000.4.3 2.0',
    'actualEnd': '2000.4.3 2.0'
  },
  {
    'id': '47',
    'name': 'Phase 3 - Plan for Action',
    'progress': '17%',
    'actualStart': '2000.4.3 0.0',
    'actualEnd': '2000.5.1 0.0'
  },
  {
    'id': '48',
    'name': 'Develop Detailed 5-Year Business Plan',
    'parent': '47',
    'progress': '17%',
    'actualStart': '2000.4.3 0.0',
    'actualEnd': '2000.5.1 0.0'
  },
  {
    'id': '49',
    'name': 'Describe the vision and opportunity',
    'parent': '48',
    'progress': '0%',
    'actualStart': '2000.4.3 17.0',
    'actualEnd': '2000.4.4 2.0'
  },
  {
    'id': '50',
    'name': 'List assumptions',
    'parent': '48',
    'progress': '0%',
    'actualStart': '2000.4.4 17.0',
    'actualEnd': '2000.4.5 2.0'
  },
  {
    'id': '51',
    'name': 'Describe the market',
    'parent': '48',
    'progress': '0%',
    'actualStart': '2000.4.5 17.0',
    'actualEnd': '2000.4.6 2.0'
  },
  {
    'id': '52',
    'name': 'Describe the new business',
    'parent': '48',
    'progress': '0%',
    'actualStart': '2000.4.8 17.0',
    'actualEnd': '2000.4.9 2.0'
  },
  {
    'id': '53',
    'name': 'Describe strengths, weaknesses, assets and threats',
    'parent': '48',
    'progress': '0%',
    'actualStart': '2000.4.9 17.0',
    'actualEnd': '2000.4.10 2.0'
  },
  {
    'id': '54',
    'name': 'Estimate sales volume during startup period',
    'parent': '48',
    'progress': '0%',
    'actualStart': '2000.4.10 17.0',
    'actualEnd': '2000.4.11 2.0'
  },
  {
    'id': '55',
    'name': 'Forecast operating costs',
    'parent': '48',
    'progress': '0%',
    'actualStart': '2000.4.11 17.0',
    'actualEnd': '2000.4.12 2.0'
  },
  {
    'id': '56',
    'name': 'Establish pricing strategy',
    'parent': '48',
    'progress': '0%',
    'actualStart': '2000.4.12 17.0',
    'actualEnd': '2000.4.13 2.0'
  },
  {
    'id': '57',
    'name': 'Forecast revenue',
    'parent': '48',
    'progress': '0%',
    'actualStart': '2000.4.15 17.0',
    'actualEnd': '2000.4.16 2.0'
  },
  {
    'id': '58',
    'name': 'X',
    'parent': '48',
    'progress': '0%',
    'actualStart': '2000.4.16 17.0',
    'actualEnd': '2000.4.18 2.0'
  },
  {
    'id': '59',
    'name': 'Develop break-even analysis',
    'parent': '48',
    'progress': '0%',
    'actualStart': '2000.4.18 17.0',
    'actualEnd': '2000.4.19 2.0'
  },
  {
    'id': '60',
    'name': 'Develop cash-flow projection',
    'parent': '48',
    'progress': '0%',
    'actualStart': '2000.4.19 17.0',
    'actualEnd': '2000.4.20 2.0'
  },
  {
    'id': '61',
    'name': 'Identify licensing and permitting requirements',
    'parent': '48',
    'progress': '0%',
    'actualStart': '2000.4.22 17.0',
    'actualEnd': '2000.4.23 2.0'
  },
  {
    'id': '62',
    'name': 'Develop startup plan',
    'parent': '48',
    'progress': '100%',
    'actualStart': '2000.4.23 17.0',
    'actualEnd': '2000.4.25 2.0'
  },
  {
    'id': '63',
    'name': 'Develop sales and marketing strategy',
    'parent': '48',
    'progress': '0%',
    'actualStart': '2000.4.25 17.0',
    'actualEnd': '2000.4.26 2.0'
  },
  {
    'id': '64',
    'name': 'Develop distribution structure',
    'parent': '48',
    'progress': '0%',
    'actualStart': '2000.4.26 17.0',
    'actualEnd': '2000.4.27 2.0'
  },
  {
    'id': '65',
    'name': 'Describe risks and opportunities',
    'parent': '48',
    'progress': '20%',
    'actualStart': '2000.4.29 0.0',
    'actualEnd': '2000.4.31 0.0'
  },
  {
    'id': '66',
    'name': 'Publish the business plan',
    'parent': '48',
    'progress': '0%',
    'actualStart': '2000.4.31 17.0',
    'actualEnd': '2000.5.1 2.0'
  },
  {
    'id': '67',
    'name': 'Confirm decision to proceed',
    'parent': '48',
    'progress': '0%',
    'actualStart': '2000.5.1 2.0',
    'actualEnd': '2000.5.1 2.0'
  },
  {
    'id': '68',
    'name': 'Phase 4 - Proceed With Startup Plan',
    'progress': '24%',
    'actualStart': '2000.5.1 0.0',
    'actualEnd': '2000.7.24 0.0'
  },
  {
    'id': '69',
    'name': 'Choose a location',
    'parent': '68',
    'progress': '36%',
    'actualStart': '2000.5.1 0.0',
    'actualEnd': '2000.5.2 0.0'
  },
  {
    'id': '70',
    'name': 'Establish Business Structure',
    'parent': '68',
    'progress': '14%',
    'actualStart': '2000.5.2 0.0',
    'actualEnd': '2000.6.11 0.0'
  },
  {
    'id': '71',
    'name': 'Choose a Name',
    'parent': '70',
    'progress': '33%',
    'actualStart': '2000.5.2 0.0',
    'actualEnd': '2000.5.6 0.0'
  },
  {
    'id': '72',
    'name': 'Identify implications',
    'parent': '71',
    'progress': '40%',
    'actualStart': '2000.5.2 0.0',
    'actualEnd': '2000.5.3 0.0'
  },
  {
    'id': '73',
    'name': 'Research name availability',
    'parent': '71',
    'progress': '0%',
    'actualStart': '2000.5.5 17.0',
    'actualEnd': '2000.5.6 2.0'
  },
  {
    'id': '74',
    'name': 'Choose a Bank',
    'parent': '70',
    'progress': '0%',
    'actualStart': '2000.5.6 17.0',
    'actualEnd': '2000.5.13 2.0'
  },
  {
    'id': '75',
    'name': 'Establish accounts',
    'parent': '74',
    'progress': '0%',
    'actualStart': '2000.5.6 17.0',
    'actualEnd': '2000.5.10 2.0'
  },
  {
    'id': '76',
    'name': 'Establish line of credit',
    'parent': '74',
    'progress': '0%',
    'actualStart': '2000.5.12 17.0',
    'actualEnd': '2000.5.13 2.0'
  },
  {
    'id': '77',
    'name': 'Choose legal representation',
    'parent': '70',
    'progress': '0%',
    'actualStart': '2000.5.12 17.0',
    'actualEnd': '2000.5.13 2.0'
  },
  {
    'id': '78',
    'name': 'Select business tax-basis category',
    'parent': '70',
    'progress': '0%',
    'actualStart': '2000.5.13 17.0',
    'actualEnd': '2000.5.15 2.0'
  },
  {
    'id': '79',
    'name': 'Choose capital funding source',
    'parent': '70',
    'progress': '0%',
    'actualStart': '2000.5.15 17.0',
    'actualEnd': '2000.5.17 2.0'
  },
  {
    'id': '80',
    'name': 'Commit capital funding',
    'parent': '70',
    'progress': '0%',
    'actualStart': '2000.5.17 2.0',
    'actualEnd': '2000.5.17 2.0'
  },
  {
    'id': '81',
    'name': 'Establish the Operating Control Base',
    'parent': '70',
    'progress': '19%',
    'actualStart': '2000.5.19 0.0',
    'actualEnd': '2000.6.11 0.0'
  },
  {
    'id': '82',
    'name': 'Choose and set up the accounting system',
    'parent': '81',
    'progress': '0%',
    'actualStart': '2000.5.19 17.0',
    'actualEnd': '2000.5.21 2.0'
  },
  {
    'id': '83',
    'name': 'Obtain required licenses and permits',
    'parent': '81',
    'progress': '38%',
    'actualStart': '2000.5.21 0.0',
    'actualEnd': '2000.6.1 0.0'
  },
  {
    'id': '84',
    'name': 'Obtain needed insurance',
    'parent': '81',
    'progress': '0%',
    'actualStart': '2000.6.3 17.0',
    'actualEnd': '2000.6.7 2.0'
  },
  {
    'id': '85',
    'name': 'Establish security plan',
    'parent': '81',
    'progress': '0%',
    'actualStart': '2000.6.7 17.0',
    'actualEnd': '2000.6.11 2.0'
  },
  {
    'id': '86',
    'name': 'Develop Marketing Program',
    'parent': '70',
    'progress': '0%',
    'actualStart': '2000.5.5 17.0',
    'actualEnd': '2000.5.9 2.0'
  },
  {
    'id': '87',
    'name': 'Establish an advertising program',
    'parent': '86',
    'progress': '0%',
    'actualStart': '2000.5.5 17.0',
    'actualEnd': '2000.5.7 2.0'
  },
  {
    'id': '88',
    'name': 'Develop a logo',
    'parent': '86',
    'progress': '0%',
    'actualStart': '2000.5.7 17.0',
    'actualEnd': '2000.5.8 2.0'
  },
  {
    'id': '89',
    'name': 'Order promotional materials',
    'parent': '86',
    'progress': '0%',
    'actualStart': '2000.5.8 17.0',
    'actualEnd': '2000.5.9 2.0'
  },
  {
    'id': '90',
    'name': 'Provide Physical Facilities',
    'parent': '68',
    'progress': '16%',
    'actualStart': '2000.6.11 0.0',
    'actualEnd': '2000.7.24 0.0'
  },
  {
    'id': '91',
    'name': 'Secure operation space',
    'parent': '90',
    'progress': '0%',
    'actualStart': '2000.6.11 17.0',
    'actualEnd': '2000.6.18 2.0'
  },
  {
    'id': '92',
    'name': 'Select computer network hardware',
    'parent': '90',
    'progress': '100%',
    'actualStart': '2000.6.18 17.0',
    'actualEnd': '2000.6.19 2.0'
  },
  {
    'id': '93',
    'name': 'Select computer software',
    'parent': '90',
    'progress': '0%',
    'actualStart': '2000.6.19 17.0',
    'actualEnd': '2000.6.20 2.0'
  },
  {
    'id': '94',
    'name': 'Establish utilities',
    'parent': '90',
    'progress': '67%',
    'actualStart': '2000.6.21 0.0',
    'actualEnd': '2000.6.26 0.0'
  },
  {
    'id': '95',
    'name': 'Provide furniture and equipment',
    'parent': '90',
    'progress': '15%',
    'actualStart': '2000.6.26 0.0',
    'actualEnd': '2000.7.1 0.0'
  },
  {
    'id': '96',
    'name': 'Move in',
    'parent': '90',
    'progress': '13%',
    'actualStart': '2000.7.23 0.0',
    'actualEnd': '2000.7.24 0.0'
  },
  {
    'id': '97',
    'name': 'Provide Staffing',
    'parent': '68',
    'progress': '30%',
    'actualStart': '2000.5.19 0.0',
    'actualEnd': '2000.7.23 0.0'
  },
  {
    'id': '98',
    'name': 'Interview and test candidates',
    'parent': '97',
    'progress': '43%',
    'actualStart': '2000.5.19 0.0',
    'actualEnd': '2000.6.7 0.0'
  },
  {
    'id': '99',
    'name': 'Hire staff',
    'parent': '97',
    'progress': '10%',
    'actualStart': '2000.6.7 0.0',
    'actualEnd': '2000.6.21 0.0'
  },
  {
    'id': '100',
    'name': 'Train staff',
    'parent': '97',
    'progress': '31%',
    'actualStart': '2000.7.1 0.0',
    'actualEnd': '2000.7.23 0.0'
  }
];


function turn() {
  var el = document.getElementById('area');
  el.value += 'var rawData = [\n';
  for (var i = 0; i < rawData.length; i++) {
    var item = rawData[i];
    el.value += '{\n';
    el.value += '\'id\': \'' + item.id + '\',\n';
    el.value += '\'name\': \'' + item.name + '\',\n';
    if (item.parent) el.value += '\'parent\': \'' + item.parent + '\',\n';
    el.value += '\'progress\': \'' + item.progress + '\',\n';

    var start = parseDate(item.actualStart);
    var end = parseDate(item.actualEnd);
    el.value += '\'actualStart\': Date.UTC(' + start[0] + ', ' + start[1] + ', ' + start[2] + ', ' + start[3] + ', ' + start[4] + ', ' + '0 , 0),\n';
    el.value += '\'actualEnd\': Date.UTC(' + end[0] + ', ' + end[1] + ', ' + end[2] + ', ' + end[3] + ', ' + end[4] + ', ' + '0, 0)\n';


    el.value += '},\n';
  }
  el.value += '];\n';
}

function parseDate(str) {
  str = str.replace(' ', '.');
  return str.split('.');
}
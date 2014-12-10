var rawData = [
  {
    'id': '1',
    'name': 'Phase 1 - Strategic Plan',
    'progressValue': '14%',
    'actualStart': Date.UTC(2000, 1, 24, 0, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 2, 28, 0, 0, 0, 0),
    'rowHeight': 40,
    'connectTo': '2'
  },
  {
    'id': '2',
    'name': 'Self-Assessment',
    'parent': '1',
    'progressValue': '25%',
    'actualStart': Date.UTC(2000, 1, 24, 0, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 2, 2, 0, 0, 0, 0),
    'rowHeight': 30,
    'baselineStart': Date.UTC(2000, 1, 27, 12, 0, 0, 0),
    'baselineEnd': Date.UTC(2000, 2, 2, 14, 0, 0, 0)

  },
  {
    'id': '3',
    'name': 'Define business vision',
    'parent': '2',
    'progressValue': '75%',
    'actualStart': Date.UTC(2000, 1, 24, 16, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 1, 25, 12, 0, 0, 0),
    'connectTo': '4',
    'connectorType': 'finishFinish'

  },
  {
    'id': '4',
    'name': 'Identify available skills, information and support',
    'parent': '2',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 1, 25, 16, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 1, 26, 1, 0, 0, 0),
    'connectTo': '7',
    'connectorType': 'startStart'
  },
  {
    'id': '5',
    'name': 'Decide whether to proceed',
    'parent': '2',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 1, 28, 16, 0, 0, 0)
  },
  {
    'id': '6',
    'name': 'Define the Opportunity',
    'parent': '1',
    'progressValue': '27%',
    'actualStart': Date.UTC(2000, 1, 29, 0, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 2, 14, 0, 0, 0, 0),
    'rowHeight': 30,
    'progress': {
      'label': {
        'fontColor': '#ff0',
        'value': 'progress ~27%'
      }
    }
  },
  {
    'id': '7',
    'name': 'Research the market and competition',
    'parent': '6',
    'progressValue': '75%',
    'actualStart': Date.UTC(2000, 1, 28, 16, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 2, 1, 1, 0, 0, 0),
    'baselineStart': Date.UTC(2000, 1, 27, 12, 0, 0, 0),
    'baselineEnd': Date.UTC(2000, 2, 2, 14, 0, 0, 0),
    'rowHeight': 45,
    'connectTo': '8',
    'connectorType': 'finishFinish',
    'baseline': {
      'label': {
        'value': 'This label appears only if is set directly.'
      }

    }
  },
  {
    'id': '8',
    'name': 'Interview owners of similar businesses',
    'parent': '6',
    'progressValue': '60%',
    'actualStart': Date.UTC(2000, 2, 1, 0, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 2, 8, 0, 0, 0, 0),
    'connectTo': '9',
    'connectorType': 'startFinish'
  },
  {
    'id': '9',
    'name': 'Identify needed resources',
    'parent': '6',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 2, 8, 16, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 2, 10, 1, 0, 0, 0),
    'connectTo': '10'
  },
  {
    'id': '10',
    'name': 'Identify operating cost elements',
    'parent': '6',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 2, 10, 16, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 2, 14, 1, 0, 0, 0)
  },
  {
    'id': '11',
    'name': 'Evaluate Business Approach',
    'parent': '1',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 2, 14, 16, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 2, 18, 1, 0, 0, 0),
    'rowHeight': 30
  },
  {
    'id': '12',
    'name': 'Define new entity requirements',
    'parent': '11',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 2, 14, 16, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 2, 15, 1, 0, 0, 0)
  },
  {
    'id': '13',
    'name': 'Identify on-going business purchase opportunities',
    'parent': '11',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 2, 15, 16, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 2, 16, 1, 0, 0, 0)
  },
  {
    'id': '14',
    'name': 'Research franchise possibilities',
    'parent': '11',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 2, 16, 16, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 2, 17, 1, 0, 0, 0),
    'connectTo': '17'
  },
  {
    'id': '15',
    'name': 'Summarize business approach',
    'parent': '11',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 2, 17, 16, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 2, 18, 1, 0, 0, 0)
  },
  {
    'id': '16',
    'name': 'Evaluate Potential Risks and Rewards',
    'parent': '1',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 2, 15, 16, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 2, 25, 1, 0, 0, 0),
    'rowHeight': 30
  },
  {
    'id': '17',
    'name': 'Assess market size and stability',
    'parent': '16',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 2, 15, 16, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 2, 17, 1, 0, 0, 0)
  },
  {
    'id': '18',
    'name': 'Estimate the competition',
    'parent': '16',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 2, 17, 16, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 2, 18, 1, 0, 0, 0),
    'connectTo': '23'
  },
  {
    'id': '19',
    'name': 'Assess needed resource availability',
    'parent': '16',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 2, 22, 16, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 2, 24, 1, 0, 0, 0)
  },
  {
    'id': '20',
    'name': 'Evaluate realistic initial market share',
    'parent': '16',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 2, 24, 16, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 2, 25, 1, 0, 0, 0)
  },
  {
    'id': '21',
    'name': 'Determine financial requirements',
    'parent': '16',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 2, 20, 16, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 2, 22, 1, 0, 0, 0)
  },
  {
    'id': '22',
    'name': 'Review personal suitability',
    'parent': '16',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 2, 22, 16, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 2, 23, 1, 0, 0, 0)
  },
  {
    'id': '23',
    'name': 'Evaluate initial profitability',
    'parent': '16',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 2, 23, 16, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 2, 24, 1, 0, 0, 0)
  },
  {
    'id': '24',
    'name': 'Review and modify the strategic plan',
    'parent': '1',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 2, 24, 16, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 2, 28, 2, 0, 0, 0),
    'rowHeight': 30
  },
  {
    'id': '25',
    'name': 'Confirm decision to proceed',
    'parent': '1',
    'actualStart': Date.UTC(2000, 2, 28, 2, 0, 0, 0),
    'rowHeight': 30
  },
  {
    'id': '26',
    'name': 'Phase 2 - Define the Business Opportunity',
    'progressValue': '19%',
    'actualStart': Date.UTC(2000, 2, 28, 0, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 4, 3, 0, 0, 0, 0),
    'rowHeight': 40
  },
  {
    'id': '27',
    'name': 'Define the Market',
    'parent': '26',
    'progressValue': '28%',
    'actualStart': Date.UTC(2000, 2, 28, 0, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 3, 14, 0, 0, 0, 0),
    'rowHeight': 30
  },
  {
    'id': '28',
    'name': 'Access available information',
    'parent': '27',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 2, 28, 17, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 2, 29, 2, 0, 0, 0)
  },
  {
    'id': '29',
    'name': 'Create market analysis plan',
    'parent': '27',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 2, 29, 17, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 2, 31, 2, 0, 0, 0)
  },
  {
    'id': '30',
    'name': 'Implement market analysis plan',
    'parent': '27',
    'progressValue': '40%',
    'actualStart': Date.UTC(2000, 2, 31, 0, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 3, 7, 0, 0, 0, 0)
  },
  {
    'id': '31',
    'name': 'Identify competition',
    'parent': '27',
    'progressValue': '60%',
    'actualStart': Date.UTC(2000, 3, 7, 0, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 3, 11, 0, 0, 0, 0)
  },
  {
    'id': '32',
    'name': 'Summarize the market',
    'parent': '27',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 3, 11, 17, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 3, 13, 2, 0, 0, 0)
  },
  {
    'id': '33',
    'name': 'Identify target market niche',
    'parent': '27',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 3, 13, 17, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 3, 14, 2, 0, 0, 0)
  },
  {
    'id': '34',
    'name': 'Identify Needed Materials and Supplies',
    'parent': '26',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 3, 13, 17, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 3, 22, 2, 0, 0, 0),
    'rowHeight': 30
  },
  {
    'id': '35',
    'name': 'Select a business approach (from "Evaluate Business Approach" above)',
    'parent': '34',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 3, 13, 17, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 3, 15, 2, 0, 0, 0)
  },
  {
    'id': '36',
    'name': 'Identify management staff resources',
    'parent': '34',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 3, 17, 17, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 3, 18, 2, 0, 0, 0)
  },
  {
    'id': '37',
    'name': 'Identify staffing requirements',
    'parent': '34',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 3, 18, 17, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 3, 19, 2, 0, 0, 0)
  },
  {
    'id': '38',
    'name': 'Identify needed raw materials',
    'parent': '34',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 3, 19, 17, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 3, 20, 2, 0, 0, 0)
  },
  {
    'id': '39',
    'name': 'Identify needed utilities',
    'parent': '34',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 3, 20, 17, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 3, 21, 2, 0, 0, 0)
  },
  {
    'id': '40',
    'name': 'Summarize operating expenses and financial projections',
    'parent': '34',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 3, 21, 17, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 3, 22, 2, 0, 0, 0)
  },
  {
    'id': '41',
    'name': 'Evaluate Potential Risks and Rewards',
    'parent': '26',
    'progressValue': '17%',
    'actualStart': Date.UTC(2000, 3, 24, 0, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 4, 2, 0, 0, 0, 0),
    'rowHeight': 30
  },
  {
    'id': '42',
    'name': 'Assess market size and stability',
    'parent': '41',
    'progressValue': '50%',
    'actualStart': Date.UTC(2000, 3, 24, 0, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 3, 26, 0, 0, 0, 0)
  },
  {
    'id': '43',
    'name': 'Assess needed resources availability',
    'parent': '41',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 3, 26, 17, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 3, 28, 2, 0, 0, 0)
  },
  {
    'id': '44',
    'name': 'Forecast financial returns',
    'parent': '41',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 3, 28, 17, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 4, 2, 2, 0, 0, 0)
  },
  {
    'id': '45',
    'name': 'Review and modify the business opportunity',
    'parent': '26',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 4, 2, 17, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 4, 3, 2, 0, 0, 0),
    'rowHeight': 30
  },
  {
    'id': '46',
    'name': 'Confirm decision to proceed',
    'parent': '26',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 4, 3, 2, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 4, 3, 2, 0, 0, 0),
    'rowHeight': 30
  },
  {
    'id': '47',
    'name': 'Phase 3 - Plan for Action',
    'progressValue': '17%',
    'actualStart': Date.UTC(2000, 4, 3, 0, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 5, 1, 0, 0, 0, 0),
    'rowHeight': 40
  },
  {
    'id': '48',
    'name': 'Develop Detailed 5-Year Business Plan',
    'parent': '47',
    'progressValue': '17%',
    'actualStart': Date.UTC(2000, 4, 3, 0, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 5, 1, 0, 0, 0, 0),
    'rowHeight': 30
  },
  {
    'id': '49',
    'name': 'Describe the vision and opportunity',
    'parent': '48',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 4, 3, 17, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 4, 4, 2, 0, 0, 0)
  },
  {
    'id': '50',
    'name': 'List assumptions',
    'parent': '48',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 4, 4, 17, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 4, 5, 2, 0, 0, 0)
  },
  {
    'id': '51',
    'name': 'Describe the market',
    'parent': '48',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 4, 5, 17, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 4, 6, 2, 0, 0, 0)
  },
  {
    'id': '52',
    'name': 'Describe the new business',
    'parent': '48',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 4, 8, 17, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 4, 9, 2, 0, 0, 0)
  },
  {
    'id': '53',
    'name': 'Describe strengths, weaknesses, assets and threats',
    'parent': '48',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 4, 9, 17, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 4, 10, 2, 0, 0, 0)
  },
  {
    'id': '54',
    'name': 'Estimate sales volume during startup period',
    'parent': '48',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 4, 10, 17, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 4, 11, 2, 0, 0, 0)
  },
  {
    'id': '55',
    'name': 'Forecast operating costs',
    'parent': '48',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 4, 11, 17, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 4, 12, 2, 0, 0, 0)
  },
  {
    'id': '56',
    'name': 'Establish pricing strategy',
    'parent': '48',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 4, 12, 17, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 4, 13, 2, 0, 0, 0)
  },
  {
    'id': '57',
    'name': 'Forecast revenue',
    'parent': '48',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 4, 15, 17, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 4, 16, 2, 0, 0, 0)
  },
  {
    'id': '58',
    'name': 'X',
    'parent': '48',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 4, 16, 17, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 4, 18, 2, 0, 0, 0)
  },
  {
    'id': '59',
    'name': 'Develop break-even analysis',
    'parent': '48',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 4, 18, 17, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 4, 19, 2, 0, 0, 0)
  },
  {
    'id': '60',
    'name': 'Develop cash-flow projection',
    'parent': '48',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 4, 19, 17, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 4, 20, 2, 0, 0, 0)
  },
  {
    'id': '61',
    'name': 'Identify licensing and permitting requirements',
    'parent': '48',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 4, 22, 17, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 4, 23, 2, 0, 0, 0)
  },
  {
    'id': '62',
    'name': 'Develop startup plan',
    'parent': '48',
    'progressValue': '100%',
    'actualStart': Date.UTC(2000, 4, 23, 17, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 4, 25, 2, 0, 0, 0)
  },
  {
    'id': '63',
    'name': 'Develop sales and marketing strategy',
    'parent': '48',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 4, 25, 17, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 4, 26, 2, 0, 0, 0)
  },
  {
    'id': '64',
    'name': 'Develop distribution structure',
    'parent': '48',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 4, 26, 17, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 4, 27, 2, 0, 0, 0)
  },
  {
    'id': '65',
    'name': 'Describe risks and opportunities',
    'parent': '48',
    'progressValue': '20%',
    'actualStart': Date.UTC(2000, 4, 29, 0, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 4, 31, 0, 0, 0, 0)
  },
  {
    'id': '66',
    'name': 'Publish the business plan',
    'parent': '48',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 4, 31, 17, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 5, 1, 2, 0, 0, 0)
  },
  {
    'id': '67',
    'name': 'Confirm decision to proceed',
    'parent': '48',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 5, 1, 2, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 5, 1, 2, 0, 0, 0)
  },
  {
    'id': '68',
    'name': 'Phase 4 - Proceed With Startup Plan',
    'progressValue': '24%',
    'actualStart': Date.UTC(2000, 5, 1, 0, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 7, 24, 0, 0, 0, 0),
    'rowHeight': 40
  },
  {
    'id': '69',
    'name': 'Choose a location',
    'parent': '68',
    'progressValue': '36%',
    'actualStart': Date.UTC(2000, 5, 1, 0, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 5, 2, 0, 0, 0, 0),
    'rowHeight': 30
  },
  {
    'id': '70',
    'name': 'Establish Business Structure',
    'parent': '68',
    'progressValue': '14%',
    'actualStart': Date.UTC(2000, 5, 2, 0, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 6, 11, 0, 0, 0, 0),
    'rowHeight': 30
  },
  {
    'id': '71',
    'name': 'Choose a Name',
    'parent': '70',
    'progressValue': '33%',
    'actualStart': Date.UTC(2000, 5, 2, 0, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 5, 6, 0, 0, 0, 0)
  },
  {
    'id': '72',
    'name': 'Identify implications',
    'parent': '71',
    'progressValue': '40%',
    'actualStart': Date.UTC(2000, 5, 2, 0, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 5, 3, 0, 0, 0, 0)
  },
  {
    'id': '73',
    'name': 'Research name availability',
    'parent': '71',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 5, 5, 17, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 5, 6, 2, 0, 0, 0)
  },
  {
    'id': '74',
    'name': 'Choose a Bank',
    'parent': '70',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 5, 6, 17, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 5, 13, 2, 0, 0, 0)
  },
  {
    'id': '75',
    'name': 'Establish accounts',
    'parent': '74',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 5, 6, 17, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 5, 10, 2, 0, 0, 0)
  },
  {
    'id': '76',
    'name': 'Establish line of credit',
    'parent': '74',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 5, 12, 17, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 5, 13, 2, 0, 0, 0)
  },
  {
    'id': '77',
    'name': 'Choose legal representation',
    'parent': '70',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 5, 12, 17, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 5, 13, 2, 0, 0, 0)
  },
  {
    'id': '78',
    'name': 'Select business tax-basis category',
    'parent': '70',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 5, 13, 17, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 5, 15, 2, 0, 0, 0)
  },
  {
    'id': '79',
    'name': 'Choose capital funding source',
    'parent': '70',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 5, 15, 17, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 5, 17, 2, 0, 0, 0)
  },
  {
    'id': '80',
    'name': 'Commit capital funding',
    'parent': '70',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 5, 17, 2, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 5, 17, 2, 0, 0, 0)
  },
  {
    'id': '81',
    'name': 'Establish the Operating Control Base',
    'parent': '70',
    'progressValue': '19%',
    'actualStart': Date.UTC(2000, 5, 19, 0, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 6, 11, 0, 0, 0, 0)
  },
  {
    'id': '82',
    'name': 'Choose and set up the accounting system',
    'parent': '81',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 5, 19, 17, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 5, 21, 2, 0, 0, 0)
  },
  {
    'id': '83',
    'name': 'Obtain required licenses and permits',
    'parent': '81',
    'progressValue': '38%',
    'actualStart': Date.UTC(2000, 5, 21, 0, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 6, 1, 0, 0, 0, 0)
  },
  {
    'id': '84',
    'name': 'Obtain needed insurance',
    'parent': '81',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 6, 3, 17, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 6, 7, 2, 0, 0, 0)
  },
  {
    'id': '85',
    'name': 'Establish security plan',
    'parent': '81',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 6, 7, 17, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 6, 11, 2, 0, 0, 0)
  },
  {
    'id': '86',
    'name': 'Develop Marketing Program',
    'parent': '70',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 5, 5, 17, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 5, 9, 2, 0, 0, 0)
  },
  {
    'id': '87',
    'name': 'Establish an advertising program',
    'parent': '86',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 5, 5, 17, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 5, 7, 2, 0, 0, 0)
  },
  {
    'id': '88',
    'name': 'Develop a logo',
    'parent': '86',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 5, 7, 17, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 5, 8, 2, 0, 0, 0)
  },
  {
    'id': '89',
    'name': 'Order promotional materials',
    'parent': '86',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 5, 8, 17, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 5, 9, 2, 0, 0, 0)
  },
  {
    'id': '90',
    'name': 'Provide Physical Facilities',
    'parent': '68',
    'progressValue': '16%',
    'actualStart': Date.UTC(2000, 6, 11, 0, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 7, 24, 0, 0, 0, 0),
    'rowHeight': 30
  },
  {
    'id': '91',
    'name': 'Secure operation space',
    'parent': '90',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 6, 11, 17, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 6, 18, 2, 0, 0, 0)
  },
  {
    'id': '92',
    'name': 'Select computer network hardware',
    'parent': '90',
    'progressValue': '100%',
    'actualStart': Date.UTC(2000, 6, 18, 17, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 6, 19, 2, 0, 0, 0)
  },
  {
    'id': '93',
    'name': 'Select computer software',
    'parent': '90',
    'progressValue': '0%',
    'actualStart': Date.UTC(2000, 6, 19, 17, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 6, 20, 2, 0, 0, 0)
  },
  {
    'id': '94',
    'name': 'Establish utilities',
    'parent': '90',
    'progressValue': '67%',
    'actualStart': Date.UTC(2000, 6, 21, 0, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 6, 26, 0, 0, 0, 0)
  },
  {
    'id': '95',
    'name': 'Provide furniture and equipment',
    'parent': '90',
    'progressValue': '15%',
    'actualStart': Date.UTC(2000, 6, 26, 0, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 7, 1, 0, 0, 0, 0)
  },
  {
    'id': '96',
    'name': 'Move in',
    'parent': '90',
    'progressValue': '13%',
    'actualStart': Date.UTC(2000, 7, 23, 0, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 7, 24, 0, 0, 0, 0)
  },
  {
    'id': '97',
    'name': 'Provide Staffing',
    'parent': '68',
    'progressValue': '30%',
    'actualStart': Date.UTC(2000, 5, 19, 0, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 7, 23, 0, 0, 0, 0),
    'rowHeight': 30
  },
  {
    'id': '98',
    'name': 'Interview and test candidates',
    'parent': '97',
    'progressValue': '43%',
    'actualStart': Date.UTC(2000, 5, 19, 0, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 6, 7, 0, 0, 0, 0)
  },
  {
    'id': '99',
    'name': 'Hire staff',
    'parent': '97',
    'progressValue': '10%',
    'actualStart': Date.UTC(2000, 6, 7, 0, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 6, 21, 0, 0, 0, 0)
  },
  {
    'id': '100',
    'name': 'Train staff',
    'parent': '97',
    'progressValue': '31%',
    'actualStart': Date.UTC(2000, 7, 1, 0, 0, 0, 0),
    'actualEnd': Date.UTC(2000, 7, 23, 0, 0, 0, 0)
  }
];

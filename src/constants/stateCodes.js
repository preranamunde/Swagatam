// LG Directory numeric state codes required by the API
export const STATE_CODES = {
  'SELECT':                     '',
  'ANDAMAN AND NICOBAR':        '35',
  'ANDHRA PRADESH':             '28',
  'ARUNACHAL PRADESH':          '12',
  'ASSAM':                      '18',
  'BIHAR':                      '10',
  'CHANDIGARH':                 '4',
  'CHHATTISGARH':               '22',
  'DADRA AND NAGAR HAVELI':     '26',
  'DAMAN AND DIU':              '25',
  'DELHI':                      '7',
  'GOA':                        '30',
  'GUJARAT':                    '24',
  'HARYANA':                    '6',
  'HIMACHAL PRADESH':           '2',
  'JAMMU AND KASHMIR':          '1',
  'JHARKHAND':                  '20',
  'KARNATAKA':                  '29',
  'KERALA':                     '32',
  'LADAKH':                     '37',
  'LAKSHADWEEP':                '31',
  'MADHYA PRADESH':             '23',
  'MAHARASHTRA':                '27',
  'MANIPUR':                    '14',
  'MEGHALAYA':                  '17',
  'MIZORAM':                    '15',
  'NAGALAND':                   '13',
  'ORISSA':                     '21',
  'PUDUCHERRY':                 '34',
  'PUNJAB':                     '3',
  'RAJASTHAN':                  '8',
  'SIKKIM':                     '11',
  'TAMIL NADU':                 '33',
  'TELANGANA':                  '36',
  'TRIPURA':                    '16',
  'UTTAR PRADESH':              '9',
  'UTTARAKHAND':                '5',
  'WEST BENGAL':                '19',
};

// Numeric ID type codes required by the API
export const ID_TYPE_CODES = {
  'SELECT':          '',
  'VOTER ID':        '1',
  'PASSPORT':        '2',
  'DRIVING LICENSE': '3',
  'GOV.ID CARD':     '4',
  'OTHER':           '5',
};

export const getStateCode = (stateName) => STATE_CODES[stateName] || '';
export const getIdTypeCode = (idType) => ID_TYPE_CODES[idType] || '';
export const mockParentSchedule = {
  monthLabel: 'MARCH',
  weekdays: [
    { key: 'sun', label: 'S', tone: 'sun' },
    { key: 'mon', label: 'M', tone: 'default' },
    { key: 'tue', label: 'T', tone: 'default' },
    { key: 'wed', label: 'W', tone: 'default' },
    { key: 'thu', label: 'T', tone: 'default' },
    { key: 'fri', label: 'F', tone: 'default' },
    { key: 'sat', label: 'S', tone: 'sat' },
  ],
  weeks: [
    [
      { key: '2026-03-01', label: '1', inMonth: true },
      { key: '2026-03-02', label: '2', inMonth: true },
      { key: '2026-03-03', label: '3', inMonth: true },
      { key: '2026-03-04', label: '4', inMonth: true },
      { key: '2026-03-05', label: '5', inMonth: true },
      { key: '2026-03-06', label: '6', inMonth: true },
      { key: '2026-03-07', label: '7', inMonth: true },
    ],
    [
      { key: '2026-03-08', label: '8', inMonth: true },
      { key: '2026-03-09', label: '9', inMonth: true },
      { key: '2026-03-10', label: '10', inMonth: true },
      { key: '2026-03-11', label: '11', inMonth: true },
      { key: '2026-03-12', label: '12', inMonth: true },
      { key: '2026-03-13', label: '13', inMonth: true },
      { key: '2026-03-14', label: '14', inMonth: true },
    ],
    [
      { key: '2026-03-15', label: '15', inMonth: true },
      { key: '2026-03-16', label: '16', inMonth: true },
      { key: '2026-03-17', label: '17', inMonth: true },
      { key: '2026-03-18', label: '18', inMonth: true },
      { key: '2026-03-19', label: '19', inMonth: true },
      { key: '2026-03-20', label: '20', inMonth: true },
      { key: '2026-03-21', label: '21', inMonth: true },
    ],
    [
      { key: '2026-03-22', label: '22', inMonth: true },
      { key: '2026-03-23', label: '23', inMonth: true },
      { key: '2026-03-24', label: '24', inMonth: true },
      { key: '2026-03-25', label: '25', inMonth: true },
      { key: '2026-03-26', label: '26', inMonth: true },
      {
        key: '2026-03-27',
        label: '27',
        inMonth: true,
        markers: [
          { key: 'ob', label: '산부인과', typeKey: 'baby', color: '#ff3b3b', textColor: '#ffffff' },
          { key: 'carrot', label: '당근', typeKey: 'personal', color: '#fef19f', textColor: '#000000' },
        ],
      },
      { key: '2026-03-28', label: '28', inMonth: true },
    ],
    [
      { key: '2026-03-29', label: '29', inMonth: true },
      { key: '2026-03-30', label: '30', inMonth: true },
      { key: '2026-03-31', label: '31', inMonth: true },
      { key: '2026-04-01', label: '1', inMonth: false },
      { key: '2026-04-02', label: '2', inMonth: false },
      { key: '2026-04-03', label: '3', inMonth: false },
      { key: '2026-04-04', label: '4', inMonth: false },
    ],
  ],
  details: {
    '2026-03-27': {
      day: '27',
      dayOfWeek: '금',
      items: [
        {
          key: 'ob',
          title: '산부인과',
          time: '15:00',
          location: '분당제일여성병원',
          note: '철분제 조절 필요한지 물어보기',
          typeKey: 'baby',
        },
        {
          key: 'carrot',
          title: '당근',
          time: '21:30',
          location: '미금역',
          note: '아기용품, 현금3만원 준비',
          typeKey: 'personal',
        },
      ],
    },
  },
  todo: {
    default: {
      weekLabel: '25주차',
      recommended: [
        { key: 'water', text: '물 자주 마시기', checked: false },
        { key: 'stretch', text: '가벼운 스트레칭 하기', checked: true },
      ],
      myList: [{ key: 'journal', text: '오늘 컨디션 기록하기', checked: false }],
    },
    byDate: {
      '2026-03-27': {
        weekLabel: '25주차',
        recommended: [
          { key: 'exam', text: '임신성 당뇨 선별검사 받기', checked: true },
          { key: 'exercise', text: '골반저근 운동', checked: false },
        ],
        myList: [{ key: 'reading', text: '육아 독서 읽기', checked: true }],
      },
      '2026-03-26': {
        weekLabel: '25주차',
        recommended: [
          { key: 'walk', text: '20분 산책하기', checked: false },
          { key: 'vitamin', text: '영양제 챙겨 먹기', checked: true },
        ],
        myList: [{ key: 'bag', text: '병원 갈 가방 미리 챙기기', checked: false }],
      },
      '2026-03-28': {
        weekLabel: '26주차',
        recommended: [
          { key: 'rest', text: '오후에 30분 휴식하기', checked: false },
          { key: 'snack', text: '간식 미리 준비하기', checked: true },
        ],
        myList: [{ key: 'photo', text: '배냇저고리 사진 저장하기', checked: false }],
      },
    },
  },
}

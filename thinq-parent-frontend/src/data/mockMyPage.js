import diaryReadImage from '@shared-assets/lookdiary.png'
import diaryWriteImage from '@shared-assets/writerdiary.png'
import momBtiPreviewImage from '@shared-assets/MOMBTI.png'

export const mockMyPage = {
  childName: '틔움이',
  dDay: 102,
  dueDate: '26.07.07',
  mombti: {
    title: 'MomBTI',
    description: '아이를 더 잘 알기 위한 첫걸음,\n먼저 나의 육아 성향을 알아보세요.',
    ctaLabel: '테스트하러 가기',
    previewImage: momBtiPreviewImage,
  },
  diaryCards: [
    {
      key: 'write',
      label: '일기 쓰기',
      image: diaryWriteImage,
    },
    {
      key: 'read',
      label: '일기 보기',
      image: diaryReadImage,
    },
  ],
  schedule: {
    monthLabel: 'MARCH',
    day: '27',
    dayOfWeek: '금',
    items: [
      {
        key: 'ob',
        title: '산부인과',
        time: '15:00',
        tone: 'primary',
      },
      {
        key: 'carrot',
        title: '당근',
        time: '21:30',
        tone: 'secondary',
      },
    ],
  },
  todo: {
    weekLabel: '25주차',
    items: [
      {
        key: 'exam',
        text: '임신성 당뇨 선별검사 받기',
        checked: true,
      },
      {
        key: 'exercise',
        text: '골반저근 운동',
        checked: false,
      },
    ],
  },
}

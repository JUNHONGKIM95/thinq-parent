import ptieImage from '@shared-assets/srg/PTIE.svg'

export const mockMombtiRow = {
  mbti_id: 1,
  mombti_type: 'PTIE',
  title: '빈틈없는 전략맘',
  subtitle: '체계적으로 설계하고\n가장 효율적인 답을 찾는 엄마',
  summary:
    '미리 계획을 세우고, 원칙에 따라 판단하며,\n스스로 해결책을 찾는 편이에요.\n육아와 집안일 모두 예측 가능하고 정돈된 상태를\n선호하며, 시간과 에너지를 아끼는 방식에 강합니다.',
  image: ptieImage,
}

export const mockMombtiMeta = {
  subtitleHighlight: '효율적인 답',
  scores: {
    planner: 72,
    reactive: 28,
    thinking: 64,
    feeling: 36,
    independent: 55,
    connected: 45,
    efficiency: 60,
    meaning: 40,
  },
  details: [
    {
      key: 'P',
      title: 'Planner, 계획형',
      desc: '육아와 일상을 미리 예상하고 준비하는 성향이에요.\n일정, 준비물, 루틴을 사전에 정리해두면 마음이 편해요.',
    },
    {
      key: 'R',
      title: 'Reactive, 반응형',
      desc: '그때그때 상황에 맞춰 유연하게 대응하는 성향이에요.\n미리 정해두기보다 아이 상태와 현실 변화에 맞게 빠르게 조정해요.',
    },
    {
      key: 'T',
      title: 'Thinking, 원칙형',
      desc: '감정보다 기준과 논리를 바탕으로 판단하는 성향이에요.\n세운 원칙과 일관성을 중요하게 여기며, 이유 있는 선택을 선호해요.',
    },
    {
      key: 'F',
      title: 'Feeling, 감각형',
      desc: '기준보다 아이의 상태와 분위기를 먼저 살피는 성향이에요.\n그날의 컨디션, 감정, 흐름에 따라 더 맞는 방향을 선택해요.',
    },
    {
      key: 'I',
      title: 'Independent, 독립처리형',
      desc: '문제가 생기면 먼저 스스로 찾고 해결하려는 성향이에요.\n정보 탐색과 판단을 혼자 정리한 뒤 움직이는 편이에요.',
    },
    {
      key: 'C',
      title: 'Connected, 의존형',
      desc: '주변과 의견을 나누며 함께 해결하는 성향이에요.\n가족, 친구, 커뮤니티, 전문가의 경험과 조언을 적극 참고해요.',
    },
    {
      key: 'E',
      title: 'Efficiency, 효율중심형',
      desc: '시간과 에너지를 아끼는 실용적인 방식을 중시하는 성향이에요.\n자동화, 간소화, 빠른 해결처럼 덜 힘들고 더 편한 선택을 선호해요.',
    },
    {
      key: 'M',
      title: 'Meaning, 의미중심형',
      desc: '효율보다 경험의 가치와 정서적 만족을 더 중요하게 여기는 성향이에요. 조금 더 손이 가더라도 아이와의 교감, 과정의 의미, 마음의 만족을 중시해요.',
    },
  ],
  navigation: [
    { key: 'home', label: '홈' },
    { key: 'device', label: '가전육아' },
    { key: 'community', label: '커뮤니티' },
    { key: 'my', label: 'MY' },
  ],
}

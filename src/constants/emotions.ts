export const emotions = [
  {
    id: "happy",
    emoji: "😊",
    label: "행복",
    hint: "당신을 기분 좋게 한 일은 무엇인가요?",
  },
  {
    id: "excited",
    emoji: "😄",
    label: "신남",
    hint: "어떤 일이 가장 즐거웠나요?",
  },
  {
    id: "in_love",
    emoji: "🥰",
    label: "설렘",
    hint: "무엇이 당신의 마음을 두근거리게 했나요?",
  },
  {
    id: "love",
    emoji: "❤️",
    label: "사랑",
    hint: "어떤 곳에서 애정을 느꼈나요?",
  },
  {
    id: "grateful",
    emoji: "🙏",
    label: "감사",
    hint: "가장 고마웠던 순간은 언제였나요?",
  },
  {
    id: "calm",
    emoji: "😌",
    label: "평온",
    hint: "어떤 곳에서 평온함을 찾았나요?",
  },
  {
    id: "confident",
    emoji: "😎",
    label: "자신감",
    hint: "어떤 일에서 뿌듯함을 느꼈나요?",
  },
  {
    id: "surprised",
    emoji: "😲",
    label: "놀람",
    hint: "예상 밖의 일이 있었나요?",
  },
  {
    id: "embarrassed",
    emoji: "😳",
    label: "당황",
    hint: "어떤 순간이 민망하거나 당황스러웠나요?",
  },
  {
    id: "confused",
    emoji: "😵",
    label: "혼란",
    hint: "무엇이 머릿속을 복잡하게 만들었나요?",
  },
  {
    id: "anxious",
    emoji: "😟",
    label: "걱정",
    hint: "무엇이 가장 신경 쓰였나요?",
  },
  {
    id: "sad",
    emoji: "😢",
    label: "슬픔",
    hint: "어떤 일이 당신을 속상하게 했나요?",
  },
  {
    id: "devastated",
    emoji: "😭",
    label: "매우 슬픔",
    hint: "가장 힘들었던 순간이 언제였나요?",
  },
  {
    id: "lonely",
    emoji: "🥺",
    label: "외로움",
    hint: "어떤 순간에 외로움을 느꼈나요?",
  },
  {
    id: "angry",
    emoji: "😠",
    label: "화남",
    hint: "무엇이 화나거나 짜증나게 했나요?",
  },
  {
    id: "frustrated",
    emoji: "😤",
    label: "답답함",
    hint: "마음처럼 되지 않았던 일이 있었나요?",
  },
  {
    id: "tired",
    emoji: "😴",
    label: "피곤",
    hint: "어떤 일로 에너지를 쏟았나요?",
  },
  {
    id: "sick",
    emoji: "🤒",
    label: "아픔",
    hint: "어떤 이유로 몸이나 마음이 아프거나 불편했나요?",
  },
  {
    id: "bored",
    emoji: "😑",
    label: "지루함",
    hint: "어떤 곳에서 무기력함이나 지루함을 느꼈나요?",
  },
  {
    id: "accomplished",
    emoji: "🏆",
    label: "성취감",
    hint: "오늘 가장 잘했다고 느낀 일은 무엇인가요?",
  },
] as const;

export type EmotionId = (typeof emotions)[number]["id"];

export const emotions = [
  {
    id: "happy",
    label: "기쁨",
    emoji: "😊",
    hint: "무엇이 오늘을 기쁘게 만들었나요?",
  },
  {
    id: "sad",
    label: "슬픔",
    emoji: "😢",
    hint: "마음이 가라앉은 이유가 있었나요?",
  },
  {
    id: "calm",
    label: "평온",
    emoji: "😌",
    hint: "어떤 순간에 마음이 편안했나요?",
  },
  {
    id: "tired",
    label: "피곤",
    emoji: "😮‍💨",
    hint: "오늘 가장 에너지를 많이 쓴 일은 무엇인가요?",
  },
  {
    id: "excited",
    label: "설렘",
    emoji: "🤩",
    hint: "기대되거나 두근거렸던 일이 있었나요?",
  },
  {
    id: "angry",
    label: "화남",
    emoji: "😠",
    hint: "무엇이 마음을 불편하게 했나요?",
  },
  {
    id: "anxious",
    label: "불안",
    emoji: "😟",
    hint: "걱정이 생긴 이유는 무엇인가요?",
  },
  {
    id: "grateful",
    label: "감사",
    emoji: "🙏",
    hint: "오늘 고맙게 느낀 사람이나 순간이 있었나요?",
  },
] as const;

export type EmotionId = (typeof emotions)[number]["id"];

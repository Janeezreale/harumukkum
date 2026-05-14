export type DateInput = Date | string | number;

export type WeekRange = {
  startDate: string;
  endDate: string;
};

function toDate(date: DateInput = new Date()) {
  if (date instanceof Date) {
    return new Date(date);
  }

  return new Date(date);
}

function padDatePart(value: number) {
  return String(value).padStart(2, "0");
}

export function toDateKey(date: DateInput = new Date()) {
  const target = toDate(date);
  const year = target.getFullYear();
  const month = padDatePart(target.getMonth() + 1);
  const day = padDatePart(target.getDate());

  return `${year}-${month}-${day}`;
}

export function getTodayDate() {
  return toDateKey(new Date());
}

export function getTodayText() {
  return formatDate(new Date(), ".");
}

export function formatDate(date: DateInput, separator = ".") {
  return toDateKey(date).replaceAll("-", separator);
}

export function isToday(date: DateInput) {
  return toDateKey(date) === getTodayDate();
}

export function formatDiaryDate(dateStr: string): string {
  const d = new Date(dateStr);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${days[d.getDay()]}`;
}

export function formatDiaryDateShort(dateStr: string): string {
  const d = new Date(dateStr);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
}

export function getWeekRange(date: DateInput = new Date()): WeekRange {
  const target = toDate(date);
  const day = target.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const start = new Date(target);
  start.setDate(target.getDate() + mondayOffset);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return {
    startDate: toDateKey(start),
    endDate: toDateKey(end),
  };
}

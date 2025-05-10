// Функция преобразования номера пары во время с учетом субботы
export function convertNumberToTime(number) {
  if (!number) return '';
  const isSaturday = number > 10;
  const normalizedNumber = isSaturday ? number - 10 : number;
  
  const timeMap = {
    1: '08:00<br>09:30',
    2: '09:45<br>11:15',
    3: '11:30<br>13:00',
    4: isSaturday ? '13:15<br>14:45' : '13:50<br>15:20',
    5: isSaturday ? '15:00<br>16:30' : '15:35<br>17:05',
    6: isSaturday ? '16:45<br>18:15' : '17:20<br>18:50'
  };
  
  return timeMap[normalizedNumber] || '';
}

// Единая функция преобразования времени в номер пары (объединенная версия)
export function getNumberFromTime(time, isSaturday = false) {
  if (!time) return 0;
  const timeMap = {
    '08:00<br>09:30': isSaturday ? 11 : 1,
    '09:45<br>11:15': isSaturday ? 12 : 2,
    '11:30<br>13:00': isSaturday ? 13 : 3,
    '13:50<br>15:20': 4,
    '15:35<br>17:05': 5,
    '17:20<br>18:50': 6,
    '13:15<br>14:45': 14,
    '15:00<br>16:30': 15,
    '16:45<br>18:15': 16
  };
  
  return timeMap[time] || 0;
}

// Функция преобразования номера недели и дня в дату
export function convertToDate(weekNumber, dayNumber) {
  const today = new Date();
  const currentWeek = getAcademicWeekNumber(today);
  
  // Вычисляем разницу в неделях
  const weekDiff = weekNumber - currentWeek;
  
  // Находим понедельник текущей недели
  const monday = new Date(today);
  monday.setDate(today.getDate() - (today.getDay() + 6) % 7);
  
  // Целевая дата
  const targetDate = new Date(monday);
  targetDate.setDate(monday.getDate() + (weekDiff * 7) + (dayNumber - 1));
  
  return targetDate.toISOString().split('T')[0];
}

function getAcademicWeekNumber(date = new Date()) {
  const startOfYear = new Date(2024, 8, 1); // 8 = сентябрь
  
  if (date < startOfYear) {
    startOfYear.setFullYear(startOfYear.getFullYear() - 1);
  }

  const diffTime = date - startOfYear;
  const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
  return ((diffWeeks + 1) % 2) + 1;
}
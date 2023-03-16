import moment from 'moment';

export const calculateWorkDate =  (month: number, year: number) => {
  let weekdayCount = 0;
  const startDate = moment().set({
    date: 1,
    month: month,
  });
  const getdate = moment({ year: year, month: month, day: 1 }).endOf('month');
  const  endOfMonth = getdate.endOf('month')
  const  lastDayOfMonth = endOfMonth.date(); 
  const endDate = moment().set({
    date: lastDayOfMonth as any, 
    month: month,
  });
  console.log(startDate)
  console.log(endDate)
  while (startDate.isSameOrBefore(endDate)) {
    // Check if the current day is a weekday (i.e., not Sunday)
    if (startDate.weekday() !== 0) {
      weekdayCount++;
    }

    // Move to the next day
    startDate.add(1, 'day');
  }
  return weekdayCount;
};

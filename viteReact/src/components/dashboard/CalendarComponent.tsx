import React, { useState, useEffect, useCallback } from 'react';
import { Paper } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { DayCalendarSkeleton } from '@mui/x-date-pickers/DayCalendarSkeleton';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import { useSelector } from 'react-redux';
import { selectVisits } from '../../features/calendar/calendarSlice';
import { Visit } from '../../models/dataModels';
import ServerDay  from './ServerDay';  // Import the ServerDay component
import { ServerDayProps } from '../../models/propsModels';



const CalendarComponent: React.FC = () => {
  const visits = useSelector(selectVisits);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedDays, setHighlightedDays] = useState<number[]>([]);
  const [currentMonth, setCurrentMonth] = useState<Dayjs>(dayjs());

  const updateHighlightedDays = useCallback((month: Dayjs) => {
    const days = visits
      .filter((visit: Visit) => visit && visit.date && dayjs(visit.date).isSame(month, 'month'))
      .map((visit: Visit) => dayjs(visit.date).date());
    setHighlightedDays(days);
  }, [visits]);

  useEffect(() => {
    updateHighlightedDays(currentMonth);
  }, [currentMonth, updateHighlightedDays]);

  const handleMonthChange = (date: Dayjs) => {
    setIsLoading(true);
    setCurrentMonth(date);

    // Simulate an async request to fetch data for the new month
    setTimeout(() => {
      updateHighlightedDays(date);
      setIsLoading(false);
    }, 500);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: '12px',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #f3e5f5 30%, #e1bee7 100%)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundImage: `url('/funky-lines.png')`,
          backgroundSize: 'cover',
          opacity: 0.1,
          zIndex: 0,
        },
      }}
    >
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateCalendar
          loading={isLoading}
          onMonthChange={handleMonthChange}
          renderLoading={() => <DayCalendarSkeleton />}
          slots={{
            day: ServerDay,
          }}
          slotProps={{
            day: {
              highlightedDays,
            } as ServerDayProps,
          }}

          fixedWeekNumber={6}
          displayWeekNumber
        />
      </LocalizationProvider>
    </Paper>
  );
};

export default CalendarComponent;
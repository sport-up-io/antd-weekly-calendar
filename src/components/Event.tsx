import { differenceInMinutes, getDay, setDay } from 'date-fns';
import React from 'react';

import { EventBlockProps, GenericEvent } from './types';
import { sizeEventBox } from './utils';

const BOX_POSITION_OFFSET = 26;
const TURQUOISE = '#36CFC9';

export const EventBlock = <T extends GenericEvent>({
  event,
  index,
  hour,
  events,
  onEventClick,
}: EventBlockProps<T>) => {
  const getEventDay = getDay(new Date(event.endTime));
  const fitHourToDate = setDay(hour, getEventDay);

  const boxStyle = sizeEventBox(event, fitHourToDate);
  const boxLeftPosition = BOX_POSITION_OFFSET * index;

  return (
    <div
      style={{
        display:
          differenceInMinutes(new Date(event.endTime), fitHourToDate) === 0
            ? 'none'
            : 'block',
        height: boxStyle.boxSize + '%',
        width: 80 / events + '%',
        position: 'absolute',
        top: boxStyle.boxPosition + '%',
        overflow: 'hidden',
        cursor: 'pointer',
        left: boxLeftPosition + '%',
        borderWidth: '0.01rem',
        borderRadius: '5px',
        backgroundColor: event.backgroundColor
          ? event.backgroundColor
          : TURQUOISE,
        zIndex: 1,
      }}
      onClick={onEventClick ? () => onEventClick(event) : undefined}
      key={index}
    >
      <p style={{ color: 'white', fontSize: '12px', paddingLeft: '5px' }}>
        {event.title}
      </p>
    </div>
  );
};

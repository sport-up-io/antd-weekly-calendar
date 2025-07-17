import { differenceInMinutes, getDay, setDay } from 'date-fns';
import React, { useEffect, useRef, useState } from 'react';

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
  const [isClicked, setIsClicked] = useState(false);
  const eventRef = useRef<HTMLDivElement>(null);

  const getEventDay = getDay(new Date(event.endTime));
  const fitHourToDate = setDay(hour, getEventDay);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        eventRef.current &&
        !eventRef.current.contains(event.target as Node)
      ) {
        setIsClicked(false);
      }
    };

    if (isClicked) {
      document.addEventListener('mousedown', handleClickOutside);
    }
  }, [isClicked]);

  const boxStyle = sizeEventBox(event, fitHourToDate);
  // Calculate left position to avoid spacing between events (up to 4 events)
  const boxLeftPosition =
    events >= 4 ? (93 / events) * index : BOX_POSITION_OFFSET * index;

  // Calculate original width and new left position when expanded
  const originalWidth = 93 - boxLeftPosition;
  const expandedWidth = 93;
  const newLeftPosition = isClicked
    ? boxLeftPosition - (expandedWidth - originalWidth)
    : boxLeftPosition;

  const handleClick = () => {
    if (isClicked) {
      if (onEventClick) {
        onEventClick(event);
      }
    } else {
      setIsClicked(true);
    }
  };

  return (
    <>
      <div
        ref={eventRef}
        style={{
          display:
            differenceInMinutes(new Date(event.endTime), fitHourToDate) === 0
              ? 'none'
              : 'block',
          height: boxStyle.boxSize + '%',
          width: isClicked ? expandedWidth + '%' : originalWidth + '%',
          position: 'absolute',
          top: boxStyle.boxPosition + '%',
          overflow: 'hidden',
          cursor: 'pointer',
          left: newLeftPosition + '%',
          borderWidth: '0.01rem',
          borderStyle: 'solid',
          borderColor: 'var(--lt-color-background-default, #141414)',
          borderRadius: '5px',
          backgroundColor: event.backgroundColor
            ? event.backgroundColor
            : TURQUOISE,
          zIndex: isClicked ? 2 : 1,
          transition: 'all 0.3s ease',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
        }}
        onClick={handleClick}
        onContextMenu={(e) => e.preventDefault()}
        key={index}
      >
        <p style={{ color: 'white', fontSize: '12px', paddingLeft: '5px' }}>
          {event.title}
        </p>
      </div>
    </>
  );
};

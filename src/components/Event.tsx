import { add, getDay } from 'date-fns';
import { useRef } from 'react';
import type { CSSProperties, MouseEvent } from 'react';

import { createLocaleFormatter } from './localeConfig';
import type { GenericEvent } from './types';
import { useEventExpansion } from './useEventExpansion';
import { getEventBoxLayout, sizeEventBox } from './utils';

const DEFAULT_BACKGROUND_COLOR = '#36CFC9';
const SMALL_EVENT_MAX_SIZE = 30;
const TIME_FORMAT = 'HH:mm';

// Réinitialise le style natif du bouton : contenu en haut à gauche, sans marge.
const BOX_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'stretch',
  padding: 0,
  margin: 0,
  font: 'inherit',
  textAlign: 'left',
  position: 'absolute',
  overflow: 'hidden',
  cursor: 'pointer',
  borderWidth: '0.01rem',
  borderStyle: 'solid',
  borderColor: '#141414',
  borderRadius: '5px',
  transition: 'all 0.3s ease',
  userSelect: 'none',
  WebkitUserSelect: 'none',
  MozUserSelect: 'none',
  msUserSelect: 'none',
};

const CONTENT_STYLE: CSSProperties = {
  display: 'block',
  color: 'white',
  fontSize: '12px',
  paddingLeft: '5px',
  paddingTop: '4px',
};

const SMALL_CONTENT_STYLE: CSSProperties = {
  color: 'white',
  fontSize: '12px',
  paddingLeft: '0',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'row',
  margin: 0,
  lineHeight: '0.9',
};

const TITLE_STYLE: CSSProperties = { fontWeight: 500 };

export interface EventBlockProps<T extends GenericEvent> {
  event: T;
  index: number;
  /** Heure de la ligne, rapportée au premier jour de la semaine. */
  hour: Date;
  /** Nombre d'évènements dans la même cellule. */
  events: number;
  onEventClick?: (event: T) => void;
  usaCalendar?: boolean;
}

const preventContextMenu = (event: MouseEvent) => event.preventDefault();

/**
 * Évènement placé dans sa cellule horaire. Quand la cellule en contient
 * plusieurs, un premier clic le déplie et le second appelle `onEventClick`.
 */
export const EventBlock = <T extends GenericEvent>({
  event,
  index,
  hour,
  events,
  onEventClick,
  usaCalendar = false,
}: Readonly<EventBlockProps<T>>) => {
  const eventRef = useRef<HTMLButtonElement>(null);
  const { isExpanded, expand } = useEventExpansion(eventRef);
  const locale = createLocaleFormatter(usaCalendar);

  const eventHour = add(hour, {
    days: locale.getDateOffset(getDay(new Date(event.endTime))),
  });
  const { boxPosition, boxSize } = sizeEventBox(event, eventHour);
  const { left, width } = getEventBoxLayout({
    index,
    eventCount: events,
    isExpanded,
  });

  const handleClick = () => {
    if (isExpanded || events === 1) {
      onEventClick?.(event);
      return;
    }
    expand();
  };

  return (
    <button
      ref={eventRef}
      type="button"
      style={{
        ...BOX_STYLE,
        height: `${boxSize}%`,
        width: `${width}%`,
        top: `${boxPosition}%`,
        left: `${left}%`,
        backgroundColor: event.backgroundColor || DEFAULT_BACKGROUND_COLOR,
        zIndex: isExpanded ? 2 : 1,
      }}
      onClick={handleClick}
      onContextMenu={preventContextMenu}
    >
      <span
        style={
          boxSize <= SMALL_EVENT_MAX_SIZE ? SMALL_CONTENT_STYLE : CONTENT_STYLE
        }
      >
        <span style={TITLE_STYLE}>{event.title}</span>
        <br />
        {locale.formatDate(
          new Date(event.originalStartTime ?? event.startTime),
          TIME_FORMAT
        )}
        {' - '}
        {locale.formatDate(
          new Date(event.originalEndTime ?? event.endTime),
          TIME_FORMAT
        )}
      </span>
    </button>
  );
};

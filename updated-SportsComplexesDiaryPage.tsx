'use client';

import {useOne} from '@refinedev/core';
import {WeeklyCalendar, FilterSelect, FilterOption} from '@sportup/antd-weekly-calendar';
import {ModelTypes} from '@swagger/generated/hasura/zeus';
import {getRandomColorFromString} from '@utils/get-random-color';
import {useParams} from 'next/navigation';
import {FunctionComponent, useState, useMemo, useEffect} from 'react';
import GameModal from '../../games/game-modal';

interface SportsComplexesDiaryPageProps {}

const SportsComplexesDiaryPage: FunctionComponent<SportsComplexesDiaryPageProps> = () => {
	const {sportsComplexId} = useParams();
	const [selectedEventId, setSelectedEventId] = useState<string>();
	const [selectedPlaygroundIds, setSelectedPlaygroundIds] = useState<(string | number)[]>([]);
	const [hasInitialized, setHasInitialized] = useState(false);

	const {data, isLoading} = useOne<ModelTypes['sportsComplexes']>({
		resource: 'sportsComplexes',
		id: sportsComplexId as string,
		liveMode: 'auto',
		meta: {
			fields: [
				'id',
				'isOpenMonday',
				'isOpenTuesday',
				'isOpenWednesday',
				'isOpenThursday',
				'isOpenFriday',
				'isOpenSaturday',
				'isOpenSunday',
				{
					timeSlots: [
						'id',
						'startAt',
						'endAt',
						{game: ['id']},
						{playground: ['id', 'name']},
					],
				},
				{
					sportsComplexClosedDays: ['id', 'date'],
				},
			],
		},
	});

	const sportsComplex = data?.data;

	const events = useMemo(() => {
		if (sportsComplex?.timeSlots) {
			return sportsComplex.timeSlots
				.filter((timeSlot) => timeSlot.game)
				.map((timeSlot) => ({
					eventId: timeSlot.game!.id,
					startTime: timeSlot.startAt,
					endTime: timeSlot.endAt,
					title: timeSlot.playground.name,
					backgroundColor: getRandomColorFromString(timeSlot.playground.id),
					playgroundId: timeSlot.playground.id, // Add this for filtering
				}));
		}
		return [];
	}, [sportsComplex?.timeSlots]);

	// Generate playground filter options
	const playgroundOptions: FilterOption[] = useMemo(() => {
		if (!sportsComplex?.timeSlots) return [];
		
		const uniquePlaygrounds = new Map();
		sportsComplex.timeSlots.forEach((timeSlot) => {
			if (timeSlot.playground && !uniquePlaygrounds.has(timeSlot.playground.id)) {
				uniquePlaygrounds.set(timeSlot.playground.id, {
					label: timeSlot.playground.name,
					value: timeSlot.playground.id,
					desc: `Playground: ${timeSlot.playground.name}`,
					emoji: '🏟️',
				});
			}
		});
		
		return Array.from(uniquePlaygrounds.values());
	}, [sportsComplex?.timeSlots]);

	// Initialize with first playground only once when data loads
	useEffect(() => {
		if (playgroundOptions.length > 0 && !hasInitialized) {
			setSelectedPlaygroundIds([playgroundOptions[0].value]);
			setHasInitialized(true);
		}
	}, [playgroundOptions, hasInitialized]);

	// Filter events by selected playground IDs
	const filteredEventIds = useMemo(() => {
		if (selectedPlaygroundIds.length === 0) {
			return []; // Show all events when no filter is selected
		}
		
		return events
			.filter((event) => selectedPlaygroundIds.includes(event.playgroundId))
			.map((event) => event.eventId);
	}, [events, selectedPlaygroundIds]);

	const handlePlaygroundFilterChange = (values: (string | number)[]) => {
		setSelectedPlaygroundIds(values);
	};

	const playgroundFilter = (
		<FilterSelect
			options={playgroundOptions}
			selectedValues={selectedPlaygroundIds}
			onChange={handlePlaygroundFilterChange}
			placeholder="Filter by playground"
			style={{ width: '250px' }}
		/>
	);

	return (
		<>
			<GameModal
				close={() => setSelectedEventId(undefined)}
				visible={!!selectedEventId}
				gameId={selectedEventId}
			/>

			<WeeklyCalendar
				onEventClick={(e) => {
					setSelectedEventId(e.eventId);
				}}
				events={events}
				filteredEventIds={filteredEventIds}
				filterComponent={playgroundFilter}
				weekends={true}
				headerSticky={true}
			/>
		</>
	);
};

export default SportsComplexesDiaryPage;
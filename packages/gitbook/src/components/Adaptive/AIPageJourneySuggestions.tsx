'use client';
import { tcls } from '@/lib/tailwind';
import { Icon, type IconName } from '@gitbook/icons';
import { JOURNEY_COUNT, type Journey, useAdaptiveContext } from './AdaptiveContext';

export function AIPageJourneySuggestions() {
    const { journeys, selectedJourney, setSelectedJourney, open } = useAdaptiveContext();

    return (
        open && (
            <div className="animate-fadeIn">
                <div className="mb-2 flex flex-row items-center gap-1 font-semibold text-tint text-xs uppercase tracking-wide">
                    More to explore
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {Object.assign(Array.from({ length: JOURNEY_COUNT }), journeys).map(
                        (journey: Journey | undefined, index) => {
                            const isSelected =
                                journey?.label && journey.label === selectedJourney?.label;
                            const isLoading = !journey || journey?.label === undefined;
                            return (
                                <button
                                    type="button"
                                    key={index}
                                    disabled={journey?.label === undefined}
                                    className={tcls(
                                        'flex flex-col items-center justify-center gap-2 rounded bg-tint px-2 py-4 text-center ring-1 ring-tint-subtle ring-inset transition-all',
                                        isLoading
                                            ? 'h-24 scale-90 animate-pulse'
                                            : 'hover:bg-tint-hover hover:text-tint-strong hover:ring-tint active:scale-95',
                                        isSelected &&
                                            'bg-primary-active text-primary-strong ring-2 ring-primary hover:bg-primary-active hover:ring-primary'
                                    )}
                                    style={{
                                        animationDelay: `${index * 0.2}s`,
                                    }}
                                    onClick={() =>
                                        setSelectedJourney(isSelected ? undefined : journey)
                                    }
                                >
                                    {journey?.icon ? (
                                        <Icon
                                            icon={journey.icon as IconName}
                                            className="size-4 animate-fadeIn text-tint-subtle [animation-delay:300ms]"
                                        />
                                    ) : null}
                                    {journey?.label ? (
                                        <span className="animate-fadeIn leading-tight [animation-delay:400ms]">
                                            {journey.label}
                                        </span>
                                    ) : null}
                                </button>
                            );
                        }
                    )}
                </div>
            </div>
        )
    );
}

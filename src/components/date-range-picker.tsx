'use client';

import * as React from 'react';

import { DateRange, SelectRangeEventHandler } from 'react-day-picker';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from '@radix-ui/react-icons';
import { classNames } from '@/utils/class-names';

interface DateRangePickerProps {
    id: string;
    className?: string;
    dateRange?: DateRange;
    setDateRange: SelectRangeEventHandler;
}

export function DateRangePicker({
    id,
    className,
    dateRange,
    setDateRange,
}: DateRangePickerProps) {
    const formatDate = (date?: Date) =>
        date?.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });

    return (
        <div className={classNames('grid gap-2', className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id={id}
                        variant="outline"
                        className={classNames(
                            'w-full justify-start text-left font-normal',
                            !dateRange && 'text-muted-foreground'
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from
                            ? formatDate(dateRange.from)
                            : 'Pick a date'}
                        {dateRange?.to && ` - ${formatDate(dateRange.to)}`}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                        disabled={(day) => day > new Date()}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}

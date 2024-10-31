'use client';

import { AgeGroup, FeatureUsage, Gender } from '@prisma/client';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Filter, Loader2, Share2 } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from './date-range-picker';
import { Label } from './ui/label';
import { ResetIcon } from '@radix-ui/react-icons';
import { Skeleton } from './ui/skeleton';
import { classNames } from '@/utils/class-names';
import { parseISODate } from '@/utils/parse-iso-date';
import { toast } from '@/hooks/use-toast';
import { useCookies } from '@/hooks/use-cookies';
import { useFetch } from '@/hooks/use-fetch';
import { useLocalStorage } from '@/hooks/use-local-storage';

interface FilterFormProps {
    loading?: boolean;
    onAnalyticsDataChange: Dispatch<
        SetStateAction<{ data: FeatureUsage[]; loading: boolean }>
    >;
    className?: string;
}

interface FilterFormState {
    ageGroup: AgeGroup | 'ALL';
    dateRange: DateRange | undefined;
    gender: Gender | 'ALL';
}

interface QueryParams extends Record<string, string | undefined> {
    age_group?: AgeGroup;
    gender?: Gender;
    date_from?: string;
    date_to?: string;
}

const defaultFilterFormState: FilterFormState = {
    ageGroup: 'ALL',
    gender: 'ALL',
    dateRange: {
        from: parseISODate('2022-10-04') ?? undefined,
        to: parseISODate('2022-10-05') ?? undefined,
    },
};
const COOKIE_NAME = 'filter-preferences';

export function FilterForm({
    loading,
    onAnalyticsDataChange,
    className,
}: FilterFormProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [authToken] = useLocalStorage<string>('auth-token', '');

    const [analyticsQueryState, executeAnalyticsQuery] = useFetch<
        FeatureUsage[],
        QueryParams
    >('/api/analytics');

    const [preferencesCookie, setPreferencesCookie] = useCookies<QueryParams>(
        COOKIE_NAME,
        getDefaultCookieValues()
    );
    const [filterFormState, setFilterFormState] = useState<FilterFormState>(
        getInitialFilterState
    );

    useEffect(() => {
        if (analyticsQueryState.error) {
            toast({
                title: 'An error occurred',
                description: analyticsQueryState.error,
                variant: 'destructive',
            });
        } else {
            if (analyticsQueryState.data) {
                toast({
                    title: 'Analytics data loaded',
                    description: analyticsQueryState.message,
                });
            }
            onAnalyticsDataChange({
                loading: analyticsQueryState.loading,
                data: analyticsQueryState.data ?? [],
            });
        }
    }, [analyticsQueryState, onAnalyticsDataChange]);

    function getInitialFilterState(): FilterFormState {
        const ageGroup =
            (searchParams.get('age_group') as AgeGroup) ||
            preferencesCookie.age_group ||
            defaultFilterFormState.ageGroup;
        const gender =
            (searchParams.get('gender') as Gender) ||
            preferencesCookie.gender ||
            defaultFilterFormState.gender;
        const dateRange = {
            from:
                parseISODate(
                    searchParams.get('date_from') ??
                        preferencesCookie.date_from ??
                        ''
                ) || defaultFilterFormState.dateRange?.from,
            to:
                parseISODate(
                    searchParams.get('date_to') ??
                        preferencesCookie.date_to ??
                        ''
                ) || defaultFilterFormState.dateRange?.to,
        };

        return { ageGroup, gender, dateRange };
    }

    function getDefaultCookieValues() {
        return {
            age_group:
                (searchParams.get('age_group') as AgeGroup) ||
                defaultFilterFormState.ageGroup,
            gender:
                (searchParams.get('gender') as Gender) ||
                defaultFilterFormState.gender,
            date_from:
                searchParams.get('date_from') ||
                defaultFilterFormState.dateRange?.from?.toLocaleDateString(
                    'en-CA'
                ),
            date_to:
                searchParams.get('date_to') ||
                defaultFilterFormState.dateRange?.to?.toLocaleDateString(
                    'en-CA'
                ),
        };
    }

    function handleValueChange<T extends keyof FilterFormState>(
        key: T,
        value: FilterFormState[T]
    ) {
        setFilterFormState((prevState) => ({ ...prevState, [key]: value }));
    }

    function handleApplyFilters() {
        const queryParams = getQueryParams(filterFormState);

        updateURL(queryParams);

        setPreferencesCookie(COOKIE_NAME, queryParams, 7, {
            path: '/',
            sameSite: 'Strict',
        });

        executeAnalyticsQuery({
            headers: { Authorization: `Bearer ${authToken}` },
            queryParams: { ...queryParams },
        });
    }

    function getQueryParams(formState: FilterFormState): QueryParams {
        return {
            age_group:
                formState.ageGroup !== 'ALL' ? formState.ageGroup : undefined,
            gender: formState.gender !== 'ALL' ? formState.gender : undefined,
            date_from: formState.dateRange?.from?.toLocaleDateString('en-CA'),
            date_to:
                formState.dateRange?.to?.toLocaleDateString('en-CA') ||
                formState.dateRange?.from?.toLocaleDateString('en-CA'),
        };
    }
    function handleResetFilters() {
        const resetFilters = {
            ...defaultFilterFormState,
            dateRange: undefined,
        };
        setFilterFormState(resetFilters);

        const queryParams = getQueryParams(resetFilters);

        updateURL(queryParams);

        setPreferencesCookie(COOKIE_NAME, queryParams, 7, {
            path: '/',
            sameSite: 'Strict',
        });

        toast({
            title: 'Filters reset',
            description: 'All filters have been reset to default values.',
        });
    }

    function updateURL(params: Record<string, string | undefined>) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(
            ([key, value]) => value && searchParams.append(key, String(value))
        );
        router.push(`?${searchParams.toString()}`, { scroll: false });
    }

    async function handleShareDashboard() {
        try {
            await navigator.clipboard.writeText(window.location.href);
            toast({
                title: 'Dashboard URL copied',
                description:
                    'The dashboard URL has been copied to your clipboard.',
            });
        } catch {
            toast({
                title: 'Failed to copy URL',
                description: 'Please try copying the URL manually.',
                variant: 'destructive',
            });
        }
    }

    return (
        <form
            aria-label="Filter form"
            onSubmit={(e) => e.preventDefault()}
            className={classNames('space-y-4 max-w-screen-2xl', className)}
        >
            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                    <CardDescription>
                        Filter analytics data by age, gender, and date range
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <FilterFields
                            loading={loading}
                            filterFormState={filterFormState}
                            handleValueChange={handleValueChange}
                        />
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                        <ActionButtons
                            loading={loading}
                            queryLoading={analyticsQueryState.loading}
                            onApply={handleApplyFilters}
                            onReset={handleResetFilters}
                            onShare={handleShareDashboard}
                        />
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}

function FilterSelectSkeleton({ label }: { label: string }) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium">{label}</label>
            <Skeleton className="h-10 w-full" />
        </div>
    );
}

function FilterSelect({
    label,
    value,
    onChange,
    options,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
}) {
    return (
        <div className="space-y-2">
            <Label htmlFor={`select-${label.toLowerCase()}`}>{label}</Label>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger id={`select-${label.toLowerCase()}`}>
                    <SelectValue
                        placeholder={`Select ${label.toLowerCase()}`}
                    />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}

function FilterFields({
    loading,
    filterFormState,
    handleValueChange,
}: {
    loading?: boolean;
    filterFormState: FilterFormState;
    handleValueChange: <T extends keyof FilterFormState>(
        key: T,
        value: FilterFormState[T]
    ) => void;
}) {
    if (loading) {
        return (
            <>
                <FilterSelectSkeleton label="Age Group" />
                <FilterSelectSkeleton label="Gender" />
                <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                    <Label htmlFor="date-range">Date Range</Label>
                    <Skeleton className="h-10 w-full" />
                </div>
            </>
        );
    }

    return (
        <>
            <FilterSelect
                label="Age Group"
                value={filterFormState.ageGroup}
                onChange={(value) =>
                    handleValueChange('ageGroup', value as AgeGroup | 'ALL')
                }
                options={[
                    { value: 'ALL', label: 'All Ages' },
                    { value: AgeGroup.AGE_15_25, label: '15-25' },
                    { value: AgeGroup.OVER_25, label: 'Over 25' },
                ]}
            />
            <FilterSelect
                label="Gender"
                value={filterFormState.gender}
                onChange={(value) =>
                    handleValueChange('gender', value as Gender | 'ALL')
                }
                options={[
                    { value: 'ALL', label: 'All Genders' },
                    { value: Gender.MALE, label: 'Male' },
                    { value: Gender.FEMALE, label: 'Female' },
                ]}
            />
            <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                <Label htmlFor="date-range">Date Range</Label>
                <DateRangePicker
                    id="date-range"
                    dateRange={filterFormState.dateRange}
                    setDateRange={(dateRange) =>
                        handleValueChange('dateRange', dateRange)
                    }
                />
            </div>
        </>
    );
}

function ActionButtons({
    onApply,
    onReset,
    onShare,
    loading,
    queryLoading,
}: {
    onApply: () => void;
    onReset: () => void;
    onShare: () => void;
    loading?: boolean;
    queryLoading: boolean;
}) {
    const isDisabled = loading || queryLoading;

    return (
        <>
            <Button
                onClick={onShare}
                variant="outline"
                className="sm:w-auto w-full"
                aria-label="Share dashboard URL"
                aria-disabled={isDisabled}
                disabled={isDisabled}
            >
                <Share2 className="h-4 w-4" /> Share
            </Button>
            <Button
                onClick={onReset}
                variant="destructive"
                className="sm:w-auto w-full"
                aria-label="Reset filters"
                aria-disabled={isDisabled}
                disabled={isDisabled}
            >
                <ResetIcon className="h-4 w-4" /> Reset
            </Button>
            <Button
                onClick={onApply}
                className="sm:w-auto w-full"
                aria-label="Apply filters"
                aria-disabled={isDisabled}
                disabled={isDisabled}
            >
                {queryLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Filter className="h-4 w-4" />
                )}{' '}
                Apply
            </Button>
        </>
    );
}

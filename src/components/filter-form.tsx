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

import { Button } from '@/components/ui/button';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from './date-range-picker';
import { Label } from './ui/label';
import { ResetIcon } from '@radix-ui/react-icons';
import { Skeleton } from './ui/skeleton';
import { classNames } from '@/utils/class-names';
import { toast } from '@/hooks/use-toast';
import { useFetch } from '@/hooks/use-fetch';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useRouter } from 'next/navigation';

interface FilterFormProps {
    dateRange: DateRange | undefined;
    ageGroup: AgeGroup | 'ALL';
    gender: Gender | 'ALL';
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

interface AnalyticsQueryParams
    extends Record<string, string | number | boolean | undefined> {
    age_group?: AgeGroup;
    gender?: Gender;
    date_from?: string;
    date_to?: string;
}

export function FilterForm({
    ageGroup,
    dateRange,
    gender,
    loading,
    onAnalyticsDataChange,
    className,
}: FilterFormProps) {
    const router = useRouter();
    const [authToken] = useLocalStorage<string>('auth-token', '');
    const [analyticsQueryState, executeAnalyticsQuery] = useFetch<
        FeatureUsage[],
        AnalyticsQueryParams
    >('api/analytics');
    const [filterFormState, setFilterFormState] = useState<FilterFormState>({
        ageGroup,
        dateRange,
        gender,
    });

    useEffect(() => {
        if (analyticsQueryState.error) {
            toast({
                title: 'An error occurred',
                description: analyticsQueryState.error,
                variant: 'destructive',
            });
        } else if (!analyticsQueryState.loading && analyticsQueryState.data) {
            toast({
                title: 'Analytics data loaded',
                description: analyticsQueryState.message,
            });
        }
        onAnalyticsDataChange({
            loading: analyticsQueryState.loading,
            data: analyticsQueryState.data ?? [],
        });
    }, [analyticsQueryState, onAnalyticsDataChange]);

    function prepareQueryParams(
        formState: FilterFormState
    ): AnalyticsQueryParams {
        const { ageGroup, gender, dateRange } = formState;
        return {
            age_group: ageGroup !== 'ALL' ? ageGroup : undefined,
            gender: gender !== 'ALL' ? gender : undefined,
            date_from: dateRange?.from?.toLocaleDateString('en-CA'),
            date_to:
                dateRange?.to?.toLocaleDateString('en-CA') ??
                dateRange?.from?.toLocaleDateString('en-CA'),
        };
    }

    function handleValueChange<T extends keyof FilterFormState>(
        key: T,
        value: FilterFormState[T]
    ) {
        setFilterFormState((prevState) => ({ ...prevState, [key]: value }));
    }

    function handleApplyFilters() {
        const queryParams = prepareQueryParams(filterFormState);
        updateURL(queryParams);
        executeAnalyticsQuery({
            headers: { Authorization: `Bearer ${authToken}` },
            queryParams,
        });
    }

    function handleResetFilters() {
        const resetFilters: FilterFormState = {
            ageGroup: 'ALL',
            dateRange: undefined,
            gender: 'ALL',
        };
        setFilterFormState(resetFilters);
        updateURL(prepareQueryParams(resetFilters));
        toast({
            title: 'Filters reset',
            description: 'All filters have been reset to default values.',
        });
    }

    function updateURL(queryParams: AnalyticsQueryParams) {
        const searchParams = new URLSearchParams();
        Object.entries(queryParams).forEach(
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

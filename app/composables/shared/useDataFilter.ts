import { getNestedValue } from "~/utils/object";

export interface FilterConfig<T> {
  searchFields?: string[]; // Fields to search in (support dot notation)
  filters?: Record<string, (item: T, value: any) => boolean>; // Custom filter functions
}

export interface FilterState {
  search: string;
  filters: Record<string, any>;
  sort: {
    field: string | null;
    direction: "asc" | "desc";
  };
}

/**
 * Generic data filtering engine
 * loose coupling: logic is separated from UI
 * scalable: supports complex nested objects and custom filter logic
 */
export function useDataFilter<T>(
  data: Ref<readonly T[] | T[]>,
  config: FilterConfig<T> = {}
) {
  // State
  const search = ref("");
  const activeFilters = ref<Record<string, any>>({});
  const sort = ref<{ field: string | null; direction: "asc" | "desc" }>({
    field: null,
    direction: "desc",
  });

  // Set filter value (undefined/null removes the filter)
  function setFilter(key: string, value: any) {
    if (value === null || value === undefined || value === "") {
      const newFilters = { ...activeFilters.value };
      delete newFilters[key];
      activeFilters.value = newFilters;
    } else {
      activeFilters.value = {
        ...activeFilters.value,
        [key]: value,
      };
    }
  }

  // Clear all filters
  function clearFilters() {
    search.value = "";
    activeFilters.value = {};
  }

  // Filtered data computed property
  const filteredData = computed(() => {
    let result = [...data.value];

    // 1. Apply Search
    if (search.value && config.searchFields?.length) {
      const query = search.value.toLowerCase();
      result = result.filter((item) => {
        return config.searchFields!.some((field) => {
          const value = getNestedValue(item, field);
          return String(value ?? "")
            .toLowerCase()
            .includes(query);
        });
      });
    }

    // 2. Apply Filters
    Object.entries(activeFilters.value).forEach(([key, value]) => {
      if (value === null || value === undefined) return;

      // Use custom filter function if provided
      const customFilter = config.filters?.[key];
      if (customFilter) {
        result = result.filter((item) => customFilter(item, value));
        return;
      }

      // Default: Exact match (supports nested keys)
      result = result.filter((item) => {
        const itemValue = getNestedValue(item, key);
        return itemValue === value;
      });
    });

    // 3. Apply Sort
    if (sort.value.field) {
      result.sort((a, b) => {
        const aValue = getNestedValue(a, sort.value.field!);
        const bValue = getNestedValue(b, sort.value.field!);

        if (aValue === bValue) return 0;

        const comparison = aValue > bValue ? 1 : -1;
        return sort.value.direction === "asc" ? comparison : -comparison;
      });
    }

    return result;
  });

  return {
    // State
    search,
    filters: activeFilters,
    sort,

    // Output
    filteredData,

    // Actions
    setFilter,
    clearFilters,
  };
}

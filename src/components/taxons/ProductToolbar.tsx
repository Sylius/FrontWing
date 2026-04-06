import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconSearch, IconX } from "@tabler/icons-react";
import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";

const sortOptions = [
  { label: "By position", value: "" },
  { label: "From A to Z", value: "order[translation.name]=asc" },
  { label: "From Z to A", value: "order[translation.name]=desc" },
  { label: "Newest first", value: "order[createdAt]=desc" },
  { label: "Oldest first", value: "order[createdAt]=asc" },
  { label: "Cheapest first", value: "order[price]=asc" },
  { label: "Most expensive first", value: "order[price]=desc" },
];

const ProductToolbar: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // 1. Local state only for what the user types (before submission)
  const [searchValue, setSearchValue] = useState(searchParams.get("translations.name") || "");

  // 2. Derive sort value directly from the URL (no useState needed here)
  const sortValue =
    sortOptions.find((opt) => opt.value !== "" && searchParams.toString().includes(opt.value))
      ?.value || "";

  const updateParams = (updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    setSearchParams(newParams);
  };

  const handleSearch = () => {
    updateParams({ "translations.name": searchValue });
  };

  const clearSearch = () => {
    setSearchValue("");
    updateParams({ "translations.name": null });
  };

  const handleSortChange = (selected: string | null) => {
    if (selected === null) return;
    const actualValue = selected === "__empty__" ? "" : selected;
    const newParams = new URLSearchParams(searchParams);

    // Clear previous sort params
    sortOptions.forEach((opt) => {
      if (opt.value) {
        const [key] = opt.value.split("=");
        newParams.delete(key);
      }
    });

    // Apply the new sort param
    if (actualValue) {
      const [key, val] = actualValue.split("=");
      newParams.set(key, val);
    }
    setSearchParams(newParams);
  };

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <div className="flex flex-1 overflow-hidden rounded-md border shadow-xs">
        <InputGroup className="rounded-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0">
          <InputGroupInput
            placeholder="Search..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <InputGroupAddon align="inline-end" className="gap-0 has-[>button]:m-0">
            {searchValue && (
              <InputGroupButton
                size="icon-sm"
                className="cursor-pointer"
                variant="ghost"
                onClick={clearSearch}
              >
                <IconX size={16} />
              </InputGroupButton>
            )}
            <InputGroupButton
              size="icon-sm"
              className="cursor-pointer"
              variant="ghost"
              onClick={handleSearch}
            >
              <IconSearch size={16} />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>

      <div className="ml-auto flex items-center gap-2 pl-4">
        <label className="m-0 text-sm">Sort:</label>
        <Select value={sortValue || "__empty__"} onValueChange={handleSortChange}>
          <SelectTrigger className="w-50">
            <SelectValue>
              {
                sortOptions.find((opt) => (opt.value || "__empty__") === (sortValue || "__empty__"))
                  ?.label
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((opt) => (
              <SelectItem key={opt.label} value={opt.value || "__empty__"}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ProductToolbar;

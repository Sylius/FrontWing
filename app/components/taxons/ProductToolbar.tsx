import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { IconSearch, IconX } from '@tabler/icons-react';

const sortOptions = [
    { label: 'By position', value: '' },
    { label: 'From A to Z', value: 'order[translation.name]=asc' },
    { label: 'From Z to A', value: 'order[translation.name]=desc' },
    { label: 'Newest first', value: 'order[createdAt]=desc' },
    { label: 'Oldest first', value: 'order[createdAt]=asc' },
    { label: 'Cheapest first', value: 'order[price]=asc' },
    { label: 'Most expensive first', value: 'order[price]=desc' },
];

const ProductToolbar: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const [searchValue, setSearchValue] = useState(() => searchParams.get('translations.name') || '');
    const [sortValue, setSortValue] = useState(() => {
        const found = sortOptions.find(opt => searchParams.toString().includes(opt.value));
        return found?.value || '';
    });

    useEffect(() => {
        setSearchValue(searchParams.get('translations.name') || '');
    }, [searchParams]);

    const handleSearch = () => {
        const newParams = new URLSearchParams(searchParams.toString());
        if (searchValue) {
            newParams.set('translations.name', searchValue);
        } else {
            newParams.delete('translations.name');
        }
        setSearchParams(newParams);
    };

    const clearSearch = () => {
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.delete('translations.name');
        setSearchValue('');
        setSearchParams(newParams);
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newParams = new URLSearchParams(searchParams.toString());
        sortOptions.forEach(opt => {
            const key = opt.value.split('=')[0];
            if (key) newParams.delete(key);
        });

        const selected = e.target.value;
        if (selected) {
            const [key, value] = selected.split('=');
            newParams.set(key, value);
        }

        setSortValue(selected);
        setSearchParams(newParams);
    };

    return (
        <div className="d-flex flex-wrap align-items-center gap-2 mb-4">
            <div className="d-flex border rounded overflow-hidden flex-grow-1">
                <input
                    type="text"
                    className="form-control border-0"
                    placeholder="Value"
                    value={searchValue}
                    onChange={e => setSearchValue(e.target.value)}
                />
                <button className="btn btn-outline-secondary border-0 rounded-0" onClick={handleSearch}>
                    <IconSearch size={24} />
                </button>
                <button className="btn btn-outline-secondary border-0 rounded-0" onClick={clearSearch}>
                    <IconX size={24} />
                </button>

            </div>

            <div className="ms-auto d-flex align-items-center gap-2 ps-4">
                <label className="form-label m-0">Sort:</label>
                <select className="form-select" value={sortValue} onChange={handleSortChange}>
                    {sortOptions.map(opt => (
                        <option key={opt.label} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default ProductToolbar;

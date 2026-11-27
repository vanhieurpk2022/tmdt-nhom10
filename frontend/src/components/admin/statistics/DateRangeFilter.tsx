import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays } from '@fortawesome/free-solid-svg-icons';

export type DateRangePreset = 'today' | '7days' | '30days' | '6months' | '1year' | 'all' | 'custom';

export interface DateRangeValue {
    preset: DateRangePreset;
    fromDate: string;
    toDate: string;
}

export const DATE_RANGE_PRESETS: Array<{ key: Exclude<DateRangePreset, 'custom'>; label: string }> = [
    { key: 'today', label: 'Hôm nay' },
    { key: '7days', label: '7 ngày' },
    { key: '30days', label: '30 ngày' },
    { key: '6months', label: '6 tháng' },
    { key: '1year', label: '1 năm' },
    { key: 'all', label: 'Tất cả' },
];

/** Format Date → YYYY-MM-DD theo giờ local cho input[type=date] */
export function toInputDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

/** Parse chuỗi YYYY-MM-DD theo giờ local (tránh lệch múi giờ UTC của new Date("YYYY-MM-DD")) */
export function parseLocalDate(value: string): Date | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
    if (!match) return null;
    const year = Number(match[1]);
    const month = Number(match[2]) - 1;
    const day = Number(match[3]);
    const parsed = new Date(year, month, day);
    if (
        parsed.getFullYear() !== year ||
        parsed.getMonth() !== month ||
        parsed.getDate() !== day
    ) {
        return null;
    }
    return parsed;
}

/** Tạo khoảng [fromDate, toDate] theo preset tính đến hôm nay */
export function resolvePresetRange(preset: Exclude<DateRangePreset, 'custom'>, now = new Date()): DateRangeValue {
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const start = new Date(end);

    switch (preset) {
        case 'today':
            return { preset, fromDate: toInputDate(end), toDate: toInputDate(end) };
        case '7days':
            start.setDate(end.getDate() - 6);
            return { preset, fromDate: toInputDate(start), toDate: toInputDate(end) };
        case '30days':
            start.setDate(end.getDate() - 29);
            return { preset, fromDate: toInputDate(start), toDate: toInputDate(end) };
        case '6months':
            start.setMonth(end.getMonth() - 6);
            start.setDate(start.getDate() + 1);
            return { preset, fromDate: toInputDate(start), toDate: toInputDate(end) };
        case '1year':
            start.setFullYear(end.getFullYear() - 1);
            start.setDate(start.getDate() + 1);
            return { preset, fromDate: toInputDate(start), toDate: toInputDate(end) };
        case 'all':
        default:
            return { preset: 'all', fromDate: '', toDate: '' };
    }
}

export function formatDisplayDate(value: string): string {
    const parsed = parseLocalDate(value);
    if (!parsed) return value;
    const d = String(parsed.getDate()).padStart(2, '0');
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    return `${d}/${m}/${parsed.getFullYear()}`;
}

interface DateRangeFilterProps {
    idPrefix: string;
    value: DateRangeValue;
    onChange: (next: DateRangeValue) => void;
    tone?: 'primary' | 'success';
    isLoading?: boolean;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
    idPrefix,
    value,
    onChange,
    tone = 'primary',
    isLoading = false,
}) => {
    const activeClass = tone === 'success' ? 'btn-success fw-semibold' : 'btn-primary fw-semibold';

    const handleSelectPreset = (preset: Exclude<DateRangePreset, 'custom'>) => {
        onChange(resolvePresetRange(preset));
    };

    const handleEnableCustom = () => {
        if (value.preset === 'custom') return;
        const fallback = resolvePresetRange('30days');
        onChange({
            preset: 'custom',
            fromDate: value.fromDate || fallback.fromDate,
            toDate: value.toDate || fallback.toDate,
        });
    };

    return (
        <div className="d-flex flex-column gap-2 mb-3">
            <div className="d-flex align-items-center flex-wrap gap-1">
                {DATE_RANGE_PRESETS.map((item) => (
                    <button
                        key={item.key}
                        type="button"
                        className={`btn btn-sm px-2 py-1 ${value.preset === item.key ? activeClass : 'btn-outline-secondary'}`}
                        style={{ fontSize: '0.78rem' }}
                        aria-pressed={value.preset === item.key}
                        onClick={() => handleSelectPreset(item.key)}
                    >
                        {item.label}
                    </button>
                ))}
                <button
                    type="button"
                    className={`btn btn-sm px-2 py-1 ${value.preset === 'custom' ? activeClass : 'btn-outline-secondary'}`}
                    style={{ fontSize: '0.78rem' }}
                    aria-pressed={value.preset === 'custom'}
                    onClick={handleEnableCustom}
                >
                    <FontAwesomeIcon icon={faCalendarDays} className="me-1" />
                    Tùy chọn
                </button>
                {isLoading && (
                    <div
                        className={`spinner-border spinner-border-sm ms-1 ${tone === 'success' ? 'text-success' : 'text-primary'}`}
                        role="status"
                    >
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                )}
            </div>

            {value.preset === 'custom' && (
                <div className="d-flex align-items-center flex-wrap gap-2 p-2 bg-light rounded-3 border border-light-subtle">
                    <div className="d-flex align-items-center gap-1">
                        <label htmlFor={`${idPrefix}-from-date`} className="text-muted small mb-0 text-nowrap">
                            Từ:
                        </label>
                        <input
                            id={`${idPrefix}-from-date`}
                            type="date"
                            className="form-control form-control-sm bg-white border-secondary-subtle"
                            style={{ width: 'auto', fontSize: '0.82rem' }}
                            value={value.fromDate}
                            max={value.toDate || undefined}
                            onChange={(e) => onChange({ ...value, preset: 'custom', fromDate: e.target.value })}
                        />
                    </div>
                    <div className="d-flex align-items-center gap-1">
                        <label htmlFor={`${idPrefix}-to-date`} className="text-muted small mb-0 text-nowrap">
                            Đến:
                        </label>
                        <input
                            id={`${idPrefix}-to-date`}
                            type="date"
                            className="form-control form-control-sm bg-white border-secondary-subtle"
                            style={{ width: 'auto', fontSize: '0.82rem' }}
                            value={value.toDate}
                            min={value.fromDate || undefined}
                            onChange={(e) => onChange({ ...value, preset: 'custom', toDate: e.target.value })}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};


// 숫자 포맷팅
export function formatNumber(value, format) {
    if (typeof value !== 'number') value = Number(value) || 0;

    switch (format) {
        case "comma":
            return value.toLocaleString(); // 1,234,567
        case "dot":
            return value.toLocaleString('de-DE'); // 1.234.567
        case "plain":
            return String(value); // 1234567
        default:
            return value.toLocaleString();
    }
}

// 날짜 포맷팅
export function formatDate(dateStr, format) {
    const d = new Date(dateStr);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    switch (format) {
        case "YYYY.MM.DD":
            return `${y}.${m}.${day}`;
        case "YYYY-MM-DD":
            return `${y}-${m}-${day}`;
        case "MM/DD/YYYY":
            return `${m}/${day}/${y}`;
        default:
            return `${y}.${m}.${day}`;
    }
}
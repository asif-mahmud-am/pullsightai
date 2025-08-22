import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(duration);
dayjs.extend(relativeTime);

export const formatDate = (
    dateLike: string | number | Date,
    format = "DD MMM, YYYY"
): string => {
    // console.log(format, dateLike)
    const newDate = new Date(dateLike);
    return dayjs(newDate).format(format);
};

export const humanizeDate = (dateLike: string | number | Date): string => {
    const newDate = new Date(dateLike);
    return dayjs(newDate).fromNow();
};

export const subtractDays = (
    dateLike: string | number | Date,
    days: number
): Date => {
    const newDate = new Date(dateLike);
    newDate.setDate(newDate.getDate() - days);
    return newDate;
};

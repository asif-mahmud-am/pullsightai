import dayjs from 'dayjs'

export const formatDate = (dateLike: string | number | Date, format = 'DD MMM, YYYY'): string => {
    // console.log(format, dateLike)
    const newDate = new Date(dateLike)
    return dayjs(newDate).format(format)
}

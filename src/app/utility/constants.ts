export const MINIMUM_TIME_SLOT = 1000 * 60 * 60


export function getUsedTimes(startDate: number, endDate: number): number[] {
    let usedTimes = []
    const startMonth = new Date(startDate).getMonth()
    const startYear = new Date(startDate).getFullYear()
    const endMonth = new Date(endDate).getMonth()
    const delta = endMonth - startMonth <= 0
        ? endMonth + 12 - startMonth
        : endMonth - startMonth

    for (let i = 0; i < delta; i++) {
        usedTimes.push(new Date(startYear, startMonth + i, 1).getTime())
    }
    return usedTimes
}

export function padLeadingZeros(number: number, size: number): string {
    let s = number.toString()
    while (s.length < size) s = "0" + s
    return s
}

export function isOverlapingTime(approvedStart, approvedEnd, compareStart, compareEnd) {
    // Compare comes before Approved
    if (compareEnd <= approvedStart) return false
    // Approved comes before Compare
    if (approvedEnd <= compareStart) return false
    
    return true
}

export const TIMEFRAMES = [{
    value: 'month',
    label: 'Per Month'
}]

export const LEASETYPES = [{
    id: '3_month',
    label: "3 Month Lease",
    number: 3
},
{
    id: '6_month',
    label: "6 Month Lease",
    number: 6
},
{
    id: '12_month',
    label: "12 Month Lease",
    number: 12
}]

export const MONTHS = {
    0: "January",
    1: "Febuary",
    2: "March",
    3: "April",
    4: "May",
    5: "June",
    6: "July",
    7: "August",
    8: "September",
    9: "October",
    10: "November",
    11: "December",
}

export const BOOKTIMES = []

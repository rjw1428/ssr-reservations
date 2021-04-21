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
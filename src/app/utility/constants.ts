export const MINIMUM_TIME_SLOT = 1000 * 60 * 60


export function getUsedTimes(startTime: number, endTime: number): number[] {
    let usedTimes = []
    let x = startTime
    do {
        usedTimes.push(x)
        x += MINIMUM_TIME_SLOT
    }
    while (x < endTime)
    return usedTimes
}

export function padLeadingZeros(number: number, size: number): string {
    let s = number.toString()
    while (s.length < size) s = "0" + s
    return s
}

export const TIMEFRAMES = [{
    value: 'hour',
    label: 'By The Hour'
},
{
    value: 'day',
    label: 'By The Day'
},
{
    value: 'week',
    label: 'By The Week'
},
{
    value: 'month',
    label: 'By The Month'
}]

export const BOOKTIMES = [{
    value: 32400000,
    label: '9:00 AM'
},
{
    value: 36000000,
    label: '10:00 AM'
},
{
    value: 39600000,
    label: '11:00 AM'
},
{
    value: 43200000,
    label: '12:00 PM'
},
{
    value: 46800000,
    label: '1:00 PM'
},
{
    value: 50400000,
    label: '2:00 PM'
},
{
    value: 54000000,
    label: '3:00 PM'
},
{
    value: 57600000,
    label: '4:00 PM'
},
{
    value: 61200000,
    label: '5:00 PM'
}
]

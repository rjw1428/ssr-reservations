import * as functions from 'firebase-functions';
import { afs, db } from './util';

// RUN AT 10:00am on the 25th of every month
export const paymentReminderFunction = functions.pubsub.schedule('0 10 25 * *').timeZone('America/New_York').onRun(async (context) => {
    const allAcceptedRef = await db.ref('accepted-applications').get()
    const allAccepted = allAcceptedRef.val() as { [userId: string]: { [applicationId: string]: Reservation } }

    if (!allAccepted) return console.log('no applications')
    const now = new Date().getTime()
    const TEN_DAYS = 1000 * 60 * 60 * 24 * 10
    let count = 0
    Object.values(allAccepted).forEach(userLeaseList => {
        Object.keys(userLeaseList)
            .map(key => ({ id: key, ...userLeaseList[key] }))
            .filter(lease => lease.status != 'canceled')
            .forEach(async lease => {
                if (!lease.unpaidTimes) return

                const minTime = Object.keys(lease.unpaidTimes).reduce((min, time) => +time < min ? +time : min, 9999999999000)
                if (minTime > now && minTime < now + TEN_DAYS) {
                    await sendScheduledEmail(lease, minTime, 'scheduledReminder')
                    count++
                }
            })
    })
    console.log(count)
    return count;
});

// RUN AT 10:00am on the 2nd of every month
export const paymentLateFunction = functions.pubsub.schedule('0 10 2 * *').timeZone('America/New_York').onRun(async (context) => {
    const allAcceptedRef = await db.ref('accepted-applications').get()
    const allAccepted = allAcceptedRef.val() as { [userId: string]: { [applicationId: string]: Reservation } }

    if (!allAccepted) return console.log('no applications')
    const now = new Date().getTime()
    const TEN_DAYS = 1000 * 60 * 60 * 24 * 10
    let count = 0
    Object.values(allAccepted).forEach(userLeaseList => {
        return Object.keys(userLeaseList)
            .map(key => ({ id: key, ...userLeaseList[key] }))
            .filter(lease => lease.status != 'canceled')
            .forEach(async lease => {
                if (!lease.unpaidTimes) return

                const minTime = Object.keys(lease.unpaidTimes).reduce((min, time) => +time < min ? +time : min, 9999999999000)
                if (minTime < now && minTime > now - TEN_DAYS) {
                    await sendScheduledEmail(lease, minTime, 'scheduledLate')
                    count++
                }
            })
    })
    console.log(count)
    return count;
});

const sendScheduledEmail = async (lease: Reservation, time: number, template: string) => {
    try {
        // Get User Info
        const userRef = await db.ref(`users/${lease.userId}`).get()
        const user = userRef.val()

        // GET SPACE INFO
        const spaceRef = await db.ref(`/spaces/${lease.productId}/${lease.spaceId}`).get()
        const space = spaceRef.val()

        // Send Email
        return afs.collection('mail').add({
            to: user.email,
            template: {
                name: 'scheduledReminder',
                data: {
                    applicationId: lease.id,
                    username: `${user.firstName} ${user.lastName}`,
                    spacename: space.name,
                    dateDue: new Date(time).toLocaleDateString()
                }
            }
        })
    }
    catch (err) {
        return console.log(err)
    }
}

interface Reservation {
    id?: string;
    userId: string;
    spaceId: string;
    productId: string;
    startDate: number;          //epoch
    endDate: number             //epoch
    createdTime: number;        //epoch
    lastModifiedTime: number;   //epoch
    totalCost: number;
    cost: number;
    status: string;
    feedback?: string;
    user?: User;
    decisionDate?: number;
    isAlreadyBooked?: boolean;
    unpaidTimes?: { [time: string]: string };
}

interface User {
    id?: string;             //uid from firebase
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    businessName: string
    address: string
    position: string
    size: number
    operatingHours: string
    sharedUserCount: number
    role: 'admin' | 'user' | 'master'
    dateCreated: number;        //epoch
    lastLogIn?: number;         //epoch
    stripeCustomerId: string;   //from stripe
    password?: string;
    defaultPaymentSource: string
    revenue: number;
}
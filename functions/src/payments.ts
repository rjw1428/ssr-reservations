import { Stripe } from 'stripe'
import * as functions from 'firebase-functions';
import { afs, db, increment } from './util';

export const stripeSecret = functions.config().stripe.secret
export const stripe = new Stripe(stripeSecret, {
    apiVersion: '2020-08-27',
    typescript: true,
})

export const createStripeCustomer = functions.https.onCall(async (data) => {
    try {
        const userRef = db.ref(`users/${data.id}`)
        const customer = await createCustomer(data)
        await userRef.update({ stripeCustomerId: customer.id })
        return { err: null, resp: { ...data, stripeCustomerId: customer.id } }
    }
    catch (err) {
        return { err, resp: null }
    }
})

export const createStripeSource = functions.https.onCall(async ({ stripeId, token, userId }) => {
    try {
        const cardSource = await stripe.customers.createSource(stripeId, { source: token.id })
        const userCardRef = db.ref(`users/${userId}/paymentSources/${cardSource.id}`)
        userCardRef.set(cardSource)
        return { err: null, resp: cardSource }
    }
    catch (err) {
        return { err, resp: null }
    }
})

export const createStripeCharge = functions.https.onCall(async ({ user, sourceId, amount, reservationId, selectedTime, space }) => {
    try {
        const dueDateStr = new Date(selectedTime).toLocaleDateString("en-US")
        const charge = await stripe.charges.create({
            amount: amount * 100,
            currency: 'usd',
            description: `Burwell Project - ${space.name} - ${dueDateStr}`,
            customer: user.stripeCustomerId,
            statement_descriptor: `Burwell Project`,
            source: sourceId
        })
        console.log("HERE")
        await updateDataBasePaymentInfo(user, amount, reservationId, selectedTime, space)
        await emailUserPaymentConfirmation(user, amount, reservationId, selectedTime, space)
        return { err: null, resp: charge }
    }
    catch (err) {
        return { err, resp: null }
    }
})

const updateDataBasePaymentInfo = (user: any, amount: number, reservationId: string, selectedTime: string, space: { name: string, id: string, productId: string }) => {
    const userRef = db.ref(`users/${user.id}`)
    const timeRef = db.ref(`accepted-applications/${user.id}/${reservationId}/unpaidTimes/${selectedTime}`)
    const spaceRef = db.ref(`spaces/${space.productId}/${space.id}/reserved/${selectedTime}`)

    return Promise.all([
        userRef.update({ revenue: increment(amount) }),
        timeRef.remove(),
        spaceRef.update({ hasPaid: true }),
        // Add email confirmation record
        afs.collection('mail').add({
            to: user.email,
            template: {
                name: 'paymentReceived',
                data: {
                    applicationId: reservationId,
                    username: `${user.firstName} ${user.lastName}`,
                    amount: `$${amount}.00`
                }
            }
        }),
        // Add Transaction to transaction-history
        afs.collection('transactions').add({
            userId: user.id,
            spaceName: space.name,
            reservationId,
            amount,
            dateCreated: new Date().getTime(),
            dateDue: selectedTime
        })
    ])
}


const createCustomer = async (user: any) => {
    const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        description: new Date().toISOString(),
        metadata: { firebaseUID: user.uid }
    })

    return customer
}

const emailUserPaymentConfirmation = async (user: any, amount: number, reservationId: string, selectedTime: string, space: { name: string, id: string, productId: string }) => {
    return await afs.collection('mail').add({
        to: user.email,
        template: {
            name: 'paymentReceived',
            data: {
                applicationId: reservationId,
                username: `${user.firstName} ${user.lastName}`,
                spacename: space.name,
                amount,
                dateCreated: new Date().getTime(),
                dateDue: selectedTime
            }
        }
    })
}
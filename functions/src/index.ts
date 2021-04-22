import * as functions from "firebase-functions";
import { db, afs, stripe, increment } from './config';

export const createStripeCustomer = functions.https.onCall(async (data) => {
    try {
        const userRef = db.ref(`users/${data.id}`)
        const customer = await createCustomer(data)
        userRef.update({ stripeCustomerId: customer.id })
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

export const createStripeCharge = functions.https.onCall(async ({ userId, customerId, sourceId, amount, reservationId, selectedTime, space }) => {
    try {
        const dueDateStr = new Date(selectedTime).toLocaleDateString("en-US")
        const charge = await stripe.charges.create({
            amount: amount * 100,
            currency: 'usd',
            description: `Burwell Project - ${space.name} - ${dueDateStr}`,
            customer: customerId,
            statement_descriptor: `Burwell Project`,
            source: sourceId
        })
        await updateDataBasePaymentInfo(userId, amount, reservationId, selectedTime, space)
        return { err: null, resp: charge }
    }
    catch (err) {
        return { err, resp: null }
    }
})

export const updateDataBasePaymentInfo = (userId: string, amount: number, reservationId: string, selectedTime: string, space: { name: string, id: string, productId: string }) => {
    const userRef = db.ref(`users/${userId}`)
    const timeRef = db.ref(`accepted-applications/${userId}/${reservationId}/unpaidTimes/${selectedTime}`)
    const spaceRef = db.ref(`spaces/${space.productId}/${space.id}/reserved/${selectedTime}`)
    userRef.update({ revenue: increment(amount) })
    timeRef.remove()
    spaceRef.update({ hasPaid: true })

    // Add Transaction to transaction-history
    return afs.collection('transactions').add({ userId, spaceName: space.name, reservationId, amount, dateCreated: new Date().getTime(), dateDue: selectedTime })
}

export const createCustomer = async (user: any) => {
    const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        description: new Date().toISOString(),
        metadata: { firebaseUID: user.uid }
    })

    return customer
}
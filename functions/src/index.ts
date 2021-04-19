import * as functions from "firebase-functions";
import { db, stripe } from './config';

export const createStripeCustomer = functions.https.onCall(async (data) => {
    try {
        const userRef = db.ref(`users/${data.id}`)
        const customer = await createCustomer(data)
        userRef.update({ stripeCustomerId: customer.id })
        return { err: null, resp: customer.id }
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


export const createStripeCharge = functions.https.onCall(async ({ customerId, sourceId, amount }) => {
    try {
        const charge = await stripe.charges.create({
            amount: amount,
            currency: 'usd',
            description: 'Burwell Project',
            customer: customerId,
            statement_descriptor: 'Burwell Project',
            source: sourceId
        })
        return { err: null, resp: charge }
    }
    catch (err) {
        return { err, resp: null }
    }
})

export const createCustomer = async (user: any) => {
    const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        description: new Date().toISOString(),
        metadata: { firebaseUID: user.uid }
    })

    return customer
}
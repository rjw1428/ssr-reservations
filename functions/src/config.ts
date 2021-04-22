import { Stripe } from 'stripe'
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
export const db = admin.database()
export const afs = admin.firestore()
export const increment = admin.database.ServerValue.increment
// const settings = { timestampsInSnapshots: true };
// db.settings(settings)

export const stripeSecret = functions.config().stripe.secret
export const stripe = new Stripe(stripeSecret, {
    apiVersion: '2020-08-27',
    typescript: true,
})


import * as admin from 'firebase-admin';

const appConfig = process.env.FUNCTIONS_EMULATOR
    ? { databaseURL: 'http://localhost:9000/?ns=ssr-reservations-dev-default-rtdb' }
    : undefined
admin.initializeApp(appConfig);
export const db = admin.database()
export const afs = admin.firestore()
export const increment = admin.database.ServerValue.increment

if (process.env.FUNCTIONS_EMULATOR)
    db.useEmulator('localhost', 9000)
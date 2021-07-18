import * as functions from "firebase-functions";
import { db, afs } from "./util";

export const triggerApplicationPendingEmail = functions.database
    .ref('/pending-applications/{userId}/{applicationId}')
    .onCreate(async (snapshot, context) => {
        try {
            const reservation = snapshot.val();
            const userRef = await db.ref(`users/${reservation.userId}`).get()
            const user = userRef.val()
            const spaceRef = await db.ref(`/spaces/${reservation.productId}/${reservation.spaceId}`).get()
            const space = spaceRef.val()
            afs.collection('mail').add({
                to: user.email,
                template: {
                    name: 'applicationSubmitted',
                    data: {
                        applicationId: context.params.applicationId,
                        username: `${user.firstName} ${user.lastName}`,
                        spacename: space.name,
                        startdate: new Date(reservation.startDate).toLocaleDateString(),
                        enddate: new Date(reservation.endDate).toLocaleDateString()
                    }
                }
            })
        }
        catch (err) {
            return err
        }
    })

export const triggerApplicationRejectedEmail = functions.database
    .ref('/rejected-applications/{userId}/{applicationId}')
    .onCreate(async (snapshot, context) => {
        try {
            const reservation = snapshot.val();
            const userRef = await db.ref(`/users/${reservation.userId}`).get()
            const user = userRef.val()
            const spaceRef = await db.ref(`/spaces/${reservation.productId}/${reservation.spaceId}`).get()
            const space = spaceRef.val()
            return afs.collection('mail').add({
                to: user.email,
                template: {
                    name: 'applicationRejected',
                    data: {
                        applicationId: context.params.applicationId,
                        username: `${user.firstName} ${user.lastName}`,
                        feedback: reservation.feedback,
                        spacename: space.name,
                        startdate: new Date(reservation.startDate).toLocaleDateString(),
                        enddate: new Date(reservation.endDate).toLocaleDateString()
                    }
                }
            })
        }
        catch (err) {
            return console.log(err)
        }
    })

export const triggerApplicationAcceptedEmail = functions.database
    .ref('/accepted-applications/{userId}/{applicationId}')
    .onCreate(async (snapshot, context) => {
        try {
            const reservation = snapshot.val()
            const userRef = await db.ref(`/users/${reservation.userId}`).get()
            const user = userRef.val()
            const spaceRef = await db.ref(`/spaces/${reservation.productId}/${reservation.spaceId}`).get()
            const space = spaceRef.val()
            return afs.collection('mail').add({
                to: user.email,
                template: {
                    name: 'applicationApproved',
                    data: {
                        applicationId: context.params.applicationId,
                        username: `${user.firstName} ${user.lastName}`,
                        spaceName: space.name,
                        startDate: new Date(reservation.startDate).toLocaleDateString()
                    }
                }
            })
        }
        catch (err) {
            return console.log(err)
        }
    })

export const triggerApplicationReceivedEmail = functions.database
    .ref('/pending-applications/{userId}/{applicationId}')
    .onCreate(async (snapshot, context) => {
        try {
            const reservation = snapshot.val();
            // GET ALL ADMIN USERS
            const allUsersRef = await db.ref(`users`).get()
            const allUsersList = allUsersRef.val() as { [id: string]: { role: string, email: string, firstName: string, lastName: string } }
            const adminList = Object.values(allUsersList)
                .filter(user => user.role == 'admin')
                .map(user => user.email)
            // GET APPLICATION USER
            const userRef = await db.ref(`users/${context.params.userId}`).get()
            const user = userRef.val()

            // GET SPACE INFO
            const spaceRef = await db.ref(`/spaces/${reservation.productId}/${reservation.spaceId}`).get()
            const space = spaceRef.val()
            // SEND EMAIL
            adminList.forEach(emailAddress => {
                afs.collection('mail').add({
                    to: emailAddress,
                    template: {
                        name: 'applicationReceived',
                        data: {
                            applicationId: context.params.applicationId,
                            username: `${user.firstName} ${user.lastName}`,
                            spacename: space.name,
                            startDate: new Date(reservation.startDate).toLocaleDateString(),
                            endDate: new Date(reservation.endDate).toLocaleDateString()
                        }
                    }
                })
            })
        }
        catch (err) {
            return console.log(err)
        }
    })

export const triggerCaneledLeaseEmail = functions.https.onCall(async (data) => {
        try {
            const lease = data;
            // GET APPLICATION USER
            const userRef = await db.ref(`users/${lease.userId}`).get()
            const user = userRef.val()

            // GET SPACE INFO
            const spaceRef = await db.ref(`/spaces/${lease.productId}/${lease.spaceId}`).get()
            const space = spaceRef.val()
            
            // SEND EMAIL
            return afs.collection('mail').add({
                to: user.email,
                template: {
                    name: 'leaseCanceled',
                    data: {
                        applicationId: lease.id,
                        username: `${user.firstName} ${user.lastName}`,
                        spacename: space.name,
                    }
                }
            })
        }
        catch (err) {
            return console.log(err)
        }
    })
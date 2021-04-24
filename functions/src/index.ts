import * as payments from './payments'
import * as emails from './emails'

exports.createStripeCharge = payments.createStripeCharge
exports.createStripeCustomer = payments.createStripeCustomer
exports.createStripeSource = payments.createStripeSource

exports.triggerApplicationReceivedEmail = emails.triggerApplicationReceivedEmail
exports.triggerApplicationPendingEmail = emails.triggerApplicationPendingEmail
exports.triggerApplicationAcceptedEmail = emails.triggerApplicationAcceptedEmail
exports.triggerApplicationRejectedEmail = emails.triggerApplicationRejectedEmail
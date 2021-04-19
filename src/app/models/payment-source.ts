export interface PaymentSource {
    address_zip: string;
    address_zip_check: string;
    brand: string;
    country: string;
    customer: string;
    cvc_check: string;
    exp_month: number;
    exp_year: number;
    fingerprint: string;
    funding: string;
    id: string;
    last4: string;
}

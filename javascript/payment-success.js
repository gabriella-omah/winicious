/* ==================================================
   WINICIOUS PAYMENT SUCCESS
================================================== */


/* --------------------------------------------------
   PUBLIC SUPABASE CLIENT
-------------------------------------------------- */

const publicSupabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false
        }
    }
);


/* --------------------------------------------------
   CART STORAGE KEY
-------------------------------------------------- */

const CART_KEY = "winicious_cart";


/* ==================================================
   DOM ELEMENTS
================================================== */

const paymentTitle =
    document.getElementById("paymentTitle");

const paymentMessage =
    document.getElementById("paymentMessage");

const paymentDetails =
    document.getElementById("paymentDetails");

const continueShopping =
    document.getElementById("continueShopping");


/* ==================================================
   DISPLAY HELPERS
================================================== */


/* --------------------------------------------------
   Show payment result
-------------------------------------------------- */

function showPaymentResult(
    title,
    message,
    details = "",
    success = false
) {

    if (paymentTitle) {

        paymentTitle.textContent =
            title;
    }


    if (paymentMessage) {

        paymentMessage.textContent =
            message;
    }


    if (paymentDetails) {

        if (details) {

            paymentDetails.textContent =
                details;

            paymentDetails.hidden =
                false;

        } else {

            paymentDetails.hidden =
                true;
        }
    }


    if (continueShopping) {

        continueShopping.hidden =
            false;
    }


    console.log(
        success
            ? "Payment successful."
            : "Payment was not successful."
    );
}


/* ==================================================
   GET FLUTTERWAVE RESPONSE
================================================== */

const params =
    new URLSearchParams(
        window.location.search
    );


const paymentStatus =
    params.get("status");

const transactionId =
    params.get("transaction_id");

const txRef =
    params.get("tx_ref");


console.log({
    paymentStatus,
    transactionId,
    txRef
});


/* ==================================================
   VALIDATE RETURN DATA
================================================== */

if (!transactionId || !txRef) {

    showPaymentResult(
        "Payment Could Not Be Verified",
        "We could not find the Flutterwave transaction information.",
        "Please contact Winicious if you believe you were charged."
    );

} else {


    /* ==================================================
       GET ORDER ID FROM TX REF
    ================================================== */

    const orderId =
        txRef.startsWith("WINICIOUS-")
            ? txRef.replace(
                "WINICIOUS-",
                ""
            )
            : null;


    /* --------------------------------------------------
       Make sure order ID exists
    -------------------------------------------------- */

    if (!orderId) {

        showPaymentResult(
            "Payment Could Not Be Verified",
            "The order reference returned by Flutterwave is invalid.",
            "Please contact Winicious if you believe you were charged."
        );

    } else {


        /* ==================================================
           VERIFY PAYMENT
        ================================================== */

        async function verifyPayment() {

            try {

                console.log(
                    "Sending payment for verification..."
                );


                /* ------------------------------------------
                   Call Supabase Edge Function
                ------------------------------------------ */

                const {
                    data,
                    error
                } =
                    await publicSupabaseClient
                        .functions
                        .invoke(
                            "verify-flutterwave-payment",
                            {
                                body: {

                                    transactionId:
                                        transactionId,

                                    txRef:
                                        txRef,

                                    orderId:
                                        orderId
                                }
                            }
                        );


                /* ------------------------------------------
                   Check Edge Function error
                ------------------------------------------ */

                if (error) {

                    console.error(
                        "Verification function error:",
                        error
                    );


                    throw new Error(
                        "We could not verify your payment."
                    );
                }


                console.log(
                    "Verification response:",
                    data
                );


                /* ==================================================
                   PAYMENT VERIFIED
                ================================================== */

                if (
                    data &&
                    data.success === true &&
                    data.paymentStatus === "paid"
                ) {

                    /* --------------------------------------
                       Clear cart
                    -------------------------------------- */

                    localStorage.removeItem(
                        CART_KEY
                    );


                    /* --------------------------------------
                       Show success
                    -------------------------------------- */

                    showPaymentResult(
                        "Payment Successful!",
                        "Thank you. Your payment has been verified successfully.",
                        `Order ID: ${orderId}`,
                        true
                    );


                    return;
                }


                /* ==================================================
                   PAYMENT FAILED
                ================================================== */

                showPaymentResult(
                    "Payment Not Completed",
                    data?.message ||
                    "Your payment could not be confirmed.",
                    `Order ID: ${orderId}. If you believe you were charged, please contact Winicious.`
                );


            } catch (error) {

                /* ==============================================
                   VERIFICATION ERROR
                ============================================== */

                console.error(
                    "Payment verification error:",
                    error
                );


                showPaymentResult(
                    "Payment Verification Failed",
                    "We could not confirm your payment right now.",
                    `Order ID: ${orderId}. Please contact Winicious if you believe you were charged.`
                );

            }

        }


        /* --------------------------------------------------
           Start verification
        -------------------------------------------------- */

        verifyPayment();

    }

}
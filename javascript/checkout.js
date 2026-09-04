/* ==================================================
   WINICIOUS CHECKOUT
================================================== */


/* --------------------------------------------------
   PUBLIC SUPABASE CLIENT
-------------------------------------------------- */

// This client is used by the public checkout page.
//
// It does NOT keep an admin login session.
// That prevents the checkout page from accidentally
// using an authenticated admin session.
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

// This is the name used to store the shopping cart
// inside the browser's localStorage.
const CART_KEY = "winicious_cart";


/* --------------------------------------------------
   DELIVERY FEE
-------------------------------------------------- */

// Temporary delivery fee.
// Change this later when your delivery pricing
// has been decided.
const DELIVERY_FEE = 0;


/* ==================================================
   HELPER FUNCTIONS
================================================== */


/* --------------------------------------------------
   Load cart from localStorage
-------------------------------------------------- */

function loadCheckoutCart() {

    try {

        const savedCart =
            localStorage.getItem(CART_KEY);


        // No saved cart
        if (!savedCart) {
            return [];
        }


        // Convert stored JSON text back into JavaScript
        const cart = JSON.parse(savedCart);


        // Make sure the result is actually an array
        return Array.isArray(cart)
            ? cart
            : [];

    } catch (error) {

        console.error(
            "Could not load cart:",
            error
        );

        return [];
    }
}


/* --------------------------------------------------
   Format money as Nigerian Naira
-------------------------------------------------- */

function formatNaira(amount) {

    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0
    }).format(Number(amount) || 0);
}


/* --------------------------------------------------
   Escape HTML
-------------------------------------------------- */

// Prevent product names from being interpreted
// as HTML when inserted into the page.
function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* ==================================================
   CART
================================================== */

const cart =
    loadCheckoutCart();


/* ==================================================
   DOM ELEMENTS
================================================== */

const checkoutItems =
    document.getElementById("checkoutItems");

const checkoutEmpty =
    document.getElementById("checkoutEmpty");

const checkoutTotals =
    document.getElementById("checkoutTotals");

const checkoutSubtotal =
    document.getElementById("checkoutSubtotal");

const checkoutDelivery =
    document.getElementById("checkoutDelivery");

const checkoutTotal =
    document.getElementById("checkoutTotal");

const checkoutForm =
    document.getElementById("checkoutForm");

const checkoutError =
    document.getElementById("checkoutError");

const checkoutSuccess =
    document.getElementById("checkoutSuccess");

const placeOrderButton =
    document.getElementById("placeOrderButton");


/* ==================================================
   PRODUCT LOOKUP
================================================== */


/* --------------------------------------------------
   Find product in products.js
-------------------------------------------------- */

function getCheckoutProduct(productId) {

    return products.find(
        product => product.id === productId
    );
}


/* ==================================================
   COMPLETE CART ITEMS
================================================== */


/* --------------------------------------------------
   Convert cart IDs into full product information
-------------------------------------------------- */

function getCheckoutItems() {

    return cart
        .map(item => {

            const product =
                getCheckoutProduct(item.id);


            // Product no longer exists
            if (!product) {

                console.warn(
                    "Product not found:",
                    item.id
                );

                return null;
            }


            const quantity =
                Number(item.quantity) || 0;


            // Invalid quantity
            if (quantity <= 0) {
                return null;
            }


            // Return the information checkout needs
            return {

                id:
                    product.id,

                name:
                    product.name,

                price:
                    Number(product.price),

                quantity:
                    quantity
            };

        })
        .filter(Boolean);
}


/* ==================================================
   CALCULATE SUBTOTAL
================================================== */

function calculateSubtotal() {

    const items =
        getCheckoutItems();


    return items.reduce(
        (total, item) => {

            return total +
                (item.price * item.quantity);

        },
        0
    );
}


/* ==================================================
   RENDER CHECKOUT CART
================================================== */

function renderCheckoutCart() {

    if (!checkoutItems) {
        return;
    }


    const items =
        getCheckoutItems();


    /* ----------------------------------------------
       EMPTY CART
    ---------------------------------------------- */

    if (!items.length) {

        checkoutItems.innerHTML = "";


        if (checkoutEmpty) {
            checkoutEmpty.hidden = false;
        }


        if (checkoutTotals) {
            checkoutTotals.hidden = true;
        }


        return;
    }


    /* ----------------------------------------------
       CART HAS PRODUCTS
    ---------------------------------------------- */

    if (checkoutEmpty) {
        checkoutEmpty.hidden = true;
    }


    if (checkoutTotals) {
        checkoutTotals.hidden = false;
    }


    /* ----------------------------------------------
       Render products
    ---------------------------------------------- */

    checkoutItems.innerHTML =
        items.map(item => {

            const total =
                item.price *
                item.quantity;


            return `
                <div class="checkout-item">

                    <div class="checkout-item__details">

                        <p class="checkout-item__name">
                            ${escapeHTML(item.name)}
                        </p>

                        <p class="checkout-item__quantity">
                            Quantity: ${item.quantity}
                        </p>

                    </div>

                    <p class="checkout-item__price">
                        ${formatNaira(total)}
                    </p>

                </div>
            `;

        }).join("");


    /* ----------------------------------------------
       Calculate totals
    ---------------------------------------------- */

    const subtotal =
        calculateSubtotal();


    const deliveryFee =
        DELIVERY_FEE;


    const total =
        subtotal +
        deliveryFee;


    /* ----------------------------------------------
       Display totals
    ---------------------------------------------- */

    if (checkoutSubtotal) {

        checkoutSubtotal.textContent =
            formatNaira(subtotal);
    }


    if (checkoutDelivery) {

        checkoutDelivery.textContent =
            formatNaira(deliveryFee);
    }


    if (checkoutTotal) {

        checkoutTotal.textContent =
            formatNaira(total);
    }
}


/* ==================================================
   CHECKOUT MESSAGES
================================================== */


/* --------------------------------------------------
   Show error
-------------------------------------------------- */

function showCheckoutError(message) {

    if (!checkoutError) {
        return;
    }


    checkoutError.textContent =
        message;


    checkoutError.hidden =
        false;


    if (checkoutSuccess) {

        checkoutSuccess.hidden =
            true;
    }
}


/* --------------------------------------------------
   Show success
-------------------------------------------------- */

function showCheckoutSuccess(message) {

    if (!checkoutSuccess) {
        return;
    }


    checkoutSuccess.textContent =
        message;


    checkoutSuccess.hidden =
        false;


    if (checkoutError) {

        checkoutError.hidden =
            true;
    }
}


/* ==================================================
   SUBMIT CHECKOUT
================================================== */

checkoutForm?.addEventListener(
    "submit",
    async (event) => {

        // Stop normal HTML form submission.
        event.preventDefault();


        /* ------------------------------------------
           Check cart
        ------------------------------------------ */

        const items =
            getCheckoutItems();


        if (!items.length) {

            showCheckoutError(
                "Your shopping bag is empty. Please add a product before checking out."
            );

            return;
        }


        /* ------------------------------------------
           Disable button
        ------------------------------------------ */

        if (placeOrderButton) {

            placeOrderButton.disabled =
                true;

            placeOrderButton.textContent =
                "Creating Order...";
        }


        if (checkoutError) {
            checkoutError.hidden = true;
        }


        if (checkoutSuccess) {
            checkoutSuccess.hidden = true;
        }


        try {

            /* ======================================
               CUSTOMER DETAILS
            ====================================== */

            const customerName =
                document
                    .getElementById("customerName")
                    .value
                    .trim();


            const customerEmail =
                document
                    .getElementById("customerEmail")
                    .value
                    .trim();


            const customerPhone =
                document
                    .getElementById("customerPhone")
                    .value
                    .trim();


            const deliveryAddress =
                document
                    .getElementById("deliveryAddress")
                    .value
                    .trim();


            const paymentMethod =
                document.querySelector(
                    'input[name="paymentMethod"]:checked'
                )?.value;


            /* ======================================
               VALIDATION
            ====================================== */

            if (!customerName) {

                throw new Error(
                    "Please enter your full name."
                );
            }


            if (!customerEmail) {

                throw new Error(
                    "Please enter your email address."
                );
            }


            if (!customerPhone) {

                throw new Error(
                    "Please enter your phone number."
                );
            }


            if (!deliveryAddress) {

                throw new Error(
                    "Please enter your delivery address."
                );
            }


            if (!paymentMethod) {

                throw new Error(
                    "Please select a payment method."
                );
            }


            /* ======================================
               CALCULATE TOTAL
            ====================================== */

            const subtotal =
                items.reduce(
                    (sum, item) => {

                        return sum +
                            (item.price *
                             item.quantity);

                    },
                    0
                );


            const deliveryFee =
                DELIVERY_FEE;


            const total =
                subtotal +
                deliveryFee;


            console.log(
                "Creating order..."
            );


            console.log({
                customerName,
                customerEmail,
                customerPhone,
                deliveryAddress,
                subtotal,
                deliveryFee,
                total,
                paymentMethod
            });


            /* ======================================
               CREATE ORDER ID
            ====================================== */

            // We create the ID ourselves so we already
            // know which order belongs to this checkout.
            const orderId =
                crypto.randomUUID();


            /* ======================================
               CREATE ORDER IN SUPABASE
            ====================================== */

            const {
                error: orderError
            } =
                await publicSupabaseClient
                    .from("orders")
                    .insert({

                        id:
                            orderId,

                        customer_name:
                            customerName,

                        customer_email:
                            customerEmail,

                        customer_phone:
                            customerPhone,

                        delivery_address:
                            deliveryAddress,

                        subtotal:
                            subtotal,

                        delivery_fee:
                            deliveryFee,

                        total:
                            total,

                        payment_method:
                            paymentMethod,

                        payment_status:
                            "pending",

                        order_status:
                            "pending"
                    });


            /* --------------------------------------
               Check order creation
            -------------------------------------- */

            if (orderError) {

                console.error(
                    "Order creation error:",
                    orderError
                );

                throw new Error(
                    "We could not create your order. Please try again."
                );
            }


            console.log(
                "Order created:",
                orderId
            );


            /* ======================================
               PREPARE ORDER ITEMS
            ====================================== */

            const orderItems =
                items.map(item => {

                    return {

                        order_id:
                            orderId,

                        product_id:
                            item.id,

                        product_name:
                            item.name,

                        quantity:
                            item.quantity,

                        unit_price:
                            item.price,

                        total_price:
                            item.price *
                            item.quantity
                    };
                });


            console.log(
                "Order items:",
                orderItems
            );


            /* ======================================
               SAVE ORDER ITEMS
            ====================================== */

            const {
                error: itemsError
            } =
                await publicSupabaseClient
                    .from("order_items")
                    .insert(orderItems);


            if (itemsError) {

                console.error(
                    "Order items creation error:",
                    itemsError
                );


                // We cannot safely complete the order
                // if its products were not saved.
                throw new Error(
                    "We could not save your order items. Please try again."
                );
            }


            console.log(
                "Order items saved successfully."
            );


            /* ======================================
               FLUTTERWAVE PAYMENT
            ====================================== */

            if (paymentMethod === "flutterwave") {

                console.log(
                    "Creating Flutterwave payment..."
                );


                const {
                    data: paymentData,
                    error: paymentError
                } =
                    await publicSupabaseClient
                        .functions
                        .invoke(
                            "create-flutterwave-payment",
                            {
                                body: {

                                    orderId:
                                        orderId,

                                    customerName:
                                        customerName,

                                    customerEmail:
                                        customerEmail,

                                    customerPhone:
                                        customerPhone
                                }
                            }
                        );


                /* ----------------------------------
                   Check Edge Function error
                ---------------------------------- */

                if (paymentError) {

                    console.error(
                        "Flutterwave function error:",
                        paymentError
                    );


                    throw new Error(
                        "Your order was created, but we could not start the Flutterwave payment."
                    );
                }


                console.log(
                    "Flutterwave response:",
                    paymentData
                );


                /* ----------------------------------
                   Check payment link
                ---------------------------------- */

                if (
                    !paymentData ||
                    !paymentData.paymentLink
                ) {

                    console.error(
                        "No Flutterwave payment link:",
                        paymentData
                    );


                    throw new Error(
                        "Flutterwave did not return a payment link."
                    );
                }


                /* ----------------------------------
                   Send customer to Flutterwave
                ---------------------------------- */

                console.log(
                    "Redirecting to Flutterwave..."
                );


                window.location.href =
                    paymentData.paymentLink;


                return;
            }


            /* ======================================
               BANK TRANSFER
            ====================================== */

            // If bank transfer is selected, we don't
            // redirect to Flutterwave.
            //
            // The order stays:
            //
            // payment_status = pending
            // order_status   = pending

            if (paymentMethod === "bank_transfer") {

                showCheckoutSuccess(
                    `Your order has been created successfully. Order ID: ${orderId}`
                );


                // Clear shopping cart
                localStorage.removeItem(
                    CART_KEY
                );


                // Reset form
                checkoutForm.reset();


                if (placeOrderButton) {

                    placeOrderButton.disabled =
                        true;

                    placeOrderButton.textContent =
                        "Order Created";
                }


                // Refresh checkout display
                renderCheckoutCart();


                return;
            }


        } catch (error) {

            /* ======================================
               ERROR HANDLING
            ====================================== */

            console.error(
                "Checkout error:",
                error
            );


            showCheckoutError(
                error.message ||
                "Something went wrong. Please try again."
            );


            /* --------------------------------------
               Re-enable button
            -------------------------------------- */

            if (placeOrderButton) {

                placeOrderButton.disabled =
                    false;

                placeOrderButton.textContent =
                    "Place Order";
            }
        }
    }
);


/* ==================================================
   INITIAL PAGE RENDER
================================================== */

renderCheckoutCart();


/* ==================================================
   DEBUG INFORMATION
================================================== */

// These are useful while we're building the store.
// Later, we can remove them for production.
console.log(
    "Checkout cart:",
    cart
);

console.log(
    "Checkout items:",
    getCheckoutItems()
);

console.log(
    "Checkout subtotal:",
    calculateSubtotal()
);
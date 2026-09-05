/* ==================================================
   WINICIOUS ADMIN ORDERS
================================================== */

let allOrders = [];

let orderStatusFilter = "all";
let orderDateFilter = "all";
let orderSort = "newest";
let orderMonthFilter = "";


/* ==================================================
   ADMIN AUTH + INITIALISE
================================================== */

document.addEventListener("DOMContentLoaded", async () => {

    const ordersContent = document.getElementById("ordersContent");
    const orderModal = document.getElementById("orderModal");
    const orderDetails = document.getElementById("orderDetails");
    const closeOrderModal = document.getElementById("closeOrderModal");

    // --------------------------------------------------
    // CHECK ADMIN LOGIN
    // --------------------------------------------------

    const {
        data: { session },
        error: sessionError
    } = await supabaseClient.auth.getSession();

    if (sessionError || !session) {
        window.location.href = "login.html";
        return;
    }


    // --------------------------------------------------
    // FORMAT NAIRA
    // --------------------------------------------------

    function formatNaira(amount) {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
            maximumFractionDigits: 0
        }).format(Number(amount) || 0);
    }


    // --------------------------------------------------
    // FORMAT DATE
    // --------------------------------------------------

    function formatDate(date) {
        if (!date) return "-";

        return new Date(date).toLocaleString("en-NG", {
            dateStyle: "medium",
            timeStyle: "short"
        });
    }


    // --------------------------------------------------
    // ESCAPE HTML
    // --------------------------------------------------

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    // --------------------------------------------------
    // DATE FILTER HELPERS
    // --------------------------------------------------

    function getDateRange(filter, specificMonth = "") {

        const now = new Date();

        if (filter === "all") {
            return {
                start: null,
                end: null
            };
        }


        if (filter === "7days") {

            const start = new Date(now);

            start.setDate(
                start.getDate() - 7
            );

            return {
                start,
                end: now
            };
        }


        if (filter === "30days") {

            const start = new Date(now);

            start.setDate(
                start.getDate() - 30
            );

            return {
                start,
                end: now
            };
        }


        if (filter === "thisMonth") {

            const start = new Date(
                now.getFullYear(),
                now.getMonth(),
                1
            );

            return {
                start,
                end: now
            };
        }


        if (filter === "lastMonth") {

            const start = new Date(
                now.getFullYear(),
                now.getMonth() - 1,
                1
            );

            const end = new Date(
                now.getFullYear(),
                now.getMonth(),
                1
            );

            return {
                start,
                end
            };
        }


        if (
            filter === "specificMonth" &&
            specificMonth
        ) {

            const [year, month] =
                specificMonth
                    .split("-")
                    .map(Number);

            if (!year || !month) {
                return {
                    start: null,
                    end: null
                };
            }

            const start = new Date(
                year,
                month - 1,
                1
            );

            const end = new Date(
                year,
                month,
                1
            );

            return {
                start,
                end
            };
        }


        return {
            start: null,
            end: null
        };
    }


    function filterAndSortOrders(orders) {

        const {
            start,
            end
        } = getDateRange(
            orderDateFilter,
            orderMonthFilter
        );


        let filteredOrders = [...orders];


        // --------------------------------------------------
        // STATUS FILTER
        // --------------------------------------------------

        if (orderStatusFilter !== "all") {

            filteredOrders =
                filteredOrders.filter(
                    order =>
                        order.order_status ===
                        orderStatusFilter
                );
        }


        // --------------------------------------------------
        // DATE FILTER
        // --------------------------------------------------

        if (start || end) {

            filteredOrders =
                filteredOrders.filter(order => {

                    if (!order.created_at) {
                        return false;
                    }

                    const createdAt =
                        new Date(
                            order.created_at
                        );

                    if (
                        Number.isNaN(
                            createdAt.getTime()
                        )
                    ) {
                        return false;
                    }

                    if (
                        start &&
                        createdAt < start
                    ) {
                        return false;
                    }

                    if (
                        end &&
                        createdAt >= end
                    ) {
                        return false;
                    }

                    return true;
                });
        }


        // --------------------------------------------------
        // SORT
        // --------------------------------------------------

        filteredOrders.sort((a, b) => {

            const dateA =
                new Date(
                    a.created_at
                ).getTime();

            const dateB =
                new Date(
                    b.created_at
                ).getTime();

            return orderSort === "oldest"
                ? dateA - dateB
                : dateB - dateA;
        });


        return filteredOrders;
    }


    // --------------------------------------------------
    // LOAD ORDERS
    // --------------------------------------------------

    async function loadOrders() {

        ordersContent.innerHTML = `
            <div class="loading-orders">
                Loading orders...
            </div>
        `;


        const {
            data: orders,
            error
        } = await supabaseClient
            .from("orders")
            .select("*")
            .order("created_at", {
                ascending: false
            });


        if (error) {

            console.error(
                "Orders loading error:",
                error
            );

            ordersContent.innerHTML = `
                <div class="empty-orders">
                    <h3>Could not load orders</h3>
                    <p>
                        ${escapeHTML(error.message)}
                    </p>
                </div>
            `;

            return;
        }


        allOrders = orders || [];

        renderOrders();
    }


    // --------------------------------------------------
    // RENDER ORDERS
    // --------------------------------------------------

    function renderOrders() {

        const orders =
            filterAndSortOrders(
                allOrders
            );


        if (!orders.length) {

            ordersContent.innerHTML = `
                <div class="empty-orders">
                    <h3>No orders found</h3>
                    <p>
                        Try changing your filters.
                    </p>
                </div>
            `;

            return;
        }


        ordersContent.innerHTML = `

            <div class="orders-filters">

                <div class="orders-filter">

                    <label for="orderStatusFilter">
                        Status
                    </label>

                    <select id="orderStatusFilter">

                        <option value="all">
                            All orders
                        </option>

                        <option value="pending">
                            Pending
                        </option>

                        <option value="processing">
                            Processing
                        </option>

                        <option value="shipped">
                            Shipped
                        </option>

                        <option value="delivered">
                            Delivered
                        </option>

                        <option value="cancelled">
                            Cancelled
                        </option>

                    </select>

                </div>


                <div class="orders-filter">

                    <label for="orderDateFilter">
                        Date
                    </label>

                    <select id="orderDateFilter">

                        <option value="all">
                            All time
                        </option>

                        <option value="7days">
                            Last 7 days
                        </option>

                        <option value="30days">
                            Last 30 days
                        </option>

                        <option value="thisMonth">
                            This month
                        </option>

                        <option value="lastMonth">
                            Last month
                        </option>

                        <option value="specificMonth">
                            Specific month
                        </option>

                    </select>

                </div>


                <div class="orders-filter">

                    <label for="orderMonthFilter">
                        Month
                    </label>

                    <input
                        type="month"
                        id="orderMonthFilter"
                        value="${escapeHTML(orderMonthFilter)}"
                        ${orderDateFilter !== "specificMonth" ? "hidden" : ""}
                    >

                </div>


                <div class="orders-filter">

                    <label for="orderSort">
                        Sort
                    </label>

                    <select id="orderSort">

                        <option value="newest">
                            Newest first
                        </option>

                        <option value="oldest">
                            Oldest first
                        </option>

                    </select>

                </div>

            </div>


            <div class="orders-table-wrapper">

                <table class="orders-table">

                    <thead>

                        <tr>
                            <th>#</th>
                            <th>Customer</th>
                            <th>Total</th>
                            <th>Payment</th>
                            <th>Order Status</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>

                    </thead>


                    <tbody>

                        ${orders.map((order, index) => `

                            <tr>

                                <td>
                                    ${index + 1}
                                </td>


                                <td>

                                    <strong>
                                        ${escapeHTML(
                                            order.customer_name
                                        )}
                                    </strong>

                                    <br>

                                    <small>
                                        ${escapeHTML(
                                            order.customer_email
                                        )}
                                    </small>

                                </td>


                                <td>
                                    ${formatNaira(
                                        order.total
                                    )}
                                </td>


                                <td>

                                    <span
                                        class="payment-${escapeHTML(
                                            order.payment_status
                                        )}"
                                    >
                                        ${escapeHTML(
                                            order.payment_status
                                        )}
                                    </span>

                                </td>


                                <td>

                                    <span
                                        class="status status--${escapeHTML(
                                            order.order_status
                                        )}"
                                    >
                                        ${escapeHTML(
                                            order.order_status
                                        )}
                                    </span>

                                </td>


                                <td>
                                    ${formatDate(
                                        order.created_at
                                    )}
                                </td>


                                <td>

                                    <div class="order-actions">

                                        <button
                                            type="button"
                                            class="btn btn--secondary view-order"
                                            data-order-id="${escapeHTML(
                                                order.id
                                            )}"
                                        >
                                            View
                                        </button>


                                        <select
                                            class="order-status-select"
                                            data-order-id="${escapeHTML(
                                                order.id
                                            )}"
                                        >

                                            <option
                                                value="pending"
                                                ${order.order_status === "pending"
                                                    ? "selected"
                                                    : ""}
                                            >
                                                Pending
                                            </option>

                                            <option
                                                value="processing"
                                                ${order.order_status === "processing"
                                                    ? "selected"
                                                    : ""}
                                            >
                                                Processing
                                            </option>

                                            <option
                                                value="shipped"
                                                ${order.order_status === "shipped"
                                                    ? "selected"
                                                    : ""}
                                            >
                                                Shipped
                                            </option>

                                            <option
                                                value="delivered"
                                                ${order.order_status === "delivered"
                                                    ? "selected"
                                                    : ""}
                                            >
                                                Delivered
                                            </option>

                                            <option
                                                value="cancelled"
                                                ${order.order_status === "cancelled"
                                                    ? "selected"
                                                    : ""}
                                            >
                                                Cancelled
                                            </option>

                                        </select>

                                    </div>

                                </td>

                            </tr>

                        `).join("")}

                    </tbody>

                </table>

            </div>
        `;


        // Restore current filter values

        const statusSelect =
            document.getElementById(
                "orderStatusFilter"
            );

        const dateSelect =
            document.getElementById(
                "orderDateFilter"
            );

        const sortSelect =
            document.getElementById(
                "orderSort"
            );


        if (statusSelect) {
            statusSelect.value =
                orderStatusFilter;
        }

        if (dateSelect) {
            dateSelect.value =
                orderDateFilter;
        }

        if (sortSelect) {
            sortSelect.value =
                orderSort;
        }
    }


    // --------------------------------------------------
    // VIEW ORDER
    // --------------------------------------------------

  // --------------------------------------------------
// VIEW ORDER
// --------------------------------------------------

async function viewOrder(orderId) {

    const {
        data: order,
        error: orderError
    } = await supabaseClient
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();


    if (orderError) {

        console.error(
            "Order error:",
            orderError
        );

        alert(
            "Could not load this order."
        );

        return;
    }


    const {
        data: items,
        error: itemsError
    } = await supabaseClient
        .from("order_items")
        .select("*")
        .eq("order_id", orderId)
        .order("created_at", {
            ascending: true
        });


    if (itemsError) {

        console.error(
            "Order items error:",
            itemsError
        );

        alert(
            "Could not load order items."
        );

        return;
    }


    const orderItems = items || [];


    orderDetails.innerHTML = `

        <!-- ==========================================
             ORDER INFORMATION
        =========================================== -->

        <div class="order-section">

            <h3>Customer</h3>

            <div class="order-detail-grid">

                <p>
                    <strong>Name</strong>
                    <span>
                        ${escapeHTML(
                            order.customer_name
                        )}
                    </span>
                </p>

                <p>
                    <strong>Email</strong>
                    <span>
                        ${escapeHTML(
                            order.customer_email
                        )}
                    </span>
                </p>

                <p>
                    <strong>Phone</strong>
                    <span>
                        ${escapeHTML(
                            order.customer_phone
                        )}
                    </span>
                </p>

                <p>
                    <strong>Delivery Address</strong>
                    <span>
                        ${escapeHTML(
                            order.delivery_address ||
                            "Not provided"
                        )}
                    </span>
                </p>

            </div>

        </div>


        <!-- ==========================================
             ITEMS PURCHASED
        =========================================== -->

        <div class="order-section">

            <h3>
                Items Purchased
            </h3>

            ${
                orderItems.length
                    ? `
                        <div class="order-items">

                            ${orderItems.map(item => `

                                <div class="order-item">

                                    <div class="order-item__info">

                                        <strong>
                                            ${escapeHTML(
                                                item.product_name
                                            )}
                                        </strong>

                                        <small>
                                            Product ID:
                                            ${escapeHTML(
                                                item.product_id
                                            )}
                                        </small>

                                    </div>


                                    <div class="order-item__quantity">

                                        <span>
                                            Qty
                                        </span>

                                        <strong>
                                            ${Number(
                                                item.quantity
                                            ) || 0}
                                        </strong>

                                    </div>


                                    <div class="order-item__price">

                                        <span>
                                            Unit price
                                        </span>

                                        <strong>
                                            ${formatNaira(
                                                item.unit_price
                                            )}
                                        </strong>

                                    </div>


                                    <div class="order-item__total">

                                        <span>
                                            Total
                                        </span>

                                        <strong>
                                            ${formatNaira(
                                                item.total_price
                                            )}
                                        </strong>

                                    </div>

                                </div>

                            `).join("")}

                        </div>
                    `
                    : `
                        <div class="order-items-empty">
                            <p>
                                No order items found for this order.
                            </p>
                        </div>
                    `
            }

        </div>


        <!-- ==========================================
             ORDER TOTALS
        =========================================== -->

        <div class="order-section order-summary">

            <div class="order-summary__row">

                <span>
                    Subtotal
                </span>

                <strong>
                    ${formatNaira(
                        order.subtotal
                    )}
                </strong>

            </div>


            <div class="order-summary__row">

                <span>
                    Delivery
                </span>

                <strong>
                    ${formatNaira(
                        order.delivery_fee
                    )}
                </strong>

            </div>


            <div class="order-total">

                <span>
                    Total
                </span>

                <strong>
                    ${formatNaira(
                        order.total
                    )}
                </strong>

            </div>

        </div>


        <!-- ==========================================
             PAYMENT
        =========================================== -->

        <div class="order-section">

            <h3>
                Payment
            </h3>

            <div class="order-detail-grid">

                <p>
                    <strong>Method</strong>
                    <span>
                        ${escapeHTML(
                            order.payment_method ||
                            "Not selected"
                        )}
                    </span>
                </p>

                <p>
                    <strong>Status</strong>
                    <span>
                        ${escapeHTML(
                            order.payment_status
                        )}
                    </span>
                </p>

                <p>
                    <strong>Reference</strong>
                    <span>
                        ${escapeHTML(
                            order.payment_reference ||
                            "Not available"
                        )}
                    </span>
                </p>

                <p>
                    <strong>Order Date</strong>
                    <span>
                        ${formatDate(
                            order.created_at
                        )}
                    </span>
                </p>

            </div>

        </div>


        <!-- ==========================================
             ORDER STATUS
        =========================================== -->

        <div class="order-section">

            <h3>
                Order Status
            </h3>

            <select
                id="modalOrderStatus"
                data-order-id="${escapeHTML(
                    order.id
                )}"
            >

                <option
                    value="pending"
                    ${order.order_status === "pending"
                        ? "selected"
                        : ""}
                >
                    Pending
                </option>

                <option
                    value="processing"
                    ${order.order_status === "processing"
                        ? "selected"
                        : ""}
                >
                    Processing
                </option>

                <option
                    value="shipped"
                    ${order.order_status === "shipped"
                        ? "selected"
                        : ""}
                >
                    Shipped
                </option>

                <option
                    value="delivered"
                    ${order.order_status === "delivered"
                        ? "selected"
                        : ""}
                >
                    Delivered
                </option>

                <option
                    value="cancelled"
                    ${order.order_status === "cancelled"
                        ? "selected"
                        : ""}
                >
                    Cancelled
                </option>

            </select>

        </div>

    `;


    // Show modal

    orderModal.hidden = false;

    orderModal.classList.add(
        "is-open"
    );
}


    // --------------------------------------------------
    // UPDATE ORDER STATUS
    // --------------------------------------------------

    async function updateOrderStatus(
        orderId,
        newStatus
    ) {

        const { error } =
            await supabaseClient
                .from("orders")
                .update({
                    order_status: newStatus
                })
                .eq("id", orderId);


        if (error) {

            console.error(
                "Status update error:",
                error
            );

            alert(
                "Could not update order status."
            );

            return;
        }


        // Update local data immediately

        const order =
            allOrders.find(
                item =>
                    String(item.id) ===
                    String(orderId)
            );

        if (order) {
            order.order_status =
                newStatus;
        }


        renderOrders();


        if (
            orderModal.classList.contains(
                "is-open"
            )
        ) {
            await viewOrder(
                orderId
            );
        }
    }


    // --------------------------------------------------
    // FILTER EVENT LISTENERS
    // --------------------------------------------------

    ordersContent.addEventListener(
        "change",
        event => {

            const statusSelect =
                event.target.closest(
                    "#orderStatusFilter"
                );

            if (statusSelect) {

                orderStatusFilter =
                    statusSelect.value;

                renderOrders();

                return;
            }


            const dateSelect =
                event.target.closest(
                    "#orderDateFilter"
                );

            if (dateSelect) {

                orderDateFilter =
                    dateSelect.value;

                const monthInput =
                    document.getElementById(
                        "orderMonthFilter"
                    );

                if (monthInput) {

                    monthInput.hidden =
                        orderDateFilter !==
                        "specificMonth";
                }

                renderOrders();

                return;
            }


            const monthInput =
                event.target.closest(
                    "#orderMonthFilter"
                );

            if (monthInput) {

                orderMonthFilter =
                    monthInput.value;

                renderOrders();

                return;
            }


            const sortSelect =
                event.target.closest(
                    "#orderSort"
                );

            if (sortSelect) {

                orderSort =
                    sortSelect.value;

                renderOrders();

                return;
            }


            const orderStatusSelect =
                event.target.closest(
                    ".order-status-select"
                );

            if (orderStatusSelect) {

                const orderId =
                    orderStatusSelect
                        .dataset.orderId;

                const newStatus =
                    orderStatusSelect.value;

                updateOrderStatus(
                    orderId,
                    newStatus
                );
            }
        }
    );


    // --------------------------------------------------
    // VIEW ORDER
    // --------------------------------------------------

    ordersContent.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    ".view-order"
                );

            if (!button) return;

            const orderId =
                button.dataset.orderId;

            viewOrder(orderId);
        }
    );


    // --------------------------------------------------
    // MODAL STATUS
    // --------------------------------------------------

    orderDetails.addEventListener(
        "change",
        event => {

            const select =
                event.target.closest(
                    "#modalOrderStatus"
                );

            if (!select) return;

            const orderId =
                select.dataset.orderId;

            const newStatus =
                select.value;

            updateOrderStatus(
                orderId,
                newStatus
            );
        }
    );


    // --------------------------------------------------
    // CLOSE MODAL
    // --------------------------------------------------

    closeOrderModal.addEventListener(
    "click",
    () => {
        orderModal.classList.remove(
            "is-open"
        );

        orderModal.hidden = true;
    }
);


    orderModal.addEventListener(
    "click",
    event => {

        if (
            event.target === orderModal ||
            event.target.id ===
            "orderModalBackdrop"
        ) {

            orderModal.classList.remove(
                "is-open"
            );

            orderModal.hidden = true;
        }

    }
);


    // --------------------------------------------------
    // START
    // --------------------------------------------------

    await loadOrders();

});
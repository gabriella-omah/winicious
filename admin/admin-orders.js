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
    // LOAD ORDERS
    // --------------------------------------------------

    async function loadOrders() {

        ordersContent.innerHTML = `
            <div class="loading-orders">
                Loading orders...
            </div>
        `;

        const { data: orders, error } = await supabaseClient
            .from("orders")
            .select("*")
            .order("created_at", {
                ascending: false
            });

        if (error) {
            console.error("Orders loading error:", error);

            ordersContent.innerHTML = `
                <div class="empty-orders">
                    <h3>Could not load orders</h3>
                    <p>${escapeHTML(error.message)}</p>
                </div>
            `;

            return;
        }

        if (!orders || orders.length === 0) {

            ordersContent.innerHTML = `
                <div class="empty-orders">
                    <h3>No orders yet</h3>
                    <p>Customer orders will appear here.</p>
                </div>
            `;

            return;
        }

        renderOrders(orders);
    }


    // --------------------------------------------------
    // RENDER ORDERS
    // --------------------------------------------------

    function renderOrders(orders) {

        ordersContent.innerHTML = `
            <div class="orders-table-wrapper">

                <table class="orders-table">

                    <thead>
                        <tr>
                            <th>Customer</th>
                            <th>Total</th>
                            <th>Payment</th>
                            <th>Order Status</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>

                        ${orders.map(order => `

                            <tr>

                                <td>
                                    <strong>
                                        ${escapeHTML(order.customer_name)}
                                    </strong>

                                    <br>

                                    <small>
                                        ${escapeHTML(order.customer_email)}
                                    </small>
                                </td>

                                <td>
                                    ${formatNaira(order.total)}
                                </td>

                                <td>
                                    <span class="payment-${escapeHTML(order.payment_status)}">
                                        ${escapeHTML(order.payment_status)}
                                    </span>
                                </td>

                                <td>
                                    <span class="status status--${escapeHTML(order.order_status)}">
                                        ${escapeHTML(order.order_status)}
                                    </span>
                                </td>

                                <td>
                                    ${formatDate(order.created_at)}
                                </td>

                                <td>

                                    <div class="order-actions">

                                        <button
                                            type="button"
                                            class="btn btn--secondary view-order"
                                            data-order-id="${order.id}"
                                        >
                                            View
                                        </button>

                                        <select
                                            class="order-status-select"
                                            data-order-id="${order.id}"
                                        >

                                            <option value="pending"
                                                ${order.order_status === "pending" ? "selected" : ""}>
                                                Pending
                                            </option>

                                            <option value="processing"
                                                ${order.order_status === "processing" ? "selected" : ""}>
                                                Processing
                                            </option>

                                            <option value="shipped"
                                                ${order.order_status === "shipped" ? "selected" : ""}>
                                                Shipped
                                            </option>

                                            <option value="delivered"
                                                ${order.order_status === "delivered" ? "selected" : ""}>
                                                Delivered
                                            </option>

                                            <option value="cancelled"
                                                ${order.order_status === "cancelled" ? "selected" : ""}>
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
    }


    // --------------------------------------------------
    // VIEW ORDER
    // --------------------------------------------------

    async function viewOrder(orderId) {

        const { data: order, error: orderError } = await supabaseClient
            .from("orders")
            .select("*")
            .eq("id", orderId)
            .single();

        if (orderError) {
            console.error("Order error:", orderError);
            alert("Could not load this order.");
            return;
        }


        const { data: items, error: itemsError } = await supabaseClient
            .from("order_items")
            .select("*")
            .eq("order_id", orderId)
            .order("created_at", {
                ascending: true
            });

        if (itemsError) {
            console.error("Order items error:", itemsError);
            alert("Could not load order items.");
            return;
        }


        orderDetails.innerHTML = `

            <div class="order-section">

                <h3>Customer</h3>

                <p>
                    <strong>Name:</strong>
                    ${escapeHTML(order.customer_name)}
                </p>

                <p>
                    <strong>Email:</strong>
                    ${escapeHTML(order.customer_email)}
                </p>

                <p>
                    <strong>Phone:</strong>
                    ${escapeHTML(order.customer_phone)}
                </p>

                <p>
                    <strong>Delivery Address:</strong><br>
                    ${escapeHTML(order.delivery_address || "Not provided")}
                </p>

            </div>


            <div class="order-section">

                <h3>Order Items</h3>

                <div class="order-items">

                    ${items.length
                        ? items.map(item => `

                            <div class="order-item">

                                <div>

                                    <strong>
                                        ${escapeHTML(item.product_name)}
                                    </strong>

                                    <br>

                                    <small>
                                        ${item.quantity} × ${formatNaira(item.unit_price)}
                                    </small>

                                </div>

                                <strong>
                                    ${formatNaira(item.total_price)}
                                </strong>

                            </div>

                        `).join("")
                        : "<p>No order items found.</p>"
                    }

                </div>

            </div>


            <div class="order-section">

                <p>
                    <strong>Subtotal:</strong>
                    ${formatNaira(order.subtotal)}
                </p>

                <p>
                    <strong>Delivery:</strong>
                    ${formatNaira(order.delivery_fee)}
                </p>

                <div class="order-total">

                    <span>Total</span>

                    <span>
                        ${formatNaira(order.total)}
                    </span>

                </div>

            </div>


            <div class="order-section">

                <h3>Payment</h3>

                <p>
                    <strong>Method:</strong>
                    ${escapeHTML(order.payment_method || "Not selected")}
                </p>

                <p>
                    <strong>Status:</strong>
                    ${escapeHTML(order.payment_status)}
                </p>

                <p>
                    <strong>Reference:</strong>
                    ${escapeHTML(order.payment_reference || "Not available")}
                </p>

            </div>


            <div class="order-section">

                <h3>Order Status</h3>

                <select id="modalOrderStatus" data-order-id="${order.id}">

                    <option value="pending"
                        ${order.order_status === "pending" ? "selected" : ""}>
                        Pending
                    </option>

                    <option value="processing"
                        ${order.order_status === "processing" ? "selected" : ""}>
                        Processing
                    </option>

                    <option value="shipped"
                        ${order.order_status === "shipped" ? "selected" : ""}>
                        Shipped
                    </option>

                    <option value="delivered"
                        ${order.order_status === "delivered" ? "selected" : ""}>
                        Delivered
                    </option>

                    <option value="cancelled"
                        ${order.order_status === "cancelled" ? "selected" : ""}>
                        Cancelled
                    </option>

                </select>

            </div>

        `;

        orderModal.classList.add("is-open");
    }


    // --------------------------------------------------
    // UPDATE ORDER STATUS
    // --------------------------------------------------

    async function updateOrderStatus(orderId, newStatus) {

        const { error } = await supabaseClient
            .from("orders")
            .update({
                order_status: newStatus
            })
            .eq("id", orderId);

        if (error) {
            console.error("Status update error:", error);

            alert("Could not update order status.");

            return;
        }

        await loadOrders();

        if (orderModal.classList.contains("is-open")) {
            await viewOrder(orderId);
        }
    }


    // --------------------------------------------------
    // EVENT LISTENERS
    // --------------------------------------------------

    ordersContent.addEventListener("click", event => {

        const button = event.target.closest(".view-order");

        if (!button) return;

        const orderId = button.dataset.orderId;

        viewOrder(orderId);
    });


    ordersContent.addEventListener("change", event => {

        const select = event.target.closest(".order-status-select");

        if (!select) return;

        const orderId = select.dataset.orderId;
        const newStatus = select.value;

        updateOrderStatus(orderId, newStatus);
    });


    orderDetails.addEventListener("change", event => {

        const select = event.target.closest("#modalOrderStatus");

        if (!select) return;

        const orderId = select.dataset.orderId;
        const newStatus = select.value;

        updateOrderStatus(orderId, newStatus);
    });


    closeOrderModal.addEventListener("click", () => {
        orderModal.classList.remove("is-open");
    });


    orderModal.addEventListener("click", event => {

        if (event.target === orderModal) {
            orderModal.classList.remove("is-open");
        }

    });


    // --------------------------------------------------
    // START
    // --------------------------------------------------

    await loadOrders();

});
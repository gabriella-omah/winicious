/* ==================================================
   WINICIOUS ADMIN DASHBOARD
================================================== */

let allBookings = [];
let allMessages = [];

let bookingDateFilter = "all";
let bookingSort = "newest";
let bookingMonthFilter = "";

let messageDateFilter = "all";
let messageSort = "newest";
let messageMonthFilter = "";

/* ==================================================
   ADMIN AUTH CHECK
================================================== */
async function requireAdmin() {
    const {
        data: { session },
        error
    } = await supabaseClient.auth.getSession();

    if (error) {
        console.error("Auth check error:", error);
        window.location.href = "admin-login.html";
        return false;
    }

    if (!session) {
        window.location.href = "admin-login.html";
        return false;
    }

    console.log("Admin authenticated:", session.user.email);
    return true;
}

/* ==================================================
   LOAD BOOKINGS
================================================== */
async function loadBookings() {
    const table = document.getElementById("bookingsTable");

    if (!table) {
        console.error("bookingsTable was not found.");
        return;
    }

    table.innerHTML = `
        <tr>
            <td colspan="7" class="admin-table__loading">
                Loading bookings...
            </td>
        </tr>
    `;

    console.log("Loading bookings...");
    console.log("Supabase client:", supabaseClient);

    const { data, error } = await supabaseClient
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });

    console.log("Bookings data:", data);
    console.log("Bookings error:", error);

    if (error) {
        console.error("FULL BOOKINGS ERROR:", error);

        table.innerHTML = `
            <tr>
                <td colspan="7" class="admin-table__empty">
                    ${escapeHTML(error.message)}
                </td>
            </tr>
        `;

        return;
    }

    allBookings = data || [];

    renderBookings();
    updateBookingStats();
}

/* ==================================================
   RENDER BOOKINGS
================================================== */
function renderBookings() {
    const table = document.getElementById("bookingsTable");
    const filter = document.getElementById("bookingFilter");

    if (!table) return;

    const selectedStatus = filter?.value || "all";

    let bookings =
        selectedStatus === "all"
            ? [...allBookings]
            : allBookings.filter(
                booking => booking.status === selectedStatus
            );

    bookings = filterAndSortByDate(
        bookings,
        bookingDateFilter,
        bookingSort,
        bookingMonthFilter
    );

    if (!bookings.length) {
        table.innerHTML = `
            <tr>
                <td colspan="7" class="admin-table__empty">
                    No bookings found.
                </td>
            </tr>
        `;
        return;
    }

    table.innerHTML = bookings.map((booking, index) => `
        <tr>
            <td class="admin-table__number">
                ${index + 1}
            </td>

            <td>
                <div class="admin-customer">
                    <strong>
                        ${escapeHTML(booking.customer_name || "—")}
                    </strong>

                    ${
                        booking.notes
                            ? `<small>${escapeHTML(booking.notes)}</small>`
                            : ""
                    }
                </div>
            </td>

            <td>
                ${escapeHTML(booking.service || "—")}
            </td>

            <td class="admin-date">
                ${formatDate(booking.preferred_date)}
            </td>

            <td>
                ${escapeHTML(booking.preferred_time || "—")}
            </td>

            <td>
                <div class="admin-contact">
                    ${
                        booking.customer_phone
                            ? `<a href="tel:${escapeAttribute(booking.customer_phone)}">
                                ${escapeHTML(booking.customer_phone)}
                               </a>`
                            : ""
                    }

                    ${
                        booking.customer_email
                            ? `<a href="mailto:${escapeAttribute(booking.customer_email)}">
                                ${escapeHTML(booking.customer_email)}
                               </a>`
                            : ""
                    }
                </div>
            </td>

            <td>
                <select
                    class="admin-status-select"
                    data-booking-status="${escapeAttribute(booking.id)}"
                >
                    ${statusOptions(booking.status)}
                </select>
            </td>
        </tr>
    `).join("");
}

/* ==================================================
   UPDATE BOOKING STATUS
================================================== */
async function updateBookingStatus(id, status) {
    const { error } = await supabaseClient
        .from("bookings")
        .update({ status })
        .eq("id", id);

    if (error) {
        console.error("Status update error:", error);
        alert("We couldn't update the booking status.");
        return;
    }

    const booking = allBookings.find(
        item => String(item.id) === String(id)
    );

    if (booking) {
        booking.status = status;
    }

    renderBookings();
    updateBookingStats();
}

/* ==================================================
   LOAD CONTACT MESSAGES
================================================== */
async function loadMessages() {
    const table = document.getElementById("messagesTable");

    if (!table) return;

    table.innerHTML = `
        <tr>
            <td colspan="7" class="admin-table__loading">
                Loading messages...
            </td>
        </tr>
    `;

    const { data, error } = await supabaseClient
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Messages error:", error);

        table.innerHTML = `
            <tr>
                <td colspan="7" class="admin-table__empty">
                    Could not load messages.
                </td>
            </tr>
        `;

        return;
    }

    allMessages = data || [];

    renderMessages();
    updateMessageStats();
}

/* ==================================================
   RENDER MESSAGES
================================================== */
function renderMessages() {
    const table = document.getElementById("messagesTable");
    const filter = document.getElementById("messageFilter");

    if (!table) return;

    const selectedStatus = filter?.value || "all";

    let messages =
        selectedStatus === "all"
            ? [...allMessages]
            : allMessages.filter(
                message => message.status === selectedStatus
            );

    messages = filterAndSortByDate(
        messages,
        messageDateFilter,
        messageSort,
        messageMonthFilter
    );

    if (!messages.length) {
        table.innerHTML = `
            <tr>
                <td colspan="7" class="admin-table__empty">
                    No messages found.
                </td>
            </tr>
        `;
        return;
    }

    table.innerHTML = messages.map((message, index) => `
        <tr>
            <td class="admin-table__number">
                ${index + 1}
            </td>

            <td>
                <div class="admin-customer">
                    <strong>
                        ${escapeHTML(message.name || "—")}
                    </strong>
                </div>
            </td>

            <td>
                ${escapeHTML(message.reason || "—")}
            </td>

            <td>
                ${
                    message.email
                        ? `<a href="mailto:${escapeAttribute(message.email)}">
                            ${escapeHTML(message.email)}
                           </a>`
                        : "—"
                }
            </td>

            <td>
                ${
                    message.phone
                        ? `<a href="tel:${escapeAttribute(message.phone)}">
                            ${escapeHTML(message.phone)}
                           </a>`
                        : "—"
                }
            </td>

            <td>
                <div class="admin-message">
                    ${escapeHTML(message.message || "—")}
                </div>
            </td>

            <td>
                <select
                    class="admin-status-select"
                    data-message-status="${escapeAttribute(message.id)}"
                >
                    ${messageStatusOptions(message.status)}
                </select>
            </td>
        </tr>
    `).join("");
}

/* ==================================================
   UPDATE MESSAGE STATUS
================================================== */
async function updateMessageStatus(id, status) {
    const { error } = await supabaseClient
        .from("contact_messages")
        .update({ status })
        .eq("id", id);

    if (error) {
        console.error("Message status error:", error);
        alert("We couldn't update the message status.");
        return;
    }

    const message = allMessages.find(
        item => String(item.id) === String(id)
    );

    if (message) {
        message.status = status;
    }

    renderMessages();
    updateMessageStats();
}

/* ==================================================
   STATS
================================================== */
function updateBookingStats() {
    const total = document.getElementById("totalBookings");
    const pending = document.getElementById("pendingBookings");

    if (total) {
        total.textContent = allBookings.length;
    }

    if (pending) {
        pending.textContent =
            allBookings.filter(
                booking => booking.status === "pending"
            ).length;
    }
}

function updateMessageStats() {
    const total = document.getElementById("totalMessages");
    const unread = document.getElementById("unreadMessages");

    if (total) {
        total.textContent = allMessages.length;
    }

    if (unread) {
        unread.textContent =
            allMessages.filter(
                message => message.status === "new"
            ).length;
    }
}

/* ==================================================
   FILTERS & SORTING
================================================== */
/* ==================================================
   STATUS CHANGE LISTENERS
================================================== */

document.addEventListener("change", event => {
    const bookingSelect = event.target.closest(
        "[data-booking-status]"
    );

    if (bookingSelect) {
        const id = bookingSelect.dataset.bookingStatus;
        const status = bookingSelect.value;

        updateBookingStatus(id, status);
        return;
    }

    const messageSelect = event.target.closest(
        "[data-message-status]"
    );

    if (messageSelect) {
        const id = messageSelect.dataset.messageStatus;
        const status = messageSelect.value;

        updateMessageStatus(id, status);
    }
});

document
    .getElementById("bookingFilter")
    ?.addEventListener("change", renderBookings);

document
    .getElementById("bookingDateFilter")
    ?.addEventListener("change", event => {
        bookingDateFilter = event.target.value;

        const monthInput =
            document.getElementById("bookingMonthFilter");

        if (monthInput) {
            monthInput.hidden =
                bookingDateFilter !== "specificMonth";
        }

        renderBookings();
    });

document
    .getElementById("bookingMonthFilter")
    ?.addEventListener("change", event => {
        bookingMonthFilter = event.target.value;
        renderBookings();
    });

document
    .getElementById("bookingSort")
    ?.addEventListener("change", event => {
        bookingSort = event.target.value;
        renderBookings();
    });


document
    .getElementById("messageFilter")
    ?.addEventListener("change", renderMessages);

document
    .getElementById("messageDateFilter")
    ?.addEventListener("change", event => {
        messageDateFilter = event.target.value;

        const monthInput =
            document.getElementById("messageMonthFilter");

        if (monthInput) {
            monthInput.hidden =
                messageDateFilter !== "specificMonth";
        }

        renderMessages();
    });

document
    .getElementById("messageMonthFilter")
    ?.addEventListener("change", event => {
        messageMonthFilter = event.target.value;
        renderMessages();
    });

document
    .getElementById("messageSort")
    ?.addEventListener("change", event => {
        messageSort = event.target.value;
        renderMessages();
    });

/* ==================================================
   CLOSE NOTIFICATION PANEL
================================================== */
function closeNotificationPanel() {
    const panel = document.getElementById("notificationPanel");
    const button = document.getElementById("notificationButton");

    if (!panel) return;

    panel.hidden = true;

    if (button) {
        button.setAttribute("aria-expanded", "false");
    }
}

/* ==================================================
   REFRESH DASHBOARD
================================================== */
document
    .getElementById("refreshDashboard")
    ?.addEventListener("click", async event => {
        const button = event.currentTarget;

        if (button.disabled) return;

        /* Close notifications when refreshing */
        closeNotificationPanel();

        button.disabled = true;

        const originalHTML = button.innerHTML;

        button.innerHTML = `
            <i class="fa-solid fa-rotate fa-spin" aria-hidden="true"></i>
            Refreshing...
        `;

        try {
            await Promise.all([
                loadBookings(),
                loadMessages()
            ]);
        } catch (error) {
            console.error("Dashboard refresh error:", error);
        } finally {
            button.disabled = false;
            button.innerHTML = originalHTML;
        }
    });

/* ==================================================
   ADMIN LOGOUT
================================================== */
document
    .getElementById("adminLogout")
    ?.addEventListener("click", async () => {
        const { error } = await supabaseClient.auth.signOut();

        if (error) {
            console.error("Logout error:", error);
            alert("Could not log out.");
            return;
        }

        window.location.href = "admin-login.html";
    });

/* ==================================================
   HELPERS
================================================== */
function statusOptions(currentStatus) {
    const statuses = [
        "pending",
        "confirmed",
        "completed",
        "cancelled"
    ];

    return statuses.map(status => `
        <option
            value="${status}"
            ${status === currentStatus ? "selected" : ""}
        >
            ${status.charAt(0).toUpperCase() + status.slice(1)}
        </option>
    `).join("");
}

function messageStatusOptions(currentStatus) {
    const statuses = [
        "new",
"read",
"replied",
"closed"
    ];

    return statuses.map(status => `
        <option
            value="${status}"
            ${status === currentStatus ? "selected" : ""}
        >
            ${status.charAt(0).toUpperCase() + status.slice(1)}
        </option>
    `).join("");
}

/* ==================================================
   DATE FILTER HELPERS
================================================== */

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
        start.setDate(start.getDate() - 7);

        return {
            start,
            end: now
        };
    }

    if (filter === "30days") {
        const start = new Date(now);
        start.setDate(start.getDate() - 30);

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

    if (filter === "specificMonth" && specificMonth) {
        const [year, month] = specificMonth
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

function filterAndSortByDate(
    items,
    dateFilter,
    sortOrder,
    specificMonth = ""
) {
    const { start, end } =
        getDateRange(
            dateFilter,
            specificMonth
        );

    let filteredItems = [...items];

    if (start || end) {
        filteredItems = filteredItems.filter(item => {
            if (!item.created_at) {
                return false;
            }

            const createdAt =
                new Date(item.created_at);

            if (Number.isNaN(createdAt.getTime())) {
                return false;
            }

            if (start && createdAt < start) {
                return false;
            }

            if (end && createdAt >= end) {
                return false;
            }

            return true;
        });
    }

    filteredItems.sort((a, b) => {
        const dateA =
            new Date(a.created_at).getTime();

        const dateB =
            new Date(b.created_at).getTime();

        return sortOrder === "oldest"
            ? dateA - dateB
            : dateB - dateA;
    });

    return filteredItems;
}

function formatDate(dateString) {
    if (!dateString) return "—";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return dateString;
    }

    return new Intl.DateTimeFormat("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric"
    }).format(date);
}

function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
    return escapeHTML(value);
}

/* ==================================================
   INITIALISE
================================================== */

document.addEventListener("DOMContentLoaded", async () => {
    const authenticated = await requireAdmin();

    if (!authenticated) {
        return;
    }

    await Promise.all([
        loadBookings(),
        loadMessages()
    ]);
});
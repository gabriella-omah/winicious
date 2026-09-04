/* ==================================================
   WINICIOUS ADMIN DASHBOARD
================================================== */

let allBookings = [];
let allMessages = [];

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
            <td colspan="6" class="admin-table__loading">
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
                <td colspan="6" class="admin-table__empty">
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
    const bookings =
        selectedStatus === "all"
            ? allBookings
            : allBookings.filter(
                booking => booking.status === selectedStatus
            );
    if (!bookings.length) {
        table.innerHTML = `
            <tr>
                <td colspan="6" class="admin-table__empty">
                    No bookings found.
                </td>
            </tr>
        `;
        return;
    }
    table.innerHTML = bookings.map(booking => `
        <tr>
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
            <td colspan="6" class="admin-table__loading">
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
                <td colspan="6" class="admin-table__empty">
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
    const messages =
        selectedStatus === "all"
            ? allMessages
            : allMessages.filter(
                message => message.status === selectedStatus
            );
    if (!messages.length) {
        table.innerHTML = `
            <tr>
                <td colspan="6" class="admin-table__empty">
                    No messages found.
                </td>
            </tr>
        `;
        return;
    }
    table.innerHTML = messages.map(message => `
        <tr>
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
                message => message.status === "unread"
            ).length;
    }
}
/* ==================================================
   FILTERS
================================================== */
document
    .getElementById("bookingFilter")
    ?.addEventListener("change", renderBookings);
document
    .getElementById("messageFilter")
    ?.addEventListener("change", renderMessages);
/* ==================================================
   STATUS EVENTS
================================================== */
document.addEventListener("change", event => {
    const bookingSelect =
        event.target.closest("[data-booking-status]");
    if (bookingSelect) {
        updateBookingStatus(
            bookingSelect.dataset.bookingStatus,
            bookingSelect.value
        );
        return;
    }
    const messageSelect =
        event.target.closest("[data-message-status]");
    if (messageSelect) {
        updateMessageStatus(
            messageSelect.dataset.messageStatus,
            messageSelect.value
        );
    }
});
/* ==================================================
   REFRESH
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
        "unread",
        "read",
        "replied"
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
    await Promise.all([
        loadBookings(),
        loadMessages()
    ]);
});
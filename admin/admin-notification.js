/* ==================================================
   WINICIOUS ADMIN NOTIFICATIONS
================================================== */

/* ==================================================
   SUPABASE CLIENT
================================================== */

const notificationSupabase = supabaseClient;


/* ==================================================
   DOM ELEMENTS
================================================== */

const notificationButton =
    document.getElementById(
        "notificationButton"
    );

const notificationBadge =
    document.getElementById(
        "notificationBadge"
    );

const notificationPanel =
    document.getElementById(
        "notificationPanel"
    );

const notificationList =
    document.getElementById(
        "notificationList"
    );

const markNotificationsRead =
    document.getElementById(
        "markNotificationsRead"
    );

const closeNotifications =
    document.getElementById(
        "closeNotifications"
    );


/* ==================================================
   NOTIFICATION DATA
================================================== */

let notifications = [];


/* ==================================================
   FORMAT DATE
================================================== */

function formatNotificationDate(date) {

    return new Intl.DateTimeFormat(
        "en-NG",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    ).format(
        new Date(date)
    );
}


/* ==================================================
   ESCAPE HTML
================================================== */

function escapeNotificationHTML(value) {

    return String(
        value ?? ""
    )
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* ==================================================
   GET NOTIFICATION ICON
================================================== */

function getNotificationIcon(type) {

    switch (type) {

        case "order":
            return "🛍️";

        case "payment":
            return "💳";

        case "booking":
            return "📅";

        case "contact":
            return "💬";

        default:
            return "🔔";
    }
}


/* ==================================================
   UPDATE BADGE
================================================== */

function updateNotificationBadge() {

    const unreadCount =
        notifications.filter(
            notification =>
                !notification.is_read
        ).length;


    if (!notificationBadge) {
        return;
    }


    if (unreadCount === 0) {

        notificationBadge.hidden =
            true;

        return;
    }


    notificationBadge.textContent =
        unreadCount > 99
            ? "99+"
            : unreadCount;


    notificationBadge.hidden =
        false;
}


/* ==================================================
   RENDER NOTIFICATIONS
================================================== */

function renderNotifications() {

    if (!notificationList) {
        return;
    }


    if (!notifications.length) {

        notificationList.innerHTML = `
            <p class="notification-empty">
                No notifications yet.
            </p>
        `;

        updateNotificationBadge();

        return;
    }


    notificationList.innerHTML =
        notifications
            .map(notification => {

                return `
                    <div
                        class="
                            notification-item
                            ${
                                notification.is_read
                                    ? ""
                                    : "notification-item--unread"
                            }
                        "
                    >

                        <div class="notification-item__icon">
                            ${getNotificationIcon(
                                notification.type
                            )}
                        </div>

                        <div class="notification-item__content">

                            <strong>
                                ${escapeNotificationHTML(
                                    notification.title
                                )}
                            </strong>

                            <p>
                                ${escapeNotificationHTML(
                                    notification.message
                                )}
                            </p>

                            <small>
                                ${formatNotificationDate(
                                    notification.created_at
                                )}
                            </small>

                        </div>

                    </div>
                `;

            })
            .join("");


    updateNotificationBadge();
}


/* ==================================================
   LOAD NOTIFICATIONS
================================================== */

async function loadNotifications() {

    const {
        data,
        error
    } =
        await notificationSupabase
            .from("notifications")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            )
            .limit(30);


    if (error) {

        console.error(
            "Could not load notifications:",
            error
        );

        return;
    }


    notifications =
        data || [];


    renderNotifications();
}


/* ==================================================
   SHOW LIVE TOAST
================================================== */

function showNotificationToast(
    notification
) {

    const existingToast =
        document.querySelector(
            ".notification-toast"
        );


    if (existingToast) {
        existingToast.remove();
    }


    const toast =
        document.createElement(
            "div"
        );


    toast.className =
        "notification-toast";


    toast.innerHTML = `

        <div class="notification-toast__icon">

            ${getNotificationIcon(
                notification.type
            )}

        </div>

        <div class="notification-toast__content">

            <strong>
                ${escapeNotificationHTML(
                    notification.title
                )}
            </strong>

            <p>
                ${escapeNotificationHTML(
                    notification.message
                )}
            </p>

        </div>

        <button
            type="button"
            class="notification-toast__close"
            aria-label="Close notification"
        >
            ×
        </button>

    `;


    document.body.appendChild(
        toast
    );


    const closeButton =
        toast.querySelector(
            ".notification-toast__close"
        );


    closeButton?.addEventListener(
        "click",
        () => {

            toast.remove();

        }
    );


    setTimeout(() => {

        if (toast.isConnected) {

            toast.remove();

        }

    }, 7000);
}


/* ==================================================
   PLAY NOTIFICATION SOUND
================================================== */

function playNotificationSound() {

    try {

        const audio =
            new Audio(
                "sounds/notification.mp3"
            );

        audio.volume =
            0.5;

        audio.play().catch(() => {

            /*
             * Browsers can block automatic
             * audio until the admin interacts
             * with the page.
             */

        });

    } catch (error) {

        console.log(
            "Notification sound unavailable."
        );

    }

}


/* ==================================================
   REALTIME SUBSCRIPTION
================================================== */

const notificationChannel =
    notificationSupabase
        .channel(
            "winicious-admin-notifications"
        )
        .on(
            "postgres_changes",
            {
                event: "INSERT",
                schema: "public",
                table: "notifications"
            },
            (payload) => {

                console.log(
                    "🔔 New notification received:",
                    payload.new
                );


                notifications.unshift(
                    payload.new
                );


                notifications =
                    notifications.slice(
                        0,
                        30
                    );


                renderNotifications();


                showNotificationToast(
                    payload.new
                );


                playNotificationSound();

            }
        )
        .subscribe(
            (status) => {

                console.log(
                    "🔔 Notification realtime:",
                    status
                );


                if (
                    status === "SUBSCRIBED"
                ) {

                    console.log(
                        "✅ Live notifications connected."
                    );

                }

            }
        );


/* ==================================================
   OPEN NOTIFICATIONS
================================================== */

notificationButton?.addEventListener(
    "click",
    (event) => {

        event.stopPropagation();

        if (!notificationPanel) {
            return;
        }


        const shouldOpen =
            notificationPanel.hidden;


        notificationPanel.hidden =
            !shouldOpen;


        notificationButton.setAttribute(
            "aria-expanded",
            String(shouldOpen)
        );

    }
);


/* ==================================================
   CLOSE NOTIFICATIONS
================================================== */

closeNotifications?.addEventListener(
    "click",
    (event) => {

        event.stopPropagation();

        if (!notificationPanel) {
            return;
        }


        notificationPanel.hidden =
            true;


        notificationButton?.setAttribute(
            "aria-expanded",
            "false"
        );

    }
);


/* ==================================================
   CLOSE WHEN CLICKING OUTSIDE
================================================== */

document.addEventListener(
    "click",
    (event) => {

        if (!notificationPanel) {
            return;
        }


        if (
            notificationPanel.hidden
        ) {
            return;
        }


        const clickedInsideNotifications =
            event.target.closest(
                ".admin-notifications"
            );


        if (
            !clickedInsideNotifications
        ) {

            notificationPanel.hidden =
                true;


            notificationButton?.setAttribute(
                "aria-expanded",
                "false"
            );

        }

    }
);


/* ==================================================
   MARK ALL AS READ
================================================== */

markNotificationsRead?.addEventListener(
    "click",
    async () => {

        const {
            error
        } =
            await notificationSupabase
                .from("notifications")
                .update({
                    is_read: true
                })
                .eq(
                    "is_read",
                    false
                );


        if (error) {

            console.error(
                "Could not mark notifications as read:",
                error
            );

            return;
        }


        notifications =
            notifications.map(
                notification => ({
                    ...notification,
                    is_read: true
                })
            );


        renderNotifications();

    }
);


/* ==================================================
   INITIAL LOAD
================================================== */

loadNotifications();
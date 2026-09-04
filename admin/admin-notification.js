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

    /* ----------------------------------------------
       Remove an existing toast
    ---------------------------------------------- */

    const existingToast =
        document.querySelector(
            ".notification-toast"
        );


    if (existingToast) {
        existingToast.remove();
    }


    /* ----------------------------------------------
       Create toast
    ---------------------------------------------- */

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


    /* ----------------------------------------------
       Close button
    ---------------------------------------------- */

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


    /* ----------------------------------------------
       Automatically disappear
    ---------------------------------------------- */

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


                /* ----------------------------------
                   Add new notification to beginning
                ---------------------------------- */

                notifications.unshift(
                    payload.new
                );


                /* ----------------------------------
                   Keep only newest 30
                ---------------------------------- */

                notifications =
                    notifications.slice(
                        0,
                        30
                    );


                /* ----------------------------------
                   Update dashboard
                ---------------------------------- */

                renderNotifications();


                /* ----------------------------------
                   Show popup
                ---------------------------------- */

                showNotificationToast(
                    payload.new
                );


                /* ----------------------------------
                   Play sound
                ---------------------------------- */

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
   OPEN / CLOSE NOTIFICATIONS
================================================== */

notificationButton?.addEventListener(
    "click",
    () => {

        if (!notificationPanel) {
            return;
        }


        notificationPanel.hidden =
            !notificationPanel.hidden;

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
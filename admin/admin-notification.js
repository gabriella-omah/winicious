/* ==================================================
   WINICIOUS ADMIN NOTIFICATIONS
================================================== */


/* ==================================================
   SUPABASE CLIENT
================================================== */

const notificationSupabase =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


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
   FORMAT DATE
================================================== */

function formatNotificationDate(
    date
) {

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


    renderNotifications(
        data || []
    );
}


/* ==================================================
   RENDER NOTIFICATIONS
================================================== */

function renderNotifications(
    notifications
) {

    if (!notificationList) {
        return;
    }


    /* ------------------------------------------------
       No notifications
    ------------------------------------------------ */

    if (!notifications.length) {

        notificationList.innerHTML = `
            <p class="notification-empty">
                No notifications yet.
            </p>
        `;


        updateNotificationBadge(
            0
        );

        return;
    }


    /* ------------------------------------------------
       Count unread notifications
    ------------------------------------------------ */

    const unreadCount =
        notifications.filter(
            notification =>
                !notification.is_read
        ).length;


    updateNotificationBadge(
        unreadCount
    );


    /* ------------------------------------------------
       Display notifications
    ------------------------------------------------ */

    notificationList.innerHTML =
        notifications
            .map(
                notification => {

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

                }
            )
            .join("");
}


/* ==================================================
   NOTIFICATION BADGE
================================================== */

function updateNotificationBadge(
    count
) {

    if (!notificationBadge) {
        return;
    }


    if (count <= 0) {

        notificationBadge.hidden =
            true;

        return;
    }


    notificationBadge.textContent =
        count > 99
            ? "99+"
            : count;


    notificationBadge.hidden =
        false;
}


/* ==================================================
   NOTIFICATION ICONS
================================================== */

function getNotificationIcon(
    type
) {

    switch (type) {

        case "order":
            return "🛍️";

        case "payment":
            return "💳";

        case "booking":
            return "📅";

        case "contact":
            return "💬";

        case "test":
            return "🔔";

        default:
            return "🔔";
    }
}


/* ==================================================
   ESCAPE HTML
================================================== */

function escapeNotificationHTML(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


/* ==================================================
   OPEN / CLOSE NOTIFICATION PANEL
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


        await loadNotifications();
    }
);


/* ==================================================
   REALTIME
================================================== */

notificationSupabase
    .channel(
        "winicious-notifications"
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
                "New notification:",
                payload.new
            );


            loadNotifications();
        }
    )
    .subscribe(
        (status) => {

            console.log(
                "Notification realtime status:",
                status
            );
        }
    );


/* ==================================================
   INITIAL LOAD
================================================== */

loadNotifications();
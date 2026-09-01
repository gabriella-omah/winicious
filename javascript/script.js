/* ==================================================
   WINICIOUS WEBSITE JAVASCRIPT
================================================== */

document.addEventListener("DOMContentLoaded", async () => {

    /* ==================================================
       LOAD PARTIAL
    ================================================== */

    async function loadPartial(elementId, filePath) {

        const element = document.getElementById(elementId);

        if (!element) {
            return;
        }

        try {

            const response = await fetch(filePath);

            if (!response.ok) {
                throw new Error(
                    `Could not load ${filePath}`
                );
            }

            element.innerHTML = await response.text();

        } catch (error) {

            console.error(error);

        }

    }


    /* ==================================================
       LOAD NAVBAR + FOOTER
    ================================================== */

    await loadPartial(
        "navbar-placeholder",
        "partials/navbar.html"
    );

    await loadPartial(
        "footer-placeholder",
        "partials/footer.html"
    );

/* ==================================================
   ACTIVE PAGE DETECTION
================================================== */
function setActiveNavigation() {
    /* Get the current page filename */
    let currentPage =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();
    /* If the URL has no filename,
       treat it as the homepage */
    if (
        currentPage === "" ||
        currentPage === "/"
    ) {
        currentPage = "index.html";
    }
    /* Find all desktop + mobile navigation links */
    const navigationLinks =
        document.querySelectorAll(
            ".navbar__links a, .mobile-menu__links a"
        );
    navigationLinks.forEach((link) => {
        /* Get the link's destination */
        const linkPage =
            link.getAttribute("href")
                ?.split("/")
                .pop()
                .toLowerCase();
        /* Remove any existing active state */
        link.classList.remove("active");
        link.removeAttribute("aria-current");
        /* Add active state to current page */
        if (linkPage === currentPage) {
            link.classList.add("active");
            link.setAttribute(
                "aria-current",
                "page"
            );
        }
    });
}
/* Run after navbar partial has loaded */
setActiveNavigation();

    /* ==================================================
       NAVBAR
    ================================================== */

    const menuButton =
        document.querySelector(".navbar__menu-btn");

    const mobileMenu =
        document.querySelector(".mobile-menu");

    const closeButton =
        document.querySelector(".mobile-menu__close");

    const overlay =
        document.querySelector(".mobile-menu__overlay");


    /* ==================================================
       OPEN MOBILE MENU
    ================================================== */

    function openMenu() {

        if (!mobileMenu || !overlay) {
            return;
        }

        mobileMenu.classList.add("is-open");

        overlay.classList.add("is-visible");

        document.body.classList.add("menu-open");

        mobileMenu.setAttribute(
            "aria-hidden",
            "false"
        );

        if (menuButton) {

            menuButton.setAttribute(
                "aria-expanded",
                "true"
            );

        }

    }


    /* ==================================================
       CLOSE MOBILE MENU
    ================================================== */

    function closeMenu() {

        if (!mobileMenu || !overlay) {
            return;
        }

        mobileMenu.classList.remove("is-open");

        overlay.classList.remove("is-visible");

        document.body.classList.remove("menu-open");

        mobileMenu.setAttribute(
            "aria-hidden",
            "true"
        );

        if (menuButton) {

            menuButton.setAttribute(
                "aria-expanded",
                "false"
            );

        }

    }


    /* ==================================================
       MENU EVENTS
    ================================================== */

    if (menuButton) {
        menuButton.addEventListener(
            "click",
            openMenu
        );
    }


    if (closeButton) {
        closeButton.addEventListener(
            "click",
            closeMenu
        );
    }


    if (overlay) {
        overlay.addEventListener(
            "click",
            closeMenu
        );
    }


    /* ==================================================
       CLOSE MENU WHEN LINK IS CLICKED
    ================================================== */

    const mobileLinks =
        document.querySelectorAll(
            ".mobile-menu__links a"
        );

    mobileLinks.forEach((link) => {

        link.addEventListener(
            "click",
            closeMenu
        );

    });


    /* ==================================================
       ESCAPE KEY
    ================================================== */

    document.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Escape") {
                closeMenu();
            }

        }
    );


    /* ==================================================
       SHRINK NAVBAR ON SCROLL
    ================================================== */

    const siteHeader =
        document.querySelector(".site-header");


    function handleNavbarScroll() {

        if (!siteHeader) {
            return;
        }


        if (window.scrollY > 70) {

            siteHeader.classList.add(
                "header--scrolled"
            );

        } else {

            siteHeader.classList.remove(
                "header--scrolled"
            );

        }

    }


    window.addEventListener(
        "scroll",
        handleNavbarScroll,
        { passive: true }
    );


    /* Run once immediately */

    handleNavbarScroll();


    /* ==================================================
       BACK TO TOP
    ================================================== */

    const backToTop =
        document.querySelector(".back-to-top");


    if (backToTop) {

        function handleBackToTop() {

            if (window.scrollY > 400) {

                backToTop.classList.add(
                    "is-visible"
                );

            } else {

                backToTop.classList.remove(
                    "is-visible"
                );

            }

        }


        window.addEventListener(
            "scroll",
            handleBackToTop,
            { passive: true }
        );


        handleBackToTop();


        backToTop.addEventListener(
            "click",
            () => {

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }
        );

    }

});


/* ==================================================
   WINICIOUS GALLERY
   FILTERS + LIGHTBOX
================================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* ==================================================
       ELEMENTS
    ================================================== */

    const galleryGrid =
        document.querySelector("#galleryGrid");

    const galleryCards =
        galleryGrid
            ? Array.from(
                galleryGrid.querySelectorAll(".gallery-card")
            )
            : [];

    const filterButtons =
        Array.from(
            document.querySelectorAll(".gallery-filter")
        );

    const lightbox =
        document.querySelector("#galleryLightbox");

    const lightboxImage =
        document.querySelector("#lightboxImage");

    const lightboxTitle =
        document.querySelector("#lightboxTitle");

    const lightboxCategory =
        document.querySelector("#lightboxCategory");

    const closeButtons =
        document.querySelectorAll("[data-lightbox-close]");

    const previousButton =
        document.querySelector("[data-lightbox-prev]");

    const nextButton =
        document.querySelector("[data-lightbox-next]");


    /* ==================================================
       SAFETY CHECK
    ================================================== */

    if (
        !galleryGrid ||
        !galleryCards.length ||
        !lightbox ||
        !lightboxImage
    ) {
        return;
    }


    /* ==================================================
       STATE
    ================================================== */

    let currentFilter = "all";

    let filteredCards = [...galleryCards];

    let currentIndex = 0;

    let lastFocusedElement = null;


    /* ==================================================
       CATEGORY LABELS
    ================================================== */

    const categoryLabels = {
        installation: "Installation",
        braiding: "Braiding",
        styling: "Styling",
        wigs: "Wigs",
        nails: "Nails",
        lashes: "Lashes",
        beauty: "Beauty"
    };


    /* ==================================================
       FILTER GALLERY
    ================================================== */

    function filterGallery(category) {

        currentFilter = category;

        /* ----------------------------------------------
           Update active filter button
        ---------------------------------------------- */

        filterButtons.forEach((button) => {

            const isActive =
                button.dataset.filter === category;

            button.classList.toggle(
                "is-active",
                isActive
            );

            button.setAttribute(
                "aria-selected",
                String(isActive)
            );

        });


        /* ----------------------------------------------
           Determine visible cards
        ---------------------------------------------- */

        filteredCards = galleryCards.filter((card) => {

            if (category === "all") {
                return true;
            }

            return card.dataset.category === category;

        });


        /* ----------------------------------------------
           Show / hide cards
        ---------------------------------------------- */

        galleryCards.forEach((card) => {

            const shouldShow =
                filteredCards.includes(card);

            card.classList.remove(
                "is-visible"
            );

            if (shouldShow) {

                card.classList.remove(
                    "is-hidden"
                );

                /*
                   Force animation to restart cleanly.
                */

                requestAnimationFrame(() => {
                    card.classList.add(
                        "is-visible"
                    );
                });

            } else {

                card.classList.add(
                    "is-hidden"
                );

            }

        });

    }


    /* ==================================================
       FILTER BUTTON EVENTS
    ================================================== */

    filterButtons.forEach((button) => {

        button.addEventListener(
            "click",
            () => {

                const category =
                    button.dataset.filter;

                if (!category) {
                    return;
                }

                filterGallery(category);

            }
        );

    });


    /* ==================================================
       GET CARD DATA
    ================================================== */

    function getCardData(card) {

        return {
            image:
                card.dataset.image ||
                card.querySelector("img")?.src ||
                "",

            title:
                card.dataset.title ||
                card.querySelector("img")?.alt ||
                "Gallery Image",

            category:
                card.dataset.category ||
                "beauty"
        };

    }


    /* ==================================================
       OPEN LIGHTBOX
    ================================================== */

    function openLightbox(card) {

        if (!card) {
            return;
        }

        const index =
            filteredCards.indexOf(card);

        if (index === -1) {
            return;
        }

        currentIndex = index;

        lastFocusedElement =
            document.activeElement;

        updateLightbox();

        lightbox.classList.add(
            "is-open"
        );

        lightbox.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add(
            "gallery-lightbox-open"
        );

        /*
           Focus the close button for keyboard users.
        */

        const closeButton =
            lightbox.querySelector(
                ".gallery-lightbox__close"
            );

        if (closeButton) {
            closeButton.focus();
        }

    }


    /* ==================================================
       UPDATE LIGHTBOX
    ================================================== */

    function updateLightbox() {

        if (!filteredCards.length) {
            return;
        }

        const card =
            filteredCards[currentIndex];

        if (!card) {
            return;
        }

        const data =
            getCardData(card);


        /* ----------------------------------------------
           Image
        ---------------------------------------------- */

        lightboxImage.src =
            data.image;

        lightboxImage.alt =
            data.title;


        /* ----------------------------------------------
           Title
        ---------------------------------------------- */

        if (lightboxTitle) {

            lightboxTitle.textContent =
                data.title;

        }


        /* ----------------------------------------------
           Category
        ---------------------------------------------- */

        if (lightboxCategory) {

            lightboxCategory.textContent =
                categoryLabels[data.category] ||
                "Gallery";

        }

    }


    /* ==================================================
       CLOSE LIGHTBOX
    ================================================== */

    function closeLightbox() {

        lightbox.classList.remove(
            "is-open"
        );

        lightbox.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.classList.remove(
            "gallery-lightbox-open"
        );

        /*
           Clear image after the close animation
           so an old image doesn't remain loaded.
        */

        window.setTimeout(() => {

            if (
                !lightbox.classList.contains(
                    "is-open"
                )
            ) {

                lightboxImage.src = "";

            }

        }, 300);


        /*
           Return focus to the image that opened
           the lightbox.
        */

        if (
            lastFocusedElement &&
            typeof lastFocusedElement.focus === "function"
        ) {

            lastFocusedElement.focus();

        }

    }


    /* ==================================================
       NEXT IMAGE
    ================================================== */

    function showNextImage() {

        if (!filteredCards.length) {
            return;
        }

        currentIndex =
            (currentIndex + 1) %
            filteredCards.length;

        updateLightbox();

    }


    /* ==================================================
       PREVIOUS IMAGE
    ================================================== */

    function showPreviousImage() {

        if (!filteredCards.length) {
            return;
        }

        currentIndex =
            (currentIndex - 1 +
                filteredCards.length) %
            filteredCards.length;

        updateLightbox();

    }


    /* ==================================================
       GALLERY CARD EVENTS
    ================================================== */

    galleryCards.forEach((card) => {

        card.addEventListener(
            "click",
            () => {

                openLightbox(card);

            }
        );

    });


    /* ==================================================
       CLOSE EVENTS
    ================================================== */

    closeButtons.forEach((button) => {

        button.addEventListener(
            "click",
            closeLightbox
        );

    });


    /* ==================================================
       PREVIOUS / NEXT
    ================================================== */

    if (previousButton) {

        previousButton.addEventListener(
            "click",
            showPreviousImage
        );

    }

    if (nextButton) {

        nextButton.addEventListener(
            "click",
            showNextImage
        );

    }


    /* ==================================================
       KEYBOARD CONTROLS
    ================================================== */

    document.addEventListener(
        "keydown",
        (event) => {

            /*
               Escape closes lightbox
            */

            if (
                event.key === "Escape" &&
                lightbox.classList.contains("is-open")
            ) {

                closeLightbox();

                return;

            }


            /*
               Arrow keys navigate images
            */

            if (
                !lightbox.classList.contains(
                    "is-open"
                )
            ) {
                return;
            }


            if (event.key === "ArrowRight") {

                event.preventDefault();

                showNextImage();

            }


            if (event.key === "ArrowLeft") {

                event.preventDefault();

                showPreviousImage();

            }

        }
    );


    /* ==================================================
       TOUCH SWIPE
    ================================================== */

    let touchStartX = 0;
    let touchEndX = 0;


    lightbox.addEventListener(
        "touchstart",
        (event) => {

            touchStartX =
                event.changedTouches[0].screenX;

        },
        {
            passive: true
        }
    );


    lightbox.addEventListener(
        "touchend",
        (event) => {

            touchEndX =
                event.changedTouches[0].screenX;

            handleSwipe();

        },
        {
            passive: true
        }
    );


    function handleSwipe() {

        const swipeDistance =
            touchEndX - touchStartX;

        /*
           Ignore tiny movements.
        */

        if (
            Math.abs(swipeDistance) < 50
        ) {
            return;
        }


        if (swipeDistance < 0) {

            showNextImage();

        } else {

            showPreviousImage();

        }

    }


    /* ==================================================
       INITIAL STATE
    ================================================== */

    filterGallery("all");

});
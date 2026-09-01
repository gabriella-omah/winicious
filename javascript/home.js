/* ==================================================
   WINICIOUS HOMEPAGE JAVASCRIPT
================================================== */
document.addEventListener("DOMContentLoaded", () => {
    initHairCarousel();
    initGalleryLightbox();
    initProductModal();
    initTestimonials();
});
/* ==================================================
   HAIR CAROUSEL
================================================== */
function initHairCarousel() {
    const carousel = document.querySelector(".hair-carousel");
    const track = document.querySelector(".hair-carousel__track");
    if (!carousel || !track) return;
    const originalCards = Array.from(
        track.querySelectorAll(".hair-card")
    );
    if (originalCards.length < 2) return;
    /* ----------------------------------------------
       Respect reduced motion
    ---------------------------------------------- */
    const prefersReducedMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;
    if (prefersReducedMotion) return;
    /* ----------------------------------------------
       Clone cards for continuous movement
    ---------------------------------------------- */
    originalCards.forEach((card) => {
        const clone = card.cloneNode(true);
        clone.setAttribute(
            "aria-hidden",
            "true"
        );
        track.appendChild(clone);
    });
    let position = 0;
    let isPaused = false;
    let isDragging = false;
    const speed = 0.35;
    let animationFrame;
    /* ----------------------------------------------
       Calculate half of duplicated track
    ---------------------------------------------- */
    function getResetPoint() {
        return track.scrollWidth / 2;
    }
    /* ----------------------------------------------
       Animation
    ---------------------------------------------- */
    function animate() {
        if (!isPaused && !isDragging) {
            position += speed;
            if (position >= getResetPoint()) {
                position = 0;
            }
            track.style.transform =
                `translate3d(-${position}px, 0, 0)`;
        }
        animationFrame =
            requestAnimationFrame(animate);
    }
    animate();
    /* ----------------------------------------------
       Pause on hover
    ---------------------------------------------- */
    carousel.addEventListener(
        "mouseenter",
        () => {
            isPaused = true;
        }
    );
    carousel.addEventListener(
        "mouseleave",
        () => {
            if (!isDragging) {
                isPaused = false;
            }
        }
    );
    /* ----------------------------------------------
       Touch / drag pause
    ---------------------------------------------- */
    carousel.addEventListener(
        "pointerdown",
        () => {
            isDragging = true;
            isPaused = true;
            carousel.classList.add(
                "is-dragging"
            );
        }
    );
    carousel.addEventListener(
        "pointerup",
        () => {
            isDragging = false;
            carousel.classList.remove(
                "is-dragging"
            );
            isPaused = false;
        }
    );
    carousel.addEventListener(
        "pointercancel",
        () => {
            isDragging = false;
            carousel.classList.remove(
                "is-dragging"
            );
            isPaused = false;
        }
    );
}
/* ==================================================
   GALLERY LIGHTBOX
================================================== */
function initGalleryLightbox() {
    const items =
        Array.from(
            document.querySelectorAll(
                ".gallery-item"
            )
        );
    const lightbox =
        document.getElementById(
            "gallery-lightbox"
        );
    const image =
        document.getElementById(
            "gallery-lightbox-image"
        );
    const closeButton =
        document.getElementById(
            "gallery-lightbox-close"
        );
    const previousButton =
        document.getElementById(
            "gallery-lightbox-prev"
        );
    const nextButton =
        document.getElementById(
            "gallery-lightbox-next"
        );
    if (
        !items.length ||
        !lightbox ||
        !image
    ) {
        return;
    }
    let currentIndex = 0;
    /* ----------------------------------------------
       Show image
    ---------------------------------------------- */
    function showImage(index) {
        if (index < 0) {
            index = items.length - 1;
        }
        if (index >= items.length) {
            index = 0;
        }
        currentIndex = index;
        const item = items[currentIndex];
        const imageSource =
            item.dataset.galleryImage;
        const imageAlt =
            item.dataset.galleryAlt || "";
        image.src = imageSource;
        image.alt = imageAlt;
    }
    /* ----------------------------------------------
       Open
    ---------------------------------------------- */
    function openLightbox(index) {
        showImage(index);
        lightbox.classList.add("is-open");
        lightbox.setAttribute(
            "aria-hidden",
            "false"
        );
        document.body.style.overflow = "hidden";
    }
    /* ----------------------------------------------
       Close
    ---------------------------------------------- */
    function closeLightbox() {
        lightbox.classList.remove(
            "is-open"
        );
        lightbox.setAttribute(
            "aria-hidden",
            "true"
        );
        document.body.style.overflow = "";
    }
    /* ----------------------------------------------
       Gallery item clicks
    ---------------------------------------------- */
    items.forEach((item, index) => {
        item.addEventListener(
            "click",
            () => {
                openLightbox(index);
            }
        );
    });
    /* ----------------------------------------------
       Previous / next
    ---------------------------------------------- */
    previousButton?.addEventListener(
        "click",
        () => {
            showImage(currentIndex - 1);
        }
    );
    nextButton?.addEventListener(
        "click",
        () => {
            showImage(currentIndex + 1);
        }
    );
    /* ----------------------------------------------
       Close
    ---------------------------------------------- */
    closeButton?.addEventListener(
        "click",
        closeLightbox
    );
    lightbox.addEventListener(
        "click",
        (event) => {
            if (
                event.target === lightbox
            ) {
                closeLightbox();
            }
        }
    );
    /* ----------------------------------------------
       Keyboard navigation
    ---------------------------------------------- */
    document.addEventListener(
        "keydown",
        (event) => {
            if (
                !lightbox.classList.contains(
                    "is-open"
                )
            ) {
                return;
            }
            if (event.key === "Escape") {
                closeLightbox();
            }
            if (event.key === "ArrowLeft") {
                showImage(currentIndex - 1);
            }
            if (event.key === "ArrowRight") {
                showImage(currentIndex + 1);
            }
        }
    );
}
/* ==================================================
   PRODUCT QUICK VIEW
================================================== */
function initProductModal() {
    const carousel = document.querySelector(".hair-carousel");
    const modal = document.getElementById("product-modal");
    const closeButton = document.getElementById("product-modal-close");
    const modalImage = document.getElementById("product-modal-image");
    const modalName = document.getElementById("product-modal-name");
    const modalDetails = document.getElementById("product-modal-details");
    const backdrop = modal?.querySelector(".product-modal__backdrop");

    if (!carousel || !modal) return;

    function openProduct(card) {
        const name =
            card.dataset.productName || "Hair";

        const details =
            card.dataset.productDetails || "";

        const image =
            card.dataset.productImage || "";

        modalName.textContent = name;
        modalDetails.textContent = details;

        modalImage.src = image;
        modalImage.alt = name;

        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");

        document.body.style.overflow = "hidden";
    }

    function closeProduct() {
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");

        document.body.style.overflow = "";
    }

    /*
       Event delegation means BOTH original
       and cloned cards work.
    */
    carousel.addEventListener("click", (event) => {
        const button = event.target.closest(
            ".hair-card__image"
        );

        if (!button) return;

        const card = button.closest(".hair-card");

        if (!card) return;

        openProduct(card);
    });

    closeButton?.addEventListener(
        "click",
        closeProduct
    );

    backdrop?.addEventListener(
        "click",
        closeProduct
    );

    document.addEventListener(
        "keydown",
        (event) => {
            if (
                event.key === "Escape" &&
                modal.classList.contains("is-open")
            ) {
                closeProduct();
            }
        }
    );
}
/* ==================================================
   TESTIMONIALS
================================================== */
/* ==================================================
   TESTIMONIALS
================================================== */

function initTestimonials() {

    const testimonials =
        Array.from(
            document.querySelectorAll(
                ".testimonial"
            )
        );

    const previousButton =
        document.querySelector(
            "[data-testimonial-prev]"
        );

    const nextButton =
        document.querySelector(
            "[data-testimonial-next]"
        );

    const counter =
        document.querySelector(
            ".testimonial-slider__count"
        );

    if (testimonials.length < 2) return;

    let currentIndex = 0;


    /* ----------------------------------------------
       Update counter
    ---------------------------------------------- */

    function updateCounter() {

        if (!counter) return;

        const current =
            String(currentIndex + 1)
                .padStart(2, "0");

        const total =
            String(testimonials.length)
                .padStart(2, "0");

        counter.textContent =
            `${current} / ${total}`;
    }


    /* ----------------------------------------------
       Show testimonial
    ---------------------------------------------- */

    function showTestimonial(index) {

        if (index < 0) {
            index = testimonials.length - 1;
        }

        if (
            index >= testimonials.length
        ) {
            index = 0;
        }

        currentIndex = index;

        testimonials.forEach(
            (testimonial, i) => {

                testimonial.classList.toggle(
                    "is-active",
                    i === currentIndex
                );

            }
        );

        updateCounter();
    }


    /* ----------------------------------------------
       Controls
    ---------------------------------------------- */

    previousButton?.addEventListener(
        "click",
        () => {

            showTestimonial(
                currentIndex - 1
            );

        }
    );


    nextButton?.addEventListener(
        "click",
        () => {

            showTestimonial(
                currentIndex + 1
            );

        }
    );


    /* ----------------------------------------------
       Automatic rotation
    ---------------------------------------------- */

    const prefersReducedMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;


    if (!prefersReducedMotion) {

        setInterval(
            () => {

                showTestimonial(
                    currentIndex + 1
                );

            },
            7000
        );

    }


    /* ----------------------------------------------
       Initial state
    ---------------------------------------------- */

    updateCounter();
}

document.addEventListener("click", (event) => {
    const card = event.target.closest(".hair-card");
    if (!card) return;

    // Only open modal when the image button is clicked
    if (!event.target.closest(".hair-card__image")) return;

    const id = card.dataset.productId;
    const name = card.dataset.productName;
    const details = card.dataset.productDetails;
    const image = card.dataset.productImage;

    const modal = document.getElementById("product-modal");
    const modalImage = document.getElementById("product-modal-image");
    const modalName = document.getElementById("product-modal-name");
    const modalDetails = document.getElementById("product-modal-details");
    const modalLink = document.getElementById("product-modal-link");

    if (!modal) return;

    modalImage.src = image;
    modalImage.alt = name;
    modalName.textContent = name;
    modalDetails.textContent = details;

    // Point View Product to the correct product page
    modalLink.href = id
        ? `product.html?id=${encodeURIComponent(id)}`
        : "shop.html";

    modal.classList.add("is-open"); // or whatever class you use
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
});
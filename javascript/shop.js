

/* ==================================================
   STORAGE
================================================== */
/* ==================================================
   STORAGE
================================================== */
const CART_KEY = "winicious_cart";
let cart = [];

function loadCart() {
    try {
        cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
        if (!Array.isArray(cart)) cart = [];
    } catch (e) {
        cart = [];
    }
}

function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

/* load immediately */
loadCart();
/* ==================================================
   HELPERS
================================================== */
function formatPrice(price) {
    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0
    }).format(price);
}

/* ==================================================
   PRODUCT CARD
================================================== */
function createProductCard(product) {
    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
        <div class="product-card__image">
            <img src="${product.image}" alt="${product.name}" loading="lazy">
            ${
                product.tag
                    ? `<span class="product-card__tag">${product.tag}</span>`
                    : ""
            }
            <button
                type="button"
                class="product-card__quick-add"
                data-add-product="${product.id}"
                aria-label="Add ${product.name} to cart"
            >
                <i class="fa-solid fa-plus"></i>
            </button>
        </div>
        <div class="product-card__body">
            <p class="product-card__category">${product.categoryLabel}</p>
            <h3 class="product-card__name">${product.name}</h3>
            <p class="product-card__price">${formatPrice(product.price)}</p>
        </div>
        <a
            href="product.html?id=${encodeURIComponent(product.id)}"
            class="product-card__link"
            aria-label="View ${product.name}"
        ></a>
    `;
    return card;
}

/* ==================================================
   RENDER PRODUCTS
================================================== */
function renderProducts(category = "all") {
    const grid = document.getElementById("productGrid");
    const empty = document.getElementById("shopEmpty");
    if (!grid) return;

    grid.innerHTML = "";

    const filtered =
        category === "all"
            ? products
            : products.filter((product) => product.category === category);

    if (!filtered.length) {
        if (empty) empty.hidden = false;
        return;
    }

    if (empty) empty.hidden = true;
    filtered.forEach((product) => grid.appendChild(createProductCard(product)));
}

/* ==================================================
   CATEGORY FILTERS
================================================== */
document.addEventListener("click", (event) => {
    const button = event.target.closest(".category-button");
    if (!button) return;

    document.querySelectorAll(".category-button").forEach((item) => {
        item.classList.remove("active");
    });
    button.classList.add("active");
    renderProducts(button.dataset.category);

    document.getElementById("shopProducts")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
});

document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter-category]");
    if (!button) return;

    const category = button.dataset.filterCategory;
    document.querySelector(`[data-category="${category}"]`)?.click();
});

/* ==================================================
   ADD / CHANGE / REMOVE CART
================================================== */
function addToCart(productId, quantity = 1) {
    const product = products.find((item) => item.id === productId);
    if (!product) return;

    const existing = cart.find((item) => item.id === productId);
    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({ id: productId, quantity });
    }

    saveCart();
    updateCartUI();
    openCartDrawer();
}

function changeCartQuantity(productId, change) {
    const item = cart.find((cartItem) => cartItem.id === productId);
    if (!item) return;

    item.quantity += change;
    if (item.quantity <= 0) {
        cart = cart.filter((cartItem) => cartItem.id !== productId);
    }

    saveCart();
    updateCartUI();
}

function removeFromCart(productId) {
    cart = cart.filter((item) => item.id !== productId);
    saveCart();
    updateCartUI();
}

/* ==================================================
   CART UI
================================================== */
function updateCartUI() {
    const cartItems = document.getElementById("cartItems");
    const cartEmpty = document.getElementById("cartEmpty");
    const cartFooter = document.getElementById("cartFooter");
    const cartCount = document.getElementById("cartCount");
    const cartSubtotal = document.getElementById("cartSubtotal");

    const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

    /* Badge — always try to update */
    if (cartCount) {
        if (totalQuantity > 0) {
            cartCount.hidden = false;
            cartCount.textContent = totalQuantity > 9 ? "9+" : String(totalQuantity);
        } else {
            cartCount.hidden = true;
            cartCount.textContent = "0";
        }
    }

    if (!cartItems) return;

    cartItems.innerHTML = "";

    if (!cart.length) {
        if (cartEmpty) cartEmpty.hidden = false;
        if (cartFooter) cartFooter.hidden = true;
        return;
    }

    if (cartEmpty) cartEmpty.hidden = true;
    if (cartFooter) cartFooter.hidden = false;

    let subtotal = 0;

    cart.forEach((item) => {
        const product = products.find((p) => p.id === item.id);
        if (!product) return;

        subtotal += product.price * item.quantity;

        const element = document.createElement("div");
        element.className = "cart-item";
        element.innerHTML = `
            <img class="cart-item__image" src="${product.image}" alt="${product.name}">
            <div>
                <h3 class="cart-item__name">${product.name}</h3>
                <p class="cart-item__price">${formatPrice(product.price)}</p>
                <div class="cart-item__quantity">
                    <button type="button" data-cart-minus="${product.id}">−</button>
                    <span>${item.quantity}</span>
                    <button type="button" data-cart-plus="${product.id}">+</button>
                </div>
            </div>
            <button
                type="button"
                class="cart-item__remove"
                data-cart-remove="${product.id}"
                aria-label="Remove ${product.name}"
            >
                <i class="fa-solid fa-xmark"></i>
            </button>
        `;
        cartItems.appendChild(element);
    });

    if (cartSubtotal) {
        cartSubtotal.textContent = formatPrice(subtotal);
    }
}

/* ==================================================
   CART EVENTS
================================================== */
document.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-add-product]");
    if (addButton) {
        event.preventDefault();
        addToCart(addButton.dataset.addProduct);
        return;
    }

    const plus = event.target.closest("[data-cart-plus]");
    if (plus) {
        changeCartQuantity(plus.dataset.cartPlus, 1);
        return;
    }

    const minus = event.target.closest("[data-cart-minus]");
    if (minus) {
        changeCartQuantity(minus.dataset.cartMinus, -1);
        return;
    }

    const remove = event.target.closest("[data-cart-remove]");
    if (remove) {
        removeFromCart(remove.dataset.cartRemove);
    }
});

/* ==================================================
   CART DRAWER
================================================== */
const cartDrawer = document.getElementById("cartDrawer");

/* ==================================================
   CART DRAWER
================================================== */

function openCartDrawer() {
    const drawer = document.getElementById("cartDrawer");
    if (!drawer) return;

    loadCart();      // read latest from localStorage
    updateCartUI();  // rebuild list + badge

    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
}

document.addEventListener("DOMContentLoaded", () => {
    loadCart();
    renderProducts();
    renderProductPage();
    updateCartUI();
    calculateDeliveryDate("deliveryDate");

    /* navbar may inject a bit later */
    setTimeout(() => {
        loadCart();
        updateCartUI();
    }, 300);
});

function closeCartDrawer() {
    const drawer = document.getElementById("cartDrawer");
    if (!drawer) return;
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}

/* Event delegation — works even if navbar is injected later */
document.addEventListener("click", (event) => {

    // Open cart
    if (event.target.closest("#openCart")) {
        event.preventDefault();
        openCartDrawer();
        return;
    }


    // Close cart
    if (
        event.target.closest("#closeCart") ||
        event.target.closest("#closeCartButton")
    ) {
        event.preventDefault();
        closeCartDrawer();
        return;
    }


    // Continue shopping
    if (
        event.target.closest("#continueShopping") ||
        event.target.closest("#continueShoppingEmpty")
    ) {
        closeCartDrawer();
        return;
    }


    // Checkout
    if (event.target.closest("#checkoutButton")) {

        event.preventDefault();

        if (!cart.length) {
            alert("Your shopping bag is empty.");
            return;
        }

        window.location.href = "checkout.html";

        return;
    }

});

document.addEventListener("keydown", (event) => {
    const drawer = document.getElementById("cartDrawer");
    if (event.key === "Escape" && drawer?.classList.contains("is-open")) {
        closeCartDrawer();
    }
});
document.getElementById("closeCart")?.addEventListener("click", closeCartDrawer);
document.getElementById("closeCartButton")?.addEventListener("click", closeCartDrawer);
document.getElementById("continueShopping")?.addEventListener("click", closeCartDrawer);
document.getElementById("continueShoppingEmpty")?.addEventListener("click", closeCartDrawer);

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && cartDrawer?.classList.contains("is-open")) {
        closeCartDrawer();
    }
});

/* ==================================================
   PRODUCT PAGE
================================================== */
function getProductFromURL() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    return products.find((product) => product.id === id);
}

function createStars(rating) {
    const rounded = Math.round(rating);
    let html = "";
    for (let i = 1; i <= 5; i++) {
        html +=
            i <= rounded
                ? '<i class="fa-solid fa-star"></i>'
                : '<i class="fa-regular fa-star"></i>';
    }
    return html;
}

function renderProductPage() {
    const container = document.getElementById("productDetail");
    if (!container) return;

    const product = getProductFromURL();

    if (!product) {
        container.innerHTML = `
            <div class="product-not-found">
                <p class="eyebrow">PRODUCT</p>
                <h1>We couldn't find that product.</h1>
                <a href="shop.html" class="btn btn--primary">Back To Shop</a>
            </div>
        `;
        return;
    }

    document.title = `${product.name} | Winicious`;

    const breadcrumb = document.getElementById("breadcrumbProduct");
    if (breadcrumb) breadcrumb.textContent = product.name;

    container.innerHTML = `
        <div class="product-gallery">
            <div class="product-gallery__thumbs">
                ${product.gallery
                    .map(
                        (image, index) => `
                    <button
                        type="button"
                        class="product-gallery__thumb ${index === 0 ? "active" : ""}"
                        data-gallery-image="${image}"
                    >
                        <img src="${image}" alt="${product.name} view ${index + 1}">
                    </button>
                `
                    )
                    .join("")}
            </div>
            <div class="product-gallery__main">
                <img id="mainProductImage" src="${product.gallery[0]}" alt="${product.name}">
            </div>
        </div>
        <div class="product-copy">
            <p class="product-copy__category">${product.categoryLabel}</p>
            <h1>${product.name}</h1>
            <div class="product-copy__rating">
                <div class="stars">${createStars(product.rating)}</div>
                <span class="rating-count">
                    ${product.rating.toFixed(1)} · ${product.reviews.length} reviews
                </span>
            </div>
            <p class="product-copy__price">${formatPrice(product.price)}</p>
            <p class="product-copy__description">${product.description}</p>
            <div class="purchase-box">
                <div class="purchase-row">
                    <div class="quantity-control">
                        <button type="button" id="quantityMinus">−</button>
                        <span id="quantityValue">1</span>
                        <button type="button" id="quantityPlus">+</button>
                    </div>
                    <button type="button" class="btn btn--primary" id="productAddToCart">
                        Add To Bag
                        <i class="fa-solid fa-bag-shopping"></i>
                    </button>
                </div>
                <p class="buy-note">
                    Your order will be confirmed before payment is processed.
                </p>
            </div>
            <div class="product-delivery">
                <i class="fa-solid fa-truck"></i>
                <p>
                    Estimated delivery:
                    <strong id="productDeliveryDate">Calculating...</strong>
                    <br>
                    Usually delivered within 2–4 working days.
                </p>
            </div>
        </div>
    `;

    setupGallery();
    setupQuantity(product);
    calculateDeliveryDate("productDeliveryDate");

    const description = document.getElementById("productDescription");
    if (description) description.textContent = product.description;

    renderReviews(product);
    renderRelatedProducts(product);
}

function setupGallery() {
    const mainImage = document.getElementById("mainProductImage");

    document.addEventListener("click", (event) => {
        const thumb = event.target.closest("[data-gallery-image]");
        if (!thumb || !mainImage) return;

        mainImage.src = thumb.dataset.galleryImage;

        document.querySelectorAll(".product-gallery__thumb").forEach((item) => {
            item.classList.remove("active");
        });
        thumb.classList.add("active");
    });
}

function setupQuantity(product) {
    let quantity = 1;
    const value = document.getElementById("quantityValue");

    document.getElementById("quantityMinus")?.addEventListener("click", () => {
        quantity = Math.max(1, quantity - 1);
        if (value) value.textContent = quantity;
    });

    document.getElementById("quantityPlus")?.addEventListener("click", () => {
        quantity += 1;
        if (value) value.textContent = quantity;
    });

    document.getElementById("productAddToCart")?.addEventListener("click", () => {
        addToCart(product.id, quantity);
    });
}

function addWorkingDays(date, numberOfDays) {
    const result = new Date(date);
    let daysAdded = 0;

    while (daysAdded < numberOfDays) {
        result.setDate(result.getDate() + 1);
        const day = result.getDay();
        if (day !== 0 && day !== 6) daysAdded++;
    }

    return result;
}

function calculateDeliveryDate(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const today = new Date();
    const earliest = addWorkingDays(today, 2);
    const latest = addWorkingDays(today, 4);
    const formatter = new Intl.DateTimeFormat("en-NG", {
        day: "numeric",
        month: "short"
    });

    element.textContent = `${formatter.format(earliest)} – ${formatter.format(latest)}`;
}

function renderReviews(product) {
    const list = document.getElementById("reviewsList");
    const summary = document.getElementById("reviewSummary");
    if (!list) return;

    if (summary) {
        summary.innerHTML = `
            <span class="review-summary__number">${product.rating.toFixed(1)}</span>
            <span class="review-summary__text">
                ${createStars(product.rating)}
                <br>
                Based on ${product.reviews.length} review(s)
            </span>
        `;
    }

    if (!product.reviews.length) {
        list.innerHTML = `
            <div class="review">
                <p class="review__text">
                    Reviews will appear here once customers begin sharing their experience.
                </p>
            </div>
        `;
        return;
    }

    list.innerHTML = product.reviews
        .map(
            (review) => `
        <article class="review">
            <div class="review__stars">${createStars(review.rating)}</div>
            <p class="review__name">${review.name}</p>
            <p class="review__text">${review.text}</p>
        </article>
    `
        )
        .join("");
}

function renderRelatedProducts(product) {
    const container = document.getElementById("relatedProducts");
    if (!container) return;

    const related = products
        .filter((item) => item.id !== product.id && item.category === product.category)
        .slice(0, 3);

    const fallback = products.filter((item) => item.id !== product.id).slice(0, 3);
    const displayProducts = related.length >= 3 ? related : fallback;

    container.innerHTML = displayProducts
        .map(
            (item) => `
        <a href="product.html?id=${encodeURIComponent(item.id)}" class="related-card">
            <div class="related-card__image">
                <img src="${item.image}" alt="${item.name}" loading="lazy">
            </div>
            <div class="related-card__body">
                <p class="related-card__category">${item.categoryLabel}</p>
                <h3>${item.name}</h3>
                <p>${formatPrice(item.price)}</p>
            </div>
        </a>
    `
        )
        .join("");
}

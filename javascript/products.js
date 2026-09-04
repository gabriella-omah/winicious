/* ==================================================
   WINICIOUS SHOP JAVASCRIPT
================================================== */

const products = [
    {
        id: "elume-body-wave",
        name: "Elume Body Wave",
        category: "hair",
        categoryLabel: "Elume Hair",
        price: 185000,
        image: "./images/productbodywave (1).jpeg",
        gallery: [
            "./images/productbodywave (1).jpeg",
            "./images/productbodywave (2).jpeg",
            "./images/productbodywave (3).jpeg",
            "./images/productbodywave (4).jpeg"
        ],
        description:
            "A soft, versatile body-wave texture designed for effortless movement and everyday styling.",
        rating: 4.9,
        reviews: [
            {
                name: "Verified Customer",
                rating: 5,
                text: "Beautiful texture and exactly what I was looking for."
            },
            {
                name: "Verified Customer",
                rating: 5,
                text: "The hair feels lovely and the quality is excellent."
            }
        ],
        tag: "Best Seller"
    },
    {
        id: "elume-straight",
        name: "Elume Straight",
        category: "hair",
        categoryLabel: "Elume Hair",
        price: 175000,
        image: "./images/productstraight (1).jpeg",
        gallery: [
            "./images/productstraight (1).jpeg",
            "./images/productstraight (2).jpeg"
        ],
        description:
            "Smooth, polished and easy to style, with a naturally sleek finish.",
        rating: 4.8,
        reviews: [],
        tag: ""
    },
    {
        id: "elume-deep-wave",
        name: "Elume Deep Wave",
        category: "hair",
        categoryLabel: "Elume Hair",
        price: 195000,
        image: "./images/productdeepwavw (1).jpeg",
        gallery: [
            "./images/productdeepwavw (1).jpeg",
            "./images/productdeepwavw (2).jpeg",
            "./images/productdeepwavw (3).jpeg",
            "./images/productdeepwavw (4).jpeg"
        ],
        description:
            "Full-bodied deep waves with a soft, defined pattern and beautiful movement.",
        rating: 5,
        reviews: [],
        tag: "New"
    },
    {
        id: "professional-styler",
        name: "Professional Hair Styler",
        category: "tools",
        categoryLabel: "Hair Tools",
        price: 85000,
        image: "./images/productstyler (1).jpeg",
        gallery: [
            "./images/productstyler (1).jpeg",
            "./images/productstyler (2).jpeg",
            "./images/productstyler (3).jpeg",
            "./images/productstyler (4).jpeg"
        ],
        description:
            "A versatile styling tool for creating smooth, polished looks at home.",
        rating: 4.7,
        reviews: [],
        tag: ""
    },
    {
        id: "curling-wand",
        name: "Curling Wand",
        category: "tools",
        categoryLabel: "Hair Tools",
        price: 65000,
        image: "./images/productcurler (1).jpeg",
        gallery: [
            "./images/productcurler (1).jpeg",
            "./images/productcurler (2).jpeg",
            "./images/productcurler (3).jpeg"
        ],
        description:
            "Designed for effortless waves and curls with a smooth, refined finish.",
        rating: 4.7,
        reviews: [],
        tag: ""
    },
    {
        id: "heat-protectant",
        name: "Heat Protectant",
        category: "care",
        categoryLabel: "Hair Care",
        price: 18000,
        image: "./images/productheat (1).jpeg",
        gallery: [
            "./images/productheat (1).jpeg",
            "./images/productheat (2).jpeg",
            "./images/productheat (3).jpeg",
            "./images/productheat (4).jpeg"
        ],
        description:
            "A lightweight styling essential designed to protect hair during heat styling.",
        rating: 4.8,
        reviews: [],
        tag: ""
    },
    {
        id: "hair-mist",
        name: "Signature Hair Mist",
        category: "care",
        categoryLabel: "Hair Care",
        price: 22000,
        image: "./images/productmist (1).jpeg",
        gallery: [
            "./images/productmist (1).jpeg",
            "./images/productmist (2).jpeg",
            "./images/productmist (3).jpeg",
            "./images/productmist (4).jpeg"
        ],
        description:
            "A refreshing finishing mist that leaves hair feeling soft and beautifully scented.",
        rating: 4.9,
        reviews: [],
        tag: "New"
    },
    {
        id: "beauty-essential",
        name: "Beauty Essential",
        category: "beauty",
        categoryLabel: "Beauty",
        price: 28000,
        image: "./images/productbeauty (1).jpeg",
        gallery: [
            "./images/productbeauty (1).jpeg",
            "./images/productbeauty (2).jpeg",
            "./images/productbeauty (3).jpeg"
        ],
        description:
            "A carefully selected beauty essential to complement your everyday routine.",
        rating: 4.6,
        reviews: [],
        tag: ""
    }
];
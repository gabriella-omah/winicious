/* ==================================================
   BOOKING FAQ
================================================== */
document.addEventListener("DOMContentLoaded", () => {
    const faqItems = document.querySelectorAll(
        ".booking-faq__item"
    );
    if (!faqItems.length) return;
    faqItems.forEach((item) => {
        const question = item.querySelector(
            ".booking-faq__question"
        );
        const answer = item.querySelector(
            ".booking-faq__answer"
        );
        if (!question || !answer) return;
        question.addEventListener("click", () => {
            const isOpen =
                item.classList.contains("is-open");
            /*
             * Close every other FAQ item.
             * This keeps the accordion clean.
             */
            faqItems.forEach((otherItem) => {
                if (otherItem !== item) {
                    otherItem.classList.remove(
                        "is-open"
                    );
                    const otherQuestion =
                        otherItem.querySelector(
                            ".booking-faq__question"
                        );
                    if (otherQuestion) {
                        otherQuestion.setAttribute(
                            "aria-expanded",
                            "false"
                        );
                    }
                }
            });
            /*
             * Toggle current item.
             */
            if (isOpen) {
                item.classList.remove(
                    "is-open"
                );
                question.setAttribute(
                    "aria-expanded",
                    "false"
                );
            } else {
                item.classList.add(
                    "is-open"
                );
                question.setAttribute(
                    "aria-expanded",
                    "true"
                );
            }
        });
    });
});
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


const bookingForm =
    document.getElementById("bookingForm");


if (bookingForm) {

    /*
     * ==================================================
     * BOOKING INPUT VALIDATION
     * ==================================================
     */

    const nameInput =
        document.getElementById("bookingName");

    const emailInput =
        document.getElementById("bookingEmail");

    const phoneInput =
        document.getElementById("bookingPhone");

    const dateInput =
        document.getElementById("bookingDate");

    const notesInput =
        document.getElementById("bookingNotes");


    /*
     * NAME
     *
     * Allows:
     * - Letters
     * - Spaces
     * - Hyphens
     * - Apostrophes
     *
     * Example:
     * John Doe       ✓
     * Mary-Jane Doe  ✓
     * O'Connor       ✓
     *
     * Rejects:
     * 123456         ✗
     * @@@@           ✗
     */
    if (nameInput) {

        nameInput.setAttribute(
            "minlength",
            "2"
        );

        nameInput.setAttribute(
            "maxlength",
            "80"
        );

        nameInput.addEventListener(
            "input",
            () => {

                nameInput.value =
                    nameInput.value.replace(
                        /[^a-zA-ZÀ-ÿ\s'-]/g,
                        ""
                    );
            }
        );

        nameInput.addEventListener(
            "blur",
            () => {

                const name =
                    nameInput.value.trim();

                const namePattern =
                    /^[a-zA-ZÀ-ÿ]+(?:[\s'-][a-zA-ZÀ-ÿ]+)*$/;

                if (
                    name.length < 2 ||
                    !namePattern.test(name)
                ) {

                    nameInput.setCustomValidity(
                        "Please enter a valid name."
                    );

                } else {

                    nameInput.setCustomValidity("");
                }
            }
        );
    }


    /*
     * EMAIL
     *
     * The browser already validates type="email".
     * This adds an additional check for a sensible
     * email structure.
     */
    if (emailInput) {

        emailInput.setAttribute(
            "maxlength",
            "254"
        );

        emailInput.addEventListener(
            "blur",
            () => {

                const email =
                    emailInput.value.trim();

                const emailPattern =
                    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

                if (
                    !emailPattern.test(email)
                ) {

                    emailInput.setCustomValidity(
                        "Please enter a valid email address."
                    );

                } else {

                    emailInput.setCustomValidity("");
                }
            }
        );
    }


    /*
     * PHONE
     *
     * Supports Nigerian formats such as:
     *
     * 08012345678
     * 07012345678
     * 08112345678
     * +2348012345678
     *
     * Spaces and hyphens are allowed while typing.
     */
    if (phoneInput) {

        phoneInput.setAttribute(
            "maxlength",
            "16"
        );

        phoneInput.setAttribute(
            "inputmode",
            "tel"
        );

        phoneInput.addEventListener(
            "input",
            () => {

                phoneInput.value =
                    phoneInput.value.replace(
                        /[^0-9+\s-]/g,
                        ""
                    );
            }
        );

        phoneInput.addEventListener(
            "blur",
            () => {

                const phone =
                    phoneInput.value.trim();

                /*
                 * Remove spaces and hyphens
                 * before checking the number.
                 */
                const cleanPhone =
                    phone.replace(/[\s-]/g, "");

                /*
                 * Nigerian mobile number:
                 *
                 * 08012345678
                 * 07012345678
                 * 08112345678
                 *
                 * OR
                 *
                 * +2348012345678
                 */
                const phonePattern =
                    /^(?:0[789][01]\d{8}|\+234[789][01]\d{8})$/;

                if (
                    !phonePattern.test(cleanPhone)
                ) {

                    phoneInput.setCustomValidity(
                        "Please enter a valid Nigerian phone number."
                    );

                } else {

                    phoneInput.setCustomValidity("");
                }
            }
        );
    }


    /*
     * DATE
     *
     * Prevents users from selecting a date
     * in the past.
     */
    if (dateInput) {

        const today =
            new Date();

        const year =
            today.getFullYear();

        const month =
            String(
                today.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                today.getDate()
            ).padStart(2, "0");

        dateInput.min =
            `${year}-${month}-${day}`;
    }


    /*
     * NOTES
     *
     * Prevent extremely large submissions.
     */
    if (notesInput) {

        notesInput.setAttribute(
            "maxlength",
            "1000"
        );
    }


    /*
     * ==================================================
     * SUBMIT BOOKING
     * ==================================================
     */

    bookingForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            /*
             * Run the browser's built-in validation
             * before touching Supabase.
             */
            if (!bookingForm.checkValidity()) {

                bookingForm.reportValidity();

                return;
            }


            const submitButton =
                bookingForm.querySelector(
                    ".booking-form__submit"
                );


            const formData =
                new FormData(bookingForm);


            const booking = {

                service:
                    formData.get("service"),

                preferred_date:
                    formData.get("date"),

                preferred_time:
                    formData.get("time"),

                customer_name:
                    formData.get("name").trim(),

                customer_email:
                    formData.get("email").trim(),

                customer_phone:
                    formData.get("phone").trim(),

                notes:
                    formData.get("notes")?.trim() || null
            };


            submitButton.disabled =
                true;

            submitButton.textContent =
                "Sending...";


            try {

                /* ======================================
                   CREATE BOOKING
                ====================================== */

                const { error } =
                    await supabaseClient
                        .from("bookings")
                        .insert([booking]);


                if (error) {

                    console.error(
                        "Booking error:",
                        error
                    );

                    throw new Error(
                        "We couldn't submit your appointment request. Please try again."
                    );
                }


                /* ======================================
                   SUCCESS
                ====================================== */

                bookingForm.reset();

                submitButton.disabled =
                    false;

                submitButton.textContent =
                    "Request appointment";


                alert(
                    "Your appointment request has been received. We'll contact you to confirm your appointment."
                );


            } catch (error) {

                console.error(
                    "Booking submission error:",
                    error
                );


                alert(
                    error.message ||
                    "We couldn't submit your appointment request. Please try again."
                );


                submitButton.disabled =
                    false;

                submitButton.textContent =
                    "Request appointment";
            }

        }
    );
}
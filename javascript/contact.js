const contactForm = document.getElementById("contactForm");

if (contactForm) {

    /* ==================================================
       CONTACT FORM INPUT VALIDATION
    ================================================== */

    const nameInput =
        contactForm.querySelector('[name="name"]');

    const emailInput =
        contactForm.querySelector('[name="email"]');

    const phoneInput =
        contactForm.querySelector('[name="phone"]');

    const reasonInput =
        contactForm.querySelector('[name="reason"]');

    const messageInput =
        contactForm.querySelector('[name="message"]');


    /* ==================================================
       NAME VALIDATION
    ================================================== */

    if (nameInput) {

        nameInput.setAttribute("minlength", "2");
        nameInput.setAttribute("maxlength", "80");

        nameInput.addEventListener("input", () => {

            nameInput.value =
                nameInput.value.replace(
                    /[^a-zA-ZÀ-ÿ\s'-]/g,
                    ""
                );
        });

        nameInput.addEventListener("blur", () => {

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
        });
    }


    /* ==================================================
       EMAIL VALIDATION
    ================================================== */

    if (emailInput) {

        emailInput.setAttribute(
            "maxlength",
            "254"
        );

        emailInput.addEventListener("blur", () => {

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
        });
    }


    /* ==================================================
       PHONE VALIDATION
       OPTIONAL FIELD
    ================================================== */

    if (phoneInput) {

        phoneInput.setAttribute(
            "maxlength",
            "16"
        );

        phoneInput.setAttribute(
            "inputmode",
            "tel"
        );

        phoneInput.addEventListener("input", () => {

            phoneInput.value =
                phoneInput.value.replace(
                    /[^0-9+\s-]/g,
                    ""
                );
        });

        phoneInput.addEventListener("blur", () => {

            const phone =
                phoneInput.value.trim();

            /*
             * Phone is optional.
             * If nothing was entered, allow it.
             */
            if (!phone) {

                phoneInput.setCustomValidity("");

                return;
            }

            const cleanPhone =
                phone.replace(/[\s-]/g, "");

            /*
             * Nigerian mobile numbers:
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
        });
    }


    /* ==================================================
       REASON
    ================================================== */

    if (reasonInput) {

        reasonInput.addEventListener("change", () => {

            if (!reasonInput.value) {

                reasonInput.setCustomValidity(
                    "Please select a reason for contacting us."
                );

            } else {

                reasonInput.setCustomValidity("");
            }
        });
    }


    /* ==================================================
       MESSAGE
    ================================================== */

    if (messageInput) {

        messageInput.setAttribute(
            "minlength",
            "10"
        );

        messageInput.setAttribute(
            "maxlength",
            "2000"
        );

        messageInput.addEventListener("blur", () => {

            const message =
                messageInput.value.trim();

            if (message.length < 10) {

                messageInput.setCustomValidity(
                    "Please enter at least 10 characters."
                );

            } else {

                messageInput.setCustomValidity("");
            }
        });
    }


    /* ==================================================
       SUBMIT
    ================================================== */

    contactForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            /*
             * Run all browser validation before
             * sending anything to Supabase.
             */
            if (!contactForm.checkValidity()) {

                contactForm.reportValidity();

                return;
            }


            const submitButton =
                contactForm.querySelector(
                    ".contact-form__submit"
                );


            const formData =
                new FormData(contactForm);


            const contactMessage = {

                name:
                    formData.get("name").trim(),

                email:
                    formData.get("email").trim(),

                phone:
                    formData.get("phone")?.trim() || null,

                reason:
                    formData.get("reason"),

                message:
                    formData.get("message").trim()
            };


            submitButton.disabled = true;
            submitButton.textContent = "Sending...";


            const { error } =
                await supabaseClient
                    .from("contact_messages")
                    .insert([contactMessage]);


            if (error) {

                console.error(
                    "Contact form error:",
                    error
                );

                alert(
                    "We couldn't send your message. Please try again."
                );

                submitButton.disabled = false;
                submitButton.textContent = "Send message";

                return;
            }


            contactForm.reset();

            submitButton.disabled = false;
            submitButton.textContent = "Send message";


            alert(
                "Thanks for reaching out. We'll get back to you as soon as we can."
            );
        }
    );
}
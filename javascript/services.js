/* ==================================================
   WINICIOUS
   ALL SERVICES ACCORDION
================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const serviceAccordions =
        document.querySelectorAll(".service-accordion");

    if (!serviceAccordions.length) {
        return;
    }


    /* ==============================================
       CLOSE A SERVICE
    ============================================== */

    const closeService = (service) => {

        const trigger =
            service.querySelector(".service-accordion__trigger");

        const details =
            service.querySelector(".service-accordion__details");

        if (!trigger || !details) {
            return;
        }

        service.classList.remove("is-open");

        trigger.setAttribute("aria-expanded", "false");

        details.setAttribute("aria-hidden", "true");
    };


    /* ==============================================
       OPEN A SERVICE
    ============================================== */

    const openService = (service) => {

        const trigger =
            service.querySelector(".service-accordion__trigger");

        const details =
            service.querySelector(".service-accordion__details");

        if (!trigger || !details) {
            return;
        }

        service.classList.add("is-open");

        trigger.setAttribute("aria-expanded", "true");

        details.setAttribute("aria-hidden", "false");
    };


    /* ==============================================
       CLOSE ALL SERVICES
    ============================================== */

    const closeAllServices = () => {

        serviceAccordions.forEach((service) => {
            closeService(service);
        });

    };


    /* ==============================================
       SERVICE CLICK
    ============================================== */

    serviceAccordions.forEach((service) => {

        const trigger =
            service.querySelector(".service-accordion__trigger");

        if (!trigger) {
            return;
        }


        trigger.addEventListener("click", () => {

            const isOpen =
                service.classList.contains("is-open");


            /*
               Close every service first.

               This guarantees that if Hair Styling
               is open and the user clicks Pedicure,
               Hair Styling closes immediately.
            */
            closeAllServices();


            /*
               If the clicked service was previously
               closed, open it.

               If it was already open, leave it closed.
            */
            if (!isOpen) {
                openService(service);
            }

        });

    });


    /* ==============================================
       CLICK OUTSIDE
    ============================================== */

    document.addEventListener("click", (event) => {

        const clickedInsideServices =
            event.target.closest(".services-list");

        if (!clickedInsideServices) {
            closeAllServices();
        }

    });


    /* ==============================================
       ESCAPE KEY
    ============================================== */

    document.addEventListener("keydown", (event) => {

        if (event.key !== "Escape") {
            return;
        }

        closeAllServices();

    });


    /* ==============================================
       INITIAL STATE
    ============================================== */

    closeAllServices();

});
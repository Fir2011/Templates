function initGoToTop() {
    const button = document.querySelector("a.go-to-top"),
        entryContent = document.querySelector(".entry-content");

    if (!button) return;

    window.addEventListener("scroll", () => {
        if (window.scrollY > 300) {
            button.classList.add("show");
        } else {
            button.classList.remove("show");
        }

        if (entryContent) {
            const stickyBar = entryContent.querySelector(".sticky-content-bar");
            if (stickyBar && isElementVisible(button, entryContent)) {
                button.classList.add("moved");
            } else {
                button.classList.remove("moved");
            }
        }
    });

    button.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}
function isElementVisible(el1, el2) {
    const rect1 = el1.getBoundingClientRect(),
        rect2 = el2.getBoundingClientRect();
    return !(rect1.right < rect2.left || rect1.left > rect2.right || rect1.bottom < rect2.top || rect1.top > rect2.bottom);
}
initGoToTop();
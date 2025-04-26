function initIndexGridPersistence() {
    const checkbox = document.querySelector("#index-grid");
    if (!checkbox) return;

    // Nonaktifkan transition sementara
    document.body.classList.add("no-transition");

    // Muat status dari localStorage saat halaman dimuat
    checkbox.checked = localStorage.getItem("indexGridChecked") === "true";

    // Hapus class setelah satu frame agar perubahan awal tidak dianimasikan
    requestAnimationFrame(() => {
        document.body.classList.remove("no-transition");
    });

    // Simpan perubahan ke localStorage saat checkbox berubah
    checkbox.addEventListener("change", () => {
        localStorage.setItem("indexGridChecked", checkbox.checked);
    });
}

// Panggil fungsi saat DOM sudah siap
document.addEventListener("DOMContentLoaded", initIndexGridPersistence);

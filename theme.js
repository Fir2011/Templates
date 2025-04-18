document.getElementById('themeToggle').addEventListener('click', function(event) {
    event.preventDefault();

    const radios = document.querySelectorAll('input[name="theme-radio"]');
    let checkedIndex = Array.from(radios).findIndex(radio => radio.checked);
    
    // Pindah ke radio berikutnya, kembali ke awal jika sudah di akhir
    checkedIndex = (checkedIndex + 1) % radios.length;
    
    radios[checkedIndex].checked = true;

    // Ambil ID tanpa "-mode"
    const theme = radios[checkedIndex].id.replace("-mode", "");
    localStorage.setItem("theme", theme);
    applyTheme(theme);
});

// Fungsi untuk menerapkan tema
function applyTheme(mode) {
    if (mode === "auto") {
        mode = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    document.documentElement.setAttribute("data-theme", mode);
}

// Saat halaman dimuat, gunakan tema dari localStorage
document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("theme") || "auto";
    document.getElementById(savedTheme + "-mode").checked = true;
    applyTheme(savedTheme);

    // Terapkan accent yang tersimpan
    const savedAccent = localStorage.getItem("accent") || "accent-primary";
    document.getElementById(savedAccent).checked = true;
    applyAccent(savedAccent);
});

// Event listener untuk perubahan accent
document.querySelectorAll('input[name="accent-input"]').forEach(radio => {
    radio.addEventListener('change', function() {
        localStorage.setItem("accent", this.id);
        applyAccent(this.id);
    });
});

// Fungsi untuk menerapkan accent
function applyAccent(accent) {
    document.body.classList.remove("accent-primary", "accent-danger", "accent-success", "accent-info", "accent-warning");
    document.body.classList.add(accent);
}

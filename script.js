// File: script.js (Versi dengan localStorage)

// --- ELEMEN DOM ---
const inputKata = document.getElementById('input-kata');
const cariBtn = document.getElementById('cari-btn');
const hasilTerjemahan = document.getElementById('hasil-terjemahan');
const tampilkanModalBtn = document.getElementById('tampilkan-modal-btn');
const modal = document.getElementById('modal-tambah-kata');
const closeModalBtn = document.querySelector('.close-btn');
const formTambahKata = document.getElementById('form-tambah-kata');

// --- FUNGSI UTAMA UNTUK MENGELOLA DATA KAMUS ---

// Kunci untuk menyimpan data di localStorage
const STORAGE_KEY = 'kamusWolioData';

/**
 * Memuat kamus. Menggabungkan data awal dari kamus-data.js dengan data
 * yang disimpan di localStorage jika ada.
 */
function muatKamus() {
    const dataTersimpan = localStorage.getItem(STORAGE_KEY);
    if (dataTersimpan) {
        // Jika ada data di localStorage, gabungkan dengan data awal
        // Ini untuk memastikan data dari localStorage jadi data utama
        dataKamus = JSON.parse(dataTersimpan);
    }
    // Selalu urutkan setiap kali memuat, untuk memastikan binary search bekerja
    urutkanKamus();
}

/**
 * Menyimpan seluruh data kamus saat ini ke localStorage.
 */
function simpanKamusKeStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataKamus));
}

/**
 * Mengurutkan array dataKamus berdasarkan kunci 'indonesia'.
 * Penting untuk binary search.
 */
function urutkanKamus() {
    dataKamus.sort((a, b) => {
        if (a.indonesia < b.indonesia) return -1;
        if (a.indonesia > b.indonesia) return 1;
        return 0;
    });
}


// --- FUNGSI PENCARIAN ---
/**
 * Fungsi Binary Search
 * @param {Array} data - Array data kamus yang sudah terurut.
 * @param {string} kata - Kata yang ingin dicari.
 * @param {string} kunci - Kunci objek yang akan dicari ('indonesia').
 * @returns {Object|null} - Mengembalikan objek kata jika ditemukan, atau null.
 */
function binarySearch(data, kata, kunci) {
    let low = 0;
    let high = data.length - 1;
    kata = kata.toLowerCase();

    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const kataTengah = data[mid][kunci];

        if (kataTengah === kata) {
            return data[mid];
        } else if (kataTengah < kata) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    return null; // Kata tidak ditemukan
}

// Fungsi untuk menampilkan hasil dengan animasi
function tampilkanHasil(htmlContent) {
    hasilTerjemahan.innerHTML = htmlContent;
    hasilTerjemahan.classList.remove('hasil-pop-in');
    void hasilTerjemahan.offsetWidth;
    hasilTerjemahan.classList.add('hasil-pop-in');
}

// Fungsi untuk melakukan pencarian
function lakukanPencarian() {
    const kataDicari = inputKata.value.trim();
    if (kataDicari === '') {
        tampilkanHasil('<p>Silakan masukkan sebuah kata.</p>');
        return;
    }

    const hasil = binarySearch(dataKamus, kataDicari, 'indonesia'); 

    if (hasil) {
        let htmlOutput = `<p><strong style="font-size: 1.2em; color: #1a73e8;">${hasil.wolio}</strong>`;
        if (hasil.tipe) htmlOutput += ` <span style="font-style: italic; color: #777;">(${hasil.tipe})</span>`;
        if (hasil.pelafalan) htmlOutput += `<br><small style="color: #555;">(dibaca: ${hasil.pelafalan})</small>`;
        htmlOutput += `</p>`;
        tampilkanHasil(htmlOutput);
    } else {
        tampilkanHasil(`<p>Kata "<strong>${kataDicari}</strong>" tidak ditemukan dalam kamus.</p>`);
    }
}

// --- LOGIKA MODAL ---
function bukaModal() {
    modal.classList.add('show');
}

function tutupModal() {
    modal.classList.remove('show');
    formTambahKata.reset(); // Bersihkan form saat ditutup
}

// --- LOGIKA TAMBAH KATA ---
function tambahKataBaru(event) {
    event.preventDefault(); // Mencegah form dari reload halaman

    const kataIndonesia = document.getElementById('input-indonesia').value.trim().toLowerCase();
    const kataWolio = document.getElementById('input-wolio').value.trim();
    const pelafalan = document.getElementById('input-pelafalan').value.trim();
    const tipe = document.getElementById('input-tipe').value.trim();

    if (!kataIndonesia || !kataWolio) {
        alert('Kata Indonesia dan Wolio tidak boleh kosong!');
        return;
    }
    
    if (binarySearch(dataKamus, kataIndonesia, 'indonesia')) {
        alert(`Kata "${kataIndonesia}" sudah ada di dalam kamus.`);
        return;
    }

    const kataBaru = {
        indonesia: kataIndonesia,
        wolio: kataWolio,
        pelafalan: pelafalan,
        tipe: tipe
    };

    dataKamus.push(kataBaru);
    urutkanKamus(); // Urutkan kembali array
    simpanKamusKeStorage(); // Simpan array yang sudah diupdate ke localStorage

    alert(`Kata "${kataIndonesia}" berhasil ditambahkan!`);
    tutupModal();
}


// --- EVENT LISTENERS & INISIALISASI ---

// Panggil muatKamus() saat script pertama kali dijalankan
document.addEventListener('DOMContentLoaded', muatKamus);

cariBtn.addEventListener('click', lakukanPencarian);
inputKata.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') lakukanPencarian();
});

inputKata.addEventListener('input', () => {
    if (inputKata.value.trim() === '') {
        hasilTerjemahan.innerHTML = '<p>Hasil terjemahan akan muncul di sini.</p>';
        hasilTerjemahan.classList.remove('hasil-pop-in');
    }
});

// Event listener untuk modal
tampilkanModalBtn.addEventListener('click', bukaModal);
closeModalBtn.addEventListener('click', tutupModal);
window.addEventListener('click', (event) => {
    if (event.target == modal) {
        tutupModal();
    }
});

// Event listener untuk form tambah kata
formTambahKata.addEventListener('submit', tambahKataBaru);
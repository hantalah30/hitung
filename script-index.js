import { firebaseConfig } from "./firebase-config.js";

// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Elemen DOM
const inputTanggalBaru = document.getElementById("input-tanggal-baru");
const btnBukaTanggal = document.getElementById("btn-buka-tanggal");
const daftarRiwayat = document.getElementById("daftar-riwayat");
const pesanLoading = document.getElementById("pesan-loading");

// Atur tanggal hari ini sebagai default
function getTanggalHariIni() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
inputTanggalBaru.value = getTanggalHariIni();

// Fungsi untuk membuka halaman penghitung
function bukaHalamanHitung() {
  const tanggal = inputTanggalBaru.value;
  if (!tanggal) {
    alert("Silakan pilih tanggal terlebih dahulu.");
    return;
  }
  // Baris inilah yang seharusnya memindahkan Anda ke halaman berikutnya
  window.location.href = `hitung.html?tanggal=${tanggal}`;
}

// Muat riwayat tanggal dari Firebase
function muatRiwayat() {
  const dataRef = database.ref("data");

  dataRef.on("value", (snapshot) => {
    daftarRiwayat.innerHTML = "";
    pesanLoading.style.display = "none";

    if (snapshot.exists()) {
      const data = snapshot.val();
      const semuaTanggal = Object.keys(data).sort().reverse(); // Urutkan dari terbaru

      semuaTanggal.forEach((tanggal) => {
        const link = document.createElement("a");
        link.href = `hitung.html?tanggal=${tanggal}`;
        link.className = "list-group-item list-group-item-action";

        const tglObj = new Date(tanggal + "T00:00:00");
        const formattedDate = tglObj.toLocaleDateString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        link.textContent = formattedDate;

        daftarRiwayat.appendChild(link);
      });
    } else {
      daftarRiwayat.innerHTML =
        '<p class="text-muted">Belum ada riwayat catatan.</p>';
    }
  });
}

// Event Listeners
btnBukaTanggal.addEventListener("click", bukaHalamanHitung);

// Inisialisasi
muatRiwayat();

import { firebaseConfig } from "./firebase-config.js";

// Inisialisasi Firebase
try {
  firebase.initializeApp(firebaseConfig);
} catch (error) {
  console.error("Gagal menginisialisasi Firebase:", error);
  tampilkanNotifikasi("Gagal menghubungkan ke database.", true);
}
const database = firebase.database();

// Dapatkan tanggal dari URL
const params = new URLSearchParams(window.location.search);
const tanggal = params.get("tanggal");

// Jika tidak ada tanggal di URL, kembali ke halaman utama
if (!tanggal) {
  window.location.href = "index.html";
}

// Referensi database untuk tanggal spesifik ini
const dataRef = database.ref(`data/${tanggal}`);

// Kategori baru dan urutannya
const CATEGORIES = [
  "reguler-tawar",
  "mild-tawar",
  "reguler-click",
  "mild-click",
  "esse-click",
  "bolong-buntu",
];
const CATEGORY_MAP = {
  "reguler-tawar": { name: "REGULER TAWAR", color: "primary" },
  "mild-tawar": { name: "MILD TAWAR", color: "primary" },
  "reguler-click": { name: "REGULER CLICK", color: "success" },
  "mild-click": { name: "MILD CLICK", color: "success" },
  "esse-click": { name: "ESSE CLICK", color: "success" },
  "bolong-buntu": { name: "BOLONG BUNTU", color: "danger" },
};

// Elemen DOM
const tanggalSekarangEl = document.getElementById("tanggal-sekarang");
const jumlahTotalEl = document.getElementById("jumlah-total");
const inputJumlahEl = document.getElementById("input-jumlah");
const daftarEntriEl = document.getElementById("daftar-entri");
const pesanKosongEl = document.getElementById("pesan-kosong");
const jumlahErrorEl = document.getElementById("jumlah-error");
const notificationEl = document.getElementById("notification");
const btnDownload = document.getElementById("btn-download");

// Elemen total untuk setiap kategori
const totalElements = {};
CATEGORIES.forEach((cat) => {
  totalElements[cat] = document.getElementById(`total-${cat}`);
});

// Format tanggal untuk ditampilkan
const tglObj = new Date(tanggal + "T00:00:00");
tanggalSekarangEl.textContent = tglObj.toLocaleDateString("id-ID", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

// Fungsi untuk menampilkan notifikasi
function tampilkanNotifikasi(pesan, isError = false) {
  notificationEl.textContent = pesan;
  notificationEl.className = `notification show ${isError ? "error" : ""}`;
  setTimeout(() => {
    notificationEl.classList.remove("show");
  }, 3000);
}

// Fungsi untuk merender UI berdasarkan data dari Firebase
function renderUI(data) {
  daftarEntriEl.innerHTML = ""; // Kosongkan daftar

  const totals = {};
  CATEGORIES.forEach((cat) => (totals[cat] = 0));
  let totalKeseluruhan = 0;

  let entries = [];
  if (data) {
    entries = Object.entries(data).map(([key, entri]) => ({ key, ...entri }));
  }

  // Sorting: berdasarkan urutan kategori, lalu berdasarkan jumlah
  entries.sort((a, b) => {
    const categoryAIndex = CATEGORIES.indexOf(a.tipe);
    const categoryBIndex = CATEGORIES.indexOf(b.tipe);
    if (categoryAIndex !== categoryBIndex) {
      return categoryAIndex - categoryBIndex;
    }
    return parseFloat(a.jumlah) - parseFloat(b.jumlah);
  });

  entries.forEach((entri) => {
    const jumlah = parseFloat(entri.jumlah);
    if (totals.hasOwnProperty(entri.tipe)) {
      totals[entri.tipe] += jumlah;
    }
    totalKeseluruhan += jumlah;

    const tr = document.createElement("tr");
    const categoryInfo = CATEGORY_MAP[entri.tipe];
    tr.innerHTML = `
      <td><span class="badge bg-${categoryInfo.color}">${
      categoryInfo.name
    }</span></td>
      <td>${jumlah.toLocaleString("id-ID", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 4,
      })}</td>
      <td>
        <button class="btn btn-warning btn-sm btn-edit" data-key="${
          entri.key
        }">Edit</button>
        <button class="btn btn-danger btn-sm btn-hapus" data-key="${
          entri.key
        }">Hapus</button>
      </td>
    `;
    daftarEntriEl.appendChild(tr);
  });

  if (daftarEntriEl.children.length === 0) {
    pesanKosongEl.style.display = "table-row";
  } else {
    pesanKosongEl.style.display = "none";
  }

  // Update tampilan total
  CATEGORIES.forEach((cat) => {
    if (totalElements[cat]) {
      totalElements[cat].textContent = parseFloat(
        totals[cat].toFixed(4)
      ).toLocaleString("id-ID");
    }
  });
  jumlahTotalEl.textContent = parseFloat(
    totalKeseluruhan.toFixed(4)
  ).toLocaleString("id-ID");
}

// Fungsi untuk menambah entri baru
function tambahEntri(tipe) {
  const jumlahStr = inputJumlahEl.value.trim().replace(",", ".");
  const jumlah = parseFloat(jumlahStr);

  if (isNaN(jumlah) || jumlah <= 0) {
    jumlahErrorEl.textContent =
      "Masukkan jumlah yang valid (angka lebih besar dari 0).";
    return;
  }
  jumlahErrorEl.textContent = ""; // Bersihkan pesan error

  dataRef
    .push({
      tipe: tipe,
      jumlah: jumlah.toFixed(4), // Simpan dengan 4 desimal
    })
    .then(() => {
      tampilkanNotifikasi(`Berhasil menambahkan ${CATEGORY_MAP[tipe].name}.`);
      inputJumlahEl.value = "";
      inputJumlahEl.focus();
    })
    .catch((error) => {
      console.error("Gagal menambahkan data:", error);
      tampilkanNotifikasi(
        `Gagal menambahkan ${CATEGORY_MAP[tipe].name}.`,
        true
      );
    });
}

// Fungsi untuk mengedit entri
function editEntri(key) {
  dataRef.child(key).once("value", (snapshot) => {
    const entri = snapshot.val();
    if (!entri) return;

    const jumlahBaruStr = prompt(
      `Edit jumlah untuk ${CATEGORY_MAP[entri.tipe].name}:`,
      entri.jumlah
    );
    if (jumlahBaruStr === null) return; // Batal

    const jumlahBaru = parseFloat(jumlahBaruStr.trim().replace(",", "."));
    if (isNaN(jumlahBaru) || jumlahBaru <= 0) {
      alert("Masukkan jumlah yang valid (angka lebih besar dari 0).");
      return;
    }

    dataRef
      .child(key)
      .update({ jumlah: jumlahBaru.toFixed(4) })
      .then(() => {
        tampilkanNotifikasi(
          `Berhasil mengedit ${CATEGORY_MAP[entri.tipe].name}.`
        );
      })
      .catch((error) => {
        console.error("Gagal mengedit data:", error);
        tampilkanNotifikasi(
          `Gagal mengedit ${CATEGORY_MAP[entri.tipe].name}.`,
          true
        );
      });
  });
}

// Fungsi untuk menghapus entri
function hapusEntri(key) {
  if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
    dataRef
      .child(key)
      .remove()
      .then(() => {
        tampilkanNotifikasi("Data berhasil dihapus.");
      })
      .catch((error) => {
        console.error("Gagal menghapus data:", error);
        tampilkanNotifikasi("Gagal menghapus data.", true);
      });
  }
}

// Fungsi untuk mengunduh data sebagai CSV
function exportDataAsCsv() {
  dataRef.once("value", (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      alert("Tidak ada data untuk diunduh.");
      return;
    }

    let csvContent = `Data Rinci Tanggal ${tanggal}\n\n`;
    csvContent += "Kategori,Jumlah\n";
    Object.values(data).forEach((entri) => {
      csvContent += `${CATEGORY_MAP[entri.tipe].name},${entri.jumlah}\n`;
    });

    // Tambahkan ringkasan total
    const totals = {};
    CATEGORIES.forEach((cat) => (totals[cat] = 0));
    let totalKeseluruhan = 0;

    Object.values(data).forEach((entri) => {
      const jumlah = parseFloat(entri.jumlah);
      if (totals.hasOwnProperty(entri.tipe)) {
        totals[entri.tipe] += jumlah;
      }
      totalKeseluruhan += jumlah;
    });

    csvContent += `\nRingkasan Total\n\n`;
    CATEGORIES.forEach((cat) => {
      csvContent += `${CATEGORY_MAP[cat].name},${totals[cat].toFixed(4)}\n`;
    });
    csvContent += `\nJUMLAH TOTAL,${totalKeseluruhan.toFixed(4)}\n`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `data_penghitung_${tanggal}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  });
}

// Event Listeners
document
  .getElementById("btn-tambah-reguler-tawar")
  .addEventListener("click", () => tambahEntri("reguler-tawar"));
document
  .getElementById("btn-tambah-mild-tawar")
  .addEventListener("click", () => tambahEntri("mild-tawar"));
document
  .getElementById("btn-tambah-reguler-click")
  .addEventListener("click", () => tambahEntri("reguler-click"));
document
  .getElementById("btn-tambah-mild-click")
  .addEventListener("click", () => tambahEntri("mild-click"));
document
  .getElementById("btn-tambah-esse-click")
  .addEventListener("click", () => tambahEntri("esse-click"));
document
  .getElementById("btn-tambah-bolong-buntu")
  .addEventListener("click", () => tambahEntri("bolong-buntu"));

btnDownload.addEventListener("click", exportDataAsCsv);

daftarEntriEl.addEventListener("click", (e) => {
  const key = e.target.dataset.key;
  if (!key) return;

  if (e.target.classList.contains("btn-hapus")) {
    hapusEntri(key);
  } else if (e.target.classList.contains("btn-edit")) {
    editEntri(key);
  }
});

// Listener utama: panggil renderUI setiap kali data di Firebase berubah
dataRef.on(
  "value",
  (snapshot) => {
    renderUI(snapshot.val());
  },
  (error) => {
    console.error("Gagal membaca data dari Firebase:", error);
    tampilkanNotifikasi("Gagal memuat data.", true);
  }
);

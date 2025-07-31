import { firebaseConfig } from "firebase-config.js";

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

// Elemen DOM
const tanggalSekarangEl = document.getElementById("tanggal-sekarang");
const totalRegulerEl = document.getElementById("total-reguler");
const totalKlikEl = document.getElementById("total-klik");
const jumlahTotalEl = document.getElementById("jumlah-total");
const inputJumlahEl = document.getElementById("input-jumlah");
const btnTambahReguler = document.getElementById("btn-tambah-reguler");
const btnTambahKlik = document.getElementById("btn-tambah-klik");
const daftarEntriEl = document.getElementById("daftar-entri");
const pesanKosongEl = document.getElementById("pesan-kosong");
const jumlahErrorEl = document.getElementById("jumlah-error");
const notificationEl = document.getElementById("notification");

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

  let totalReguler = 0;
  let totalKlik = 0;

  if (data) {
    Object.entries(data).forEach(([key, entri]) => {
      if (entri.tipe === "reguler") {
        totalReguler += parseFloat(entri.jumlah);
      } else if (entri.tipe === "klik") {
        totalKlik += parseFloat(entri.jumlah);
      }

      const li = document.createElement("li");
      li.className =
        "list-group-item d-flex justify-content-between align-items-center";
      li.innerHTML = `
 <span>
 <span class="badge bg-${
   entri.tipe === "reguler" ? "primary" : "success"
 } me-2">${entri.tipe.toUpperCase()}</span>
 ${parseFloat(entri.jumlah).toLocaleString("id-ID", {
   minimumFractionDigits: 0,
   maximumFractionDigits: 4,
 })}
 </span>
 <div>
 <button class="btn btn-warning btn-sm btn-edit" data-key="${key}">Edit</button>
 <button class="btn btn-danger btn-sm btn-hapus" data-key="${key}">Hapus</button>
 </div>
 `;
      daftarEntriEl.appendChild(li);
    });
  }

  if (daftarEntriEl.children.length === 0) {
    pesanKosongEl.textContent = "Belum ada data untuk tanggal ini.";
    daftarEntriEl.appendChild(pesanKosongEl);
  }

  totalRegulerEl.textContent = parseFloat(
    totalReguler.toFixed(4)
  ).toLocaleString("id-ID");
  totalKlikEl.textContent = parseFloat(totalKlik.toFixed(4)).toLocaleString(
    "id-ID"
  );
  const jumlahTotal = totalReguler + totalKlik;
  jumlahTotalEl.textContent = parseFloat(jumlahTotal.toFixed(4)).toLocaleString(
    "id-ID"
  );
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
      tampilkanNotifikasi(`Berhasil menambahkan ${tipe}.`);
      inputJumlahEl.value = "";
      inputJumlahEl.focus();
    })
    .catch((error) => {
      console.error("Gagal menambahkan data:", error);
      tampilkanNotifikasi(`Gagal menambahkan ${tipe}.`, true);
    });
}

// Fungsi untuk mengedit entri
function editEntri(key) {
  dataRef.child(key).once("value", (snapshot) => {
    const entri = snapshot.val();
    if (!entri) return;

    const jumlahBaruStr = prompt(
      `Edit jumlah untuk ${entri.tipe.toUpperCase()}:`,
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
        tampilkanNotifikasi(`Berhasil mengedit ${entri.tipe}.`);
      })
      .catch((error) => {
        console.error("Gagal mengedit data:", error);
        tampilkanNotifikasi(`Gagal mengedit ${entri.tipe}.`, true);
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

// Event Listeners
btnTambahReguler.addEventListener("click", () => tambahEntri("reguler"));
btnTambahKlik.addEventListener("click", () => tambahEntri("klik"));

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

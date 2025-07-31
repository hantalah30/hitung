document.addEventListener("DOMContentLoaded", () => {
  // === ELEMEN DOM ===
  const tanggalSekarangEl = document.getElementById("tanggal-sekarang");
  const totalRegulerEl = document.getElementById("total-reguler");
  const totalKlikEl = document.getElementById("total-klik");
  const jumlahTotalEl = document.getElementById("jumlah-total");
  const inputJumlahEl = document.getElementById("input-jumlah");
  const btnTambahReguler = document.getElementById("btn-tambah-reguler");
  const btnTambahKlik = document.getElementById("btn-tambah-klik");
  const daftarEntriEl = document.getElementById("daftar-entri");
  const pesanKosongEl = document.getElementById("pesan-kosong");

  // === STATE APLIKASI ===
  let dataAplikasi = {};

  // === FUNGSI UTAMA ===

  // Mendapatkan tanggal hari ini dalam format YYYY-MM-DD
  function getTanggalHariIni() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  // Memuat data dari localStorage
  function muatData() {
    const dataTersimpan = localStorage.getItem("penghitungData");
    dataAplikasi = dataTersimpan ? JSON.parse(dataTersimpan) : {};
  }

  // Menyimpan data ke localStorage
  function simpanData() {
    localStorage.setItem("penghitungData", JSON.stringify(dataAplikasi));
  }

  // Merender (menampilkan) seluruh UI
  function renderUI() {
    const tanggalHariIni = getTanggalHariIni();

    // Atur tampilan tanggal
    tanggalSekarangEl.textContent = `Tanggal: ${new Date().toLocaleDateString(
      "id-ID",
      { weekday: "long", year: "numeric", month: "long", day: "numeric" }
    )}`;

    // Ambil data untuk hari ini, jika tidak ada, buat array kosong
    const dataHariIni = dataAplikasi[tanggalHariIni] || [];

    // Bersihkan daftar entri sebelum render ulang
    daftarEntriEl.innerHTML = "";
    if (dataHariIni.length === 0) {
      daftarEntriEl.appendChild(pesanKosongEl);
    }

    let totalReguler = 0;
    let totalKlik = 0;

    // Tampilkan setiap entri data
    dataHariIni.forEach((entri) => {
      if (entri.tipe === "reguler") {
        totalReguler += entri.jumlah;
      } else if (entri.tipe === "klik") {
        totalKlik += entri.jumlah;
      }

      const li = document.createElement("li");
      li.className =
        "list-group-item d-flex justify-content-between align-items-center";
      li.innerHTML = `
                <span>
                    <span class="badge bg-${
                      entri.tipe === "reguler" ? "primary" : "success"
                    } me-2">${entri.tipe.toUpperCase()}</span>
                    ${entri.jumlah.toLocaleString("id-ID")}
                </span>
                <div>
                    <button class="btn btn-warning btn-sm btn-edit" data-id="${
                      entri.id
                    }">Edit</button>
                    <button class="btn btn-danger btn-sm btn-hapus" data-id="${
                      entri.id
                    }">Hapus</button>
                </div>
            `;
      daftarEntriEl.appendChild(li);
    });

    // Update tampilan total
    totalRegulerEl.textContent = totalReguler.toLocaleString("id-ID");
    totalKlikEl.textContent = totalKlik.toLocaleString("id-ID");
    jumlahTotalEl.textContent = (totalReguler + totalKlik).toLocaleString(
      "id-ID"
    );
  }

  // Fungsi untuk menambah entri baru
  function tambahEntri(tipe) {
    const jumlah = parseInt(inputJumlahEl.value);
    if (isNaN(jumlah) || jumlah <= 0) {
      alert("Masukkan jumlah yang valid.");
      return;
    }

    const tanggalHariIni = getTanggalHariIni();
    if (!dataAplikasi[tanggalHariIni]) {
      dataAplikasi[tanggalHariIni] = [];
    }

    const entriBaru = {
      id: Date.now(), // ID unik berdasarkan timestamp
      tipe: tipe,
      jumlah: jumlah,
    };

    dataAplikasi[tanggalHariIni].push(entriBaru);
    simpanData();
    renderUI();
    inputJumlahEl.value = ""; // Kosongkan input
    inputJumlahEl.focus();
  }

  // Fungsi untuk menghapus entri
  function hapusEntri(id) {
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return;

    const tanggalHariIni = getTanggalHariIni();
    dataAplikasi[tanggalHariIni] = dataAplikasi[tanggalHariIni].filter(
      (entri) => entri.id !== id
    );
    simpanData();
    renderUI();
  }

  // Fungsi untuk mengedit entri
  function editEntri(id) {
    const tanggalHariIni = getTanggalHariIni();
    const entri = dataAplikasi[tanggalHariIni].find((e) => e.id === id);

    if (!entri) return;

    const jumlahBaruStr = prompt(
      `Edit jumlah untuk ${entri.tipe.toUpperCase()}:`,
      entri.jumlah
    );
    if (jumlahBaruStr === null) return; // Batal

    const jumlahBaru = parseInt(jumlahBaruStr);
    if (isNaN(jumlahBaru) || jumlahBaru <= 0) {
      alert("Masukkan jumlah yang valid.");
      return;
    }

    entri.jumlah = jumlahBaru;
    simpanData();
    renderUI();
  }

  // === EVENT LISTENERS ===
  btnTambahReguler.addEventListener("click", () => tambahEntri("reguler"));
  btnTambahKlik.addEventListener("click", () => tambahEntri("klik"));

  // Cegah form submit tradisional
  document
    .getElementById("form-tambah")
    .addEventListener("submit", (e) => e.preventDefault());

  // Event listener untuk tombol edit dan hapus
  daftarEntriEl.addEventListener("click", (e) => {
    const id = parseInt(e.target.dataset.id);
    if (e.target.classList.contains("btn-hapus")) {
      hapusEntri(id);
    } else if (e.target.classList.contains("btn-edit")) {
      editEntri(id);
    }
  });

  // === INISIALISASI ===
  muatData();
  renderUI();
});

// ==========================================
// 1. KONFIGURASI FIREBASE
// ==========================================
const firebaseConfig = {
    apiKey: "MASUKKAN_API_KEY_KAMU",
    authDomain: "MASUKKAN_AUTH_DOMAIN_KAMU",
    projectId: "MASUKKAN_PROJECT_ID_KAMU",
    storageBucket: "MASUKKAN_STORAGE_BUCKET_KAMU",
    messagingSenderId: "MASUKKAN_MESSAGING_SENDER_ID_KAMU",
    appId: "MASUKKAN_APP_ID_KAMU"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const COL_SISWA = "sdn14_kelas4b_siswa";
const COL_JURNAL = "sdn14_kelas4b_jurnal";

let dataSiswaLocal = [];

// ==========================================
// 2. NAVIGASI HALAMAN / BERANDA
// ==========================================
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.getElementById(`page-${tabName}`).classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================
// 3. REALTIME SYNC BIODATA SISWA (LENGKAP)
// ==========================================
function initSiswaListener() {
    db.collection(COL_SISWA).orderBy("nis", "asc").onSnapshot(snapshot => {
        dataSiswaLocal = [];
        let rowsBio = "";
        let rowsAbsen = "";
        let rowsNilai = "";

        snapshot.forEach(doc => {
            let data = doc.data();
            let id = doc.id;
            dataSiswaLocal.push({ id, ...data });

            // Row Biodata Rinci
            rowsBio += `
                <tr class="hover:bg-slate-50">
                    <td class="p-3 font-semibold text-slate-700">${data.nis || '-'}</td>
                    <td class="p-3 font-bold text-slate-800">${data.nama || '-'}</td>
                    <td class="p-3 text-slate-600">${data.nik || '-'}</td>
                    <td class="p-3 text-slate-600">${data.jk || '-'}</td>
                    <td class="p-3 text-slate-600">${data.ttl || '-'}</td>
                    <td class="p-3 text-slate-600">${data.agama || '-'}</td>
                    <td class="p-3 text-slate-600">Ayah: ${data.ayah || '-'}<br>Ibu: ${data.ibu || '-'}</td>
                    <td class="p-3 text-slate-600">${data.pekerjaan || '-'}</td>
                    <td class="p-3 text-slate-600">${data.pendidikan || '-'}</td>
                    <td class="p-3 text-center">
                        <button onclick="hapusSiswa('${id}')" class="text-xs text-red-500 hover:text-red-700 font-semibold bg-red-50 px-3 py-1 rounded-lg">Hapus</button>
                    </td>
                </tr>`;

            rowsAbsen += `
                <tr class="hover:bg-slate-50">
                    <td class="p-3 font-bold text-slate-800">${data.nama}</td>
                    <td class="p-3 text-center space-x-2">
                        <label class="inline-flex items-center gap-1 text-xs font-semibold cursor-pointer"><input type="radio" name="absen-${id}" value="Hadir" checked class="text-indigo-600"> Hadir</label>
                        <label class="inline-flex items-center gap-1 text-xs font-semibold cursor-pointer"><input type="radio" name="absen-${id}" value="Izin" class="text-amber-500"> Izin</label>
                        <label class="inline-flex items-center gap-1 text-xs font-semibold cursor-pointer"><input type="radio" name="absen-${id}" value="Sakit" class="text-sky-500"> Sakit</label>
                        <label class="inline-flex items-center gap-1 text-xs font-semibold cursor-pointer"><input type="radio" name="absen-${id}" value="Alpha" class="text-rose-500"> Alpha</label>
                    </td>
                </tr>`;

            rowsNilai += `
                <tr class="hover:bg-slate-50">
                    <td class="p-3 font-bold text-slate-800">${data.nama}</td>
                    <td class="p-3 text-center"><input type="number" value="${data.nilaiTugas || 0}" onchange="updateNilai('${id}', 'nilaiTugas', this.value)" class="w-20 text-center border rounded-lg py-1 text-xs"></td>
                    <td class="p-3 text-center"><input type="number" value="${data.nilaiUjian || 0}" onchange="updateNilai('${id}', 'nilaiUjian', this.value)" class="w-20 text-center border rounded-lg py-1 text-xs"></td>
                </tr>`;
        });

        document.getElementById('tabel-biodata').innerHTML = rowsBio || `<tr><td colspan="10" class="text-center py-6 text-slate-400">Belum ada data siswa.</td></tr>`;
        document.getElementById('tabel-absensi').innerHTML = rowsAbsen || `<tr><td colspan="2" class="text-center py-6 text-slate-400">Belum ada data siswa.</td></tr>`;
        document.getElementById('tabel-nilai').innerHTML = rowsNilai || `<tr><td colspan="3" class="text-center py-6 text-slate-400">Belum ada data siswa.</td></tr>`;
    });
}

// Tambah Siswa Lengkap
document.getElementById('form-siswa').addEventListener('submit', async (e) => {
    e.preventDefault();
    const newData = {
        nama: document.getElementById('bio-nama').value.trim(),
        nis: document.getElementById('bio-nis').value.trim(),
        nik: document.getElementById('bio-nik').value.trim(),
        jk: document.getElementById('bio-jk').value,
        ttl: document.getElementById('bio-ttl').value.trim(),
        agama: document.getElementById('bio-agama').value,
        ayah: document.getElementById('bio-ayah').value.trim(),
        ibu: document.getElementById('bio-ibu').value.trim(),
        pekerjaan: document.getElementById('bio-pekerjaan').value.trim(),
        pendidikan: document.getElementById('bio-pendidikan').value.trim(),
        nilaiTugas: 0,
        nilaiUjian: 0
    };

    await db.collection(COL_SISWA).add(newData);
    document.getElementById('form-siswa').reset();
    alert("Biodata siswa berhasil disimpan ke Cloud!");
});

// Hapus Siswa
async function hapusSiswa(id) {
    if (confirm("Yakin ingin menghapus data siswa ini?")) {
        await db.collection(COL_SISWA).doc(id).delete();
    }
}

// Update Nilai
async function updateNilai(id, field, value) {
    await db.collection(COL_SISWA).doc(id).update({ [field]: Number(value) });
}

// ==========================================
// 4. JURNAL MENGAJAR (RINCI)
// ==========================================
document.getElementById('form-jurnal').addEventListener('submit', async (e) => {
    e.preventDefault();
    const jurnalData = {
        tgl: document.getElementById('jurnal-tgl').value,
        mapel: document.getElementById('jurnal-mapel').value.trim(),
        pertemuan: document.getElementById('jurnal-pertemuan').value.trim(),
        materi: document.getElementById('jurnal-materi').value.trim(),
        metode: document.getElementById('jurnal-metode').value.trim(),
        catatan: document.getElementById('jurnal-catatan').value.trim(),
        kendala: document.getElementById('jurnal-kendala').value.trim(),
        fileName: document.getElementById('jurnal-file').files[0] ? document.getElementById('jurnal-file').files[0].name : null,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    await db.collection(COL_JURNAL).add(jurnalData);
    document.getElementById('form-jurnal').reset();
    document.getElementById('jurnal-tgl').valueAsDate = new Date();
    alert("Jurnal mengajar berhasil disimpan!");
});

db.collection(COL_JURNAL).orderBy("createdAt", "desc").onSnapshot(snapshot => {
    let html = "";
    snapshot.forEach(doc => {
        let j = doc.data();
        html += `
            <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center text-xs font-bold text-indigo-600 gap-1">
                    <span>📚 ${j.mapel} ${j.pertemuan ? `(Pertemuan ke-${j.pertemuan})` : ''}</span>
                    <span class="bg-indigo-100 px-3 py-1 rounded-full text-indigo-700">📅 ${j.tgl}</span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-700 pt-1">
                    <div><strong class="text-slate-900">Materi Pokok:</strong> ${j.materi || '-'}</div>
                    <div><strong class="text-slate-900">Metode:</strong> ${j.metode || '-'}</div>
                </div>
                <p class="text-slate-700 text-sm font-medium pt-1"><strong class="text-xs text-slate-400 block uppercase">Uraian Kegiatan:</strong> ${j.catatan}</p>
                ${j.kendala ? `<p class="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">⚠️ <strong class="font-bold">Kendala:</strong> ${j.kendala}</p>` : ''}
                ${j.fileName ? `<div class="text-xs text-slate-500 pt-1">📎 Lampiran File: <span class="text-slate-700 font-semibold">${j.fileName}</span></div>` : ''}
            </div>`;
    });
    document.getElementById('list-jurnal').innerHTML = html || `<p class="text-slate-400 italic">Belum ada jurnal mengajar dicatat.</p>`;
});

// ==========================================
// 5. EXPORT CSV
// ==========================================
function exportToCSV() {
    let csvContent = "data:text/csv;charset=utf-8,NIS,Nama Siswa,NIK,Jenis Kelamin,TTL,Agama,Ayah,Ibu,Pekerjaan Ortu,Pendidikan Ortu\n";
    dataSiswaLocal.forEach(s => {
        csvContent += `${s.nis || ''},"${s.nama || ''}","${s.nik || ''}","${s.jk || ''}","${s.ttl || ''}","${s.agama || ''}","${s.ayah || ''}","${s.ibu || ''}","${s.pekerjaan || ''}","${s.pendidikan || ''}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Master_Biodata_Kelas4B_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

document.getElementById('tgl-absen').valueAsDate = new Date();
document.getElementById('jurnal-tgl').valueAsDate = new Date();

initSiswaListener();
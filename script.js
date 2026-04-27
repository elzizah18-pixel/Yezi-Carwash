/**
 * =============================================
 * SIMULASI ANTRIAN CUCI MOBIL - 3 JALUR
 * IMPLEMENTASI MULTIPLE QUEUE (3 QUEUE TERPISAH)
 * =============================================
 */

// ====================================
// DATA STRUKTUR: 3 QUEUE TERPISAH
// ====================================

// 3 queue terpisah untuk masing-masing layanan
const queues = {
    'manual': [],      // Queue untuk layanan manual
    'otomatis': [],    // Queue untuk layanan otomatis
    'hidrolik': []     // Queue untuk layanan hidrolik
};

// Status mesin cuci: true = sedang mencuci, false = siap
const mesinCuci = {
    'manual': false,
    'otomatis': false,
    'hidrolik': false
};

// Timer interval untuk masing-masing mesin
const timerIntervals = {
    'manual': null,
    'otomatis': null,
    'hidrolik': null
};

// Pilihan layanan yang sedang dipilih
let layananDipilih = '';

// Data layanan
const durasiLayanan = {
    'manual': 90,
    'otomatis': 75,
    'hidrolik': 60
};

const iconLayanan = {
    'manual': '🧹',
    'otomatis': '🤖',
    'hidrolik': '💧'
};

const namaLayanan = {
    'manual': 'MANUAL',
    'otomatis': 'OTOMATIS',
    'hidrolik': 'HIDROLIK'
};

// ====================================
// FUNGSI UTILITY
// ====================================

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatWaktu(detik) {
    const menit = Math.floor(detik / 60);
    const sisaDetik = detik % 60;
    return String(menit).padStart(2, '0') + ':' + String(sisaDetik).padStart(2, '0');
}

function tampilkanNotif(pesan, warna) {
    if (!warna) warna = '#4caf50';
    const notif = document.getElementById('notif');
    notif.textContent = pesan;
    notif.style.backgroundColor = warna;
    notif.classList.add('show');
    setTimeout(function() {
        notif.classList.remove('show');
    }, 4000);
}

// ====================================
// FUNGSI PILIH LAYANAN
// ====================================

function pilihLayanan(layanan) {
    layananDipilih = layanan;
    
    document.querySelectorAll('.layanan-card').forEach(function(card) {
        card.classList.remove('selected');
    });
    
    const kartuTerpilih = document.getElementById('card-' + layanan);
    if (kartuTerpilih) {
        kartuTerpilih.classList.add('selected');
    }
    
    console.log('🔧 Layanan dipilih: ' + namaLayanan[layanan]);
}

// ====================================
// FUNGSI UPDATE TAMPILAN
// ====================================

function updateTampilanAntrian(layanan) {
    const container = document.getElementById('daftarAntrian' + capitalize(layanan));
    container.innerHTML = '';
    
    const queue = queues[layanan];
    
    if (queue.length === 0) {
        container.innerHTML = '<p class="kosong">Antrian kosong</p>';
        return;
    }
    
    queue.forEach(function(item, index) {
        const div = document.createElement('div');
        div.className = 'antrian-item';
        div.innerHTML = 
            '<span class="nomor">' + (index + 1) + '</span>' +
            '<span class="nama">' + item + '</span>';
        container.appendChild(div);
    });
    
    console.log('📋 Queue ' + namaLayanan[layanan] + ': [' + queue.join(', ') + ']');
    console.log('   HEAD: ' + (queue[0] || '(kosong)'));
    console.log('   TAIL: ' + (queue[queue.length - 1] || '(kosong)'));
}

// ====================================
// OPERASI ENQUEUE
// ====================================

function tambahAntrian() {
    console.log('=== OPERASI ENQUEUE ===');
    
    const namaInput = document.getElementById('namaInput');
    const nama = namaInput.value.trim();
    
    if (nama === '') {
        tampilkanNotif('❌ Nama tidak boleh kosong!', '#f44336');
        return;
    }
    
    if (layananDipilih === '') {
        tampilkanNotif('❌ Pilih jenis layanan terlebih dahulu!', '#f44336');
        return;
    }
    
    // ENQUEUE ke queue spesifik
    queues[layananDipilih].push(nama);
    
    console.log('✅ ENQUEUE: ' + nama + ' → Queue ' + namaLayanan[layananDipilih]);
    
    // Update tampilan antrian untuk layanan tersebut
    updateTampilanAntrian(layananDipilih);
    
    // Reset form
    namaInput.value = '';
    layananDipilih = '';
    document.querySelectorAll('.layanan-card').forEach(function(card) {
        card.classList.remove('selected');
    });
    
    tampilkanNotif(
        '✅ ' + nama + ' masuk antrian ' + namaLayanan[layananDipilih] + '!\n' +
        'Estimasi: ' + durasiLayanan[layananDipilih] + ' detik'
    );
    
    console.log('=== ENQUEUE SELESAI ===\n');
}

// ====================================
// OPERASI DEQUEUE
// ====================================

function cuciMobil(layanan) {
    console.log('=== OPERASI DEQUEUE: ' + namaLayanan[layanan] + ' ===');
    
    const queue = queues[layanan];
    
    // Validasi antrian kosong
    if (queue.length === 0) {
        tampilkanNotif('⚠️ Antrian ' + namaLayanan[layanan] + ' kosong!', '#ff9800');
        return;
    }
    
    // Validasi mesin sedang mencuci
    if (mesinCuci[layanan]) {
        tampilkanNotif('⏳ Mesin ' + namaLayanan[layanan] + ' sedang mencuci. Tunggu...', '#ff9800');
        return;
    }
    
    // DEQUEUE: ambil dari depan
    const mobilDicuci = queue.shift();
    console.log('🚗 DEQUEUE: ' + mobilDicuci + ' dari queue ' + namaLayanan[layanan]);
    
    // Set mesin sibuk
    mesinCuci[layanan] = true;
    
    // Nonaktifkan tombol cuci untuk layanan ini
    document.getElementById('btnCuci' + capitalize(layanan)).disabled = true;
    
    // Update tampilan
    updateTampilanAntrian(layanan);
    
    // Tampilkan status cuci
    const durasi = durasiLayanan[layanan];
    const statusDiv = document.getElementById('status' + capitalize(layanan));
    statusDiv.classList.add('active');
    document.getElementById('statusText' + capitalize(layanan)).textContent = 'Mencuci: ' + mobilDicuci;
    document.getElementById('statusInfo' + capitalize(layanan)).textContent = 'Durasi: ' + durasi + ' detik';
    document.getElementById('progressBar' + capitalize(layanan)).style.width = '0%';
    document.getElementById('timerText' + capitalize(layanan)).textContent = formatWaktu(durasi);
    
    console.log('🧽 Mulai mencuci: ' + mobilDicuci);
    console.log('⏱ Durasi: ' + durasi + ' detik');
    
    // Timer mundur
    let sisaWaktu = durasi;
    const progressBar = document.getElementById('progressBar' + capitalize(layanan));
    const timerText = document.getElementById('timerText' + capitalize(layanan));
    
    timerIntervals[layanan] = setInterval(function() {
        sisaWaktu--;
        
        const progress = ((durasi - sisaWaktu) / durasi) * 100;
        progressBar.style.width = progress + '%';
        timerText.textContent = formatWaktu(sisaWaktu);
        
        if (sisaWaktu <= 0) {
            clearInterval(timerIntervals[layanan]);
            
            // Selesai
            mesinCuci[layanan] = false;
            statusDiv.classList.remove('active');
            document.getElementById('btnCuci' + capitalize(layanan)).disabled = false;
            
            tampilkanNotif(
                '✅ SELESAI! Mobil ' + mobilDicuci + ' (' + namaLayanan[layanan] + ') selesai dicuci!\n' +
                '⏱ Waktu: ' + durasi + ' detik'
            );
            
            console.log('✅ Selesai mencuci: ' + mobilDicuci);
            console.log('=== DEQUEUE SELESAI ===\n');
        }
    }, 1000);
}

// ====================================
// OPERASI CLEAR ALL
// ====================================

function resetSemuaAntrian() {
    console.log('=== OPERASI CLEAR ALL ===');
    
    // Cek apakah ada mesin yang sedang mencuci
    let adaMencuci = false;
    for (const layanan in mesinCuci) {
        if (mesinCuci[layanan]) {
            adaMencuci = true;
            break;
        }
    }
    
    if (adaMencuci) {
        tampilkanNotif('⚠️ Tidak bisa reset. Ada mesin yang sedang mencuci!', '#ff9800');
        return;
    }
    
    const totalAntrian = queues['manual'].length + queues['otomatis'].length + queues['hidrolik'].length;
    
    if (totalAntrian === 0) {
        tampilkanNotif('⚠️ Semua antrian sudah kosong.', '#ff9800');
        return;
    }
    
    const konfirmasi = confirm(
        'Apakah Anda yakin?\n\n' +
        'Antrian Manual: ' + queues['manual'].length + ' mobil\n' +
        'Antrian Otomatis: ' + queues['otomatis'].length + ' mobil\n' +
        'Antrian Hidrolik: ' + queues['hidrolik'].length + ' mobil\n\n' +
        'Semua data akan dihapus.'
    );
    
    if (konfirmasi) {
        console.log('🗑 CLEAR ALL');
        
        // Kosongkan semua queue
        queues['manual'] = [];
        queues['otomatis'] = [];
        queues['hidrolik'] = [];
        
        // Update semua tampilan
        updateTampilanAntrian('manual');
        updateTampilanAntrian('otomatis');
        updateTampilanAntrian('hidrolik');
        
        tampilkanNotif('🗑 Semua antrian telah dihapus.', '#f44336');
        console.log('✅ Semua queue dikosongkan');
    }
    
    console.log('=== CLEAR ALL SELESAI ===\n');
}

// ====================================
// INISIALISASI
// ====================================

updateTampilanAntrian('manual');
updateTampilanAntrian('otomatis');
updateTampilanAntrian('hidrolik');

console.log('========================================');
console.log('🚗 ANTRIAN CUCI MOBIL - 3 JALUR');
console.log('IMPLEMENTASI MULTIPLE QUEUE');
console.log('========================================');
console.log('🔹 3 Queue Terpisah: Manual, Otomatis, Hidrolik');
console.log('🔹 3 Mesin bisa berjalan BERSAMAAN');
console.log('🔹 Setiap layanan punya antrian sendiri');
console.log('========================================');
console.log('✅ Program siap digunakan!');
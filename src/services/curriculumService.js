/*
 * Layanan Kurikulum Analisis & Desain Sistem & Tugas Perkuliahan
 * Menyediakan konten teks bacaan terstruktur ala Dicoding untuk setiap materi dan tugas.
 * Berisi modul authentic sesuai silabus perkuliahan Bu Dian (Universitas Muhammadiyah Cirebon).
 */

const DEFAULT_MODULE_CONTENT = {
  1: {
    title: 'Konsep Rekayasa Perangkat Lunak dan SDLC',
    subtitle: 'Program Studi S1 Teknik Informatika · Fakultas Teknik · Universitas Muhammadiyah Cirebon',
    readingTime: '10 menit baca',
    meta: {
      course: 'Analisis & Desain Perangkat Lunak (3 SKS) · Semester 4',
      subCpmk: 'Sub-CPMK-1 — Menjelaskan konsep SDLC serta membandingkan model Waterfall, Prototyping, Spiral, dan Agile.',
      cpmk: 'CPMK-1 → CPL04',
      caseStudy: 'SIPUS — Sistem Informasi Perpustakaan Kampus',
    },
    objectives: [
      'Menjelaskan pengertian perangkat lunak dan rekayasa perangkat lunak (RPL).',
      'Menguraikan tahapan Software Development Life Cycle (SDLC) beserta luaran (artefak) tiap tahap.',
      'Membandingkan model proses Waterfall, Prototyping, Spiral, dan Scrum secara komprehensif.',
      'Memilih model proses yang sesuai untuk suatu kasus nyata beserta argumentasi teknisnya.',
    ],
    indicators: [
      'Ketepatan menjelaskan tahapan SDLC.',
      'Ketepatan membandingkan kelebihan dan kekurangan masing-masing model proses.',
      'Kesesuaian pilihan model proses dengan karakteristik kasus di lapangan.',
    ],
    sections: [
      {
        heading: '1. Perangkat Lunak dan Rekayasa Perangkat Lunak',
        content: `Perangkat lunak bukan hanya kode program. Perangkat lunak mencakup program yang dapat dijalankan, struktur data yang diolahnya, serta dokumentasi yang menjelaskan cara membangun, memakai, dan memeliharanya. Karena itu, kualitas perangkat lunak ditentukan sejak tahap awal: seberapa baik kebutuhan dipahami dan seberapa baik solusi dirancang.

Rekayasa perangkat lunak (RPL) adalah penerapan pendekatan yang sistematis, disiplin, dan terukur dalam pengembangan, operasi, dan pemeliharaan perangkat lunak. Kata kuncinya adalah sistematis: pekerjaan dibagi dalam tahapan yang jelas, setiap tahap menghasilkan artefak yang dapat diperiksa, dan keputusan teknis dapat dipertanggungjawabkan.

Mengapa perlu "rekayasa"? Proyek perangkat lunak sering gagal bukan karena programmer tidak mampu menulis kode, melainkan karena kebutuhan yang salah dipahami, ruang lingkup yang terus berubah, dan rancangan yang tidak siap menghadapi perubahan. Mata kuliah ini berfokus pada dua kegiatan yang paling menentukan keberhasilan proyek, yaitu analisis (memahami masalah dan kebutuhan) dan desain (merancang solusi sebelum dibangun).`,
        callout: {
          type: 'important',
          title: 'Karakteristik Perangkat Lunak yang Baik',
          text: '1. Benar (correct): Melakukan apa yang dibutuhkan pengguna.\n2. Andal (reliable) dan aman (secure): Bekerja konsisten dan terlindung dari penyalahgunaan.\n3. Mudah dipakai (usable) dan efisien: Memberikan alur interaksi intuitif dan performa cepat.\n4. Mudah dipelihara (maintainable): Dapat diperbarui tanpa merusak komponen lainnya.',
        },
      },
      {
        heading: '2. Software Development Life Cycle (SDLC)',
        content: `SDLC adalah kerangka tahapan yang dilalui perangkat lunak sejak gagasan muncul hingga sistem digunakan dan dipelihara. Nama dan jumlah tahap dapat berbeda antarbuku, tetapi intinya sama.

Mata kuliah Analisis & Desain Perangkat Lunak berfokus secara intensif pada fase awal SDLC (Perencanaan, Analisis, dan Desain) karena di tahap inilah fondasi kualitas sistem diletakkan.`,
        image: {
          url: 'https://vydtiijkcnpholfzukas.supabase.co/storage/v1/object/public/attachments/diagram-sdlc-p1-1792942076679.png',
          fallbackUrl: '/assets/diagram-sdlc-p1.png',
          alt: 'Gambar 1.1 Tahapan umum SDLC',
          caption: 'Gambar 1.1 Tahapan umum SDLC; tahap yang diarsir (Perencanaan, Analisis, dan Desain) adalah fokus mata kuliah ini.',
        },
        table: {
          title: 'Tabel 1.1 Tahapan SDLC dan Luarannya (Artefak)',
          headers: ['Tahap SDLC', 'Kegiatan Utama', 'Luaran (Artefak)'],
          rows: [
            [
              'Perencanaan (Planning)',
              'Menentukan tujuan, ruang lingkup, jadwal, biaya, dan kelayakan proyek.',
              'Proposal proyek, studi kelayakan teknis & ekonomis.',
            ],
            [
              'Analisis (Analysis)',
              'Menggali dan menganalisis kebutuhan pemangku kepentingan (stakeholders).',
              'Dokumen SRS (Software Requirements Specification), model use case, spesifikasi kebutuhan fungsional & non-fungsional.',
            ],
            [
              'Desain (Design)',
              'Merancang arsitektur sistem, model kelas, interaksi proses, basis data, dan antarmuka pengguna.',
              'Dokumen SDD (Software Design Description), diagram UML terintegrasi, ERD basis data, prototype UI/UX.',
            ],
            [
              'Implementasi (Coding)',
              'Menulis kode sumber program sesuai dokumen rancangan yang telah disepakati.',
              'Kode sumber (source code), modul program, build executable / web service.',
            ],
            [
              'Pengujian (Testing)',
              'Memastikan sistem bekerja benar (verifikasi) dan sesuai kebutuhan bisnis pengguna (validasi).',
              'Rencana uji (Test Plan), skenario pengujian, dan laporan hasil uji (Test Report / Bug Log).',
            ],
            [
              'Deployment & Pemeliharaan',
              'Memasang sistem di lingkungan produksi, melatih pengguna, memperbaiki galat, dan mengembangkan modul baru.',
              'Sistem berjalan operasional, manual book pengguna, catatan perubahan (changelog).',
            ],
          ],
        },
        callout: {
          type: 'important',
          title: 'Hukum Biaya Kesalahan (Error Cost Escalation)',
          text: 'Biaya memperbaiki kesalahan meningkat tajam semakin lambat kesalahan itu ditemukan. Kesalahan pemahaman kebutuhan yang baru ketahuan saat tahap pengujian atau deployment bisa memaksa tim merombak arsitektur dan menulis ulang kode dari awal. Inilah alasan mengapa analisis dan desain yang cermat sangat krusial dan bernilai tinggi!',
        },
      },
      {
        heading: '3. Model Proses Pengembangan Perangkat Lunak',
        content: `Model proses menentukan urutan dan cara tahapan SDLC dijalankan. Tidak ada satu model yang terbaik untuk semua proyek; pilihan bergantung pada kejelasan kebutuhan, risiko teknis, keterlibatan pengguna, dan kesiapan organisasi menghadapi perubahan.

Berikut adalah 4 model proses utama yang wajib dikuasai:

1. Waterfall Model (Model Sekuensial Linier):
Tahapan berjalan linier berurutan: perencanaan → analisis → desain → implementasi → pengujian → pemeliharaan. Cocok untuk proyek dengan spesifikasi kebutuhan yang sudah matang, stabil, dan terikat regulasi ketat.

2. Prototyping Model:
Membangun purwarupa cepat yang dapat dilihat dan dicoba pengguna sejak dini untuk menggali kebutuhan tersembunyi. Cocok bila pengguna awam atau sulit mendefinisikan apa yang mereka butuhkan.

3. Spiral Model:
Model berbasis risiko yang memadukan sifat berulang dari prototyping dengan aspek keteraturan model waterfall. Setiap putaran (spiral) melewati identifikasi tujuan, analisis & mitigasi risiko, pengembangan, dan evaluasi pengguna. Sangat cocok untuk sistem skala besar dan bernilai strategis tinggi.

4. Scrum (Kerangka Kerja Agile Terpopuler):
Pekerjaan dibagi ke dalam iterasi pendek berdurasi 1 – 4 minggu yang disebut Sprint. Setiap sprint menghasilkan produk yang beroperasi (Increment) dan dapat dipakai langsung oleh pengguna:
• Peran: Product Owner (menentukan prioritas fitur), Scrum Master (memfasilitasi alur kerja), Development Team (tim pengembang lintas fungsi).
• Artefak: Product Backlog (daftar seluruh kebutuhan), Sprint Backlog (kebutuhan yang dikerjakan pada sprint aktif), Increment (hasil kerja siap rilis).
• Acara: Sprint Planning, Daily Scrum, Sprint Review, Sprint Retrospective.`,
        table: {
          title: 'Tabel 1.2 Perbandingan Karakteristik Model Proses Pengembangan',
          headers: ['Aspek Perbandingan', 'Waterfall', 'Prototyping', 'Spiral', 'Scrum (Agile)'],
          rows: [
            [
              'Kejelasan Kebutuhan',
              'Harus jelas dan pasti di awal proyek',
              'Belum jelas / masih samar',
              'Berkembang seiring tiap putaran',
              'Berkembang bertahap di tiap sprint',
            ],
            [
              'Keterlibatan Pengguna',
              'Hanya di awal (syarat) dan akhir (terima)',
              'Sangat tinggi saat evaluasi prototipe',
              'Di setiap putaran evaluasi risiko',
              'Tinggi dan berkelanjutan di setiap sprint',
            ],
            [
              'Respons terhadap Perubahan',
              'Rendah (perubahan sulit & berbiaya tinggi)',
              'Tinggi pada aspek antarmuka pengguna',
              'Sedang (dikendalikan analisis risiko)',
              'Sangat tinggi dan adaptif',
            ],
            [
              'Fokus Utama',
              'Kepatuhan dokumentasi & urutan tahap',
              'Mendapatkan umpan balik pengguna',
              'Manajemen dan mitigasi risiko',
              'Penghantaran nilai bisnis tiap sprint',
            ],
            [
              'Paling Cocok Untuk',
              'Kebutuhan stabil, proyek kontrak fixed-price',
              'Sistem baru dengan UI interaktif & pengguna awam',
              'Proyek skala besar & berisiko teknis tinggi',
              'Produk digital modern yang cepat berevolusi',
            ],
          ],
        },
        callout: {
          type: 'tip',
          title: 'Prinsip Analisis & Desain dalam Agile',
          text: 'Agile tidak berarti tanpa analisis dan desain! Analisis tetap dilakukan secara bertahap: kebutuhan ditulis sebagai user story dan dirinci menjelang dikerjakan dalam sprint backlog, dan rancangan arsitektur disempurnakan setiap sprint.',
        },
      },
      {
        heading: '4. Memilih Model Proses: Studi Kasus SIPUS',
        content: `Sepanjang semester, modul perkuliahan ini memakai studi kasus SIPUS (Sistem Informasi Perpustakaan Kampus).

Konteks Masalah:
Perpustakaan kampus ingin mengganti sistem pencatatan manual dengan aplikasi terpadu yang mendukung katalog daring (OPAC), peminjaman dan pengembalian buku, pemesanan judul, perhitungan denda otomatis, dan pelaporan bulanan pimpinan.

Karakteristik Lapangan:
• Pustakawan belum terbiasa dengan aplikasi komputer baru.
• Kebutuhan format laporan pimpinan masih fleksibel dan bisa berubah.
• Kampus menargetkan fitur katalog daring dapat segera diakses mahasiswa secepatnya.

Keputusan Teknis:
Dengan karakteristik di atas, pendekatan Scrum (atau Agile dengan prototype antarmuka di awal) jauh lebih tepat daripada Waterfall.
Alasan Teknis:
1. Kebutuhan laporan belum stabil sehingga membutuhkan fleksibilitas perubahan tanpa penalti biaya besar.
2. Pengguna (pustakawan) perlu melihat dan mencoba layar antarmuka sistem secara langsung untuk memberikan umpan balik nyata.
3. Fitur katalog daring dapat dirilis pada sprint awal sebagai nilai cepat (quick win) yang langsung bermanfaat bagi civitas akademika.`,
        callout: {
          type: 'concept',
          title: '4 Pertanyaan Kunci dalam Memilih Model Proses',
          text: '1. Seberapa jelas dan stabil kebutuhan sistem?\n2. Seberapa besar risiko teknis dan bisnisnya?\n3. Seberapa sering pengguna dapat dilibatkan dalam proses?\n4. Apakah ada tuntutan dokumentasi formal (seperti kontrak atau regulasi)?',
        },
      },
      {
        heading: '5. Aktivitas Pembelajaran, Latihan Mandiri & Tugas Tim',
        content: `Untuk memperkuat penguasaan kompetensi Sub-CPMK-1, mahasiswa diwajibkan menyelesaikan aktivitas luring dan penugasan daring berikut:

Moda Pembelajaran:
• Luring (Tatap Muka): Ceramah interaktif, diskusi kelas, penjelasan RPS, dan kontrak kuliah. Pembentukan tim proyek 4 – 5 orang. Penugasan: tim menentukan mitra studi kasus untuk proyek semester.
• Daring (LMS Kampus): Belajar mandiri melalui video dan bacaan modul; forum diskusi kelas. Penugasan: Kuis K1 (pilihan ganda + esai singkat) dan unggahan perbandingan model proses di forum.

Latihan Mandiri (4 Soal Analisis):
1. Jelaskan dengan kata-kata sendiri perbedaan mendasar antara pemrograman (coding) dan rekayasa perangkat lunak (software engineering).
2. Sebutkan luaran (artefak) utama dari tahap analisis dan tahap desain dalam SDLC.
3. Mengapa kesalahan kebutuhan yang baru ditemukan saat pengujian jauh lebih mahal diperbaiki daripada jika ditemukan saat tahap analisis?
4. Sebuah dinas pemerintahan ingin membangun aplikasi pelaporan pajak dengan aturan dan tarif yang sudah ditetapkan secara baku oleh undang-undang. Model proses apa yang paling sesuai? Jelaskan argumentasi Anda.

Tugas Tim Proyek Semester:
1. Bentuk tim beranggotakan 4 – 5 orang dan tentukan calon mitra studi kasus nyata (UMKM, amal usaha Muhammadiyah, atau unit internal kampus).
2. Tuliskan deskripsi singkat permasalahan mitra (maksimal 1 halaman kertas A4).
3. Pilih model proses yang akan dipakai tim dan berikan tiga alasan kuat berdasarkan karakteristik mitra yang Anda pilih.`,
      },
      {
        heading: '6. Rangkuman & Daftar Pustaka',
        content: `Rangkuman Inti Perkuliahan:
• RPL adalah pendekatan sistematis, disiplin, dan terukur untuk membangun dan memelihara perangkat lunak berkualitas tinggi.
• SDLC terdiri atas perencanaan, analisis, desain, implementasi, pengujian, serta deployment dan pemeliharaan.
• Waterfall cocok untuk kebutuhan yang stabil; Prototyping untuk kebutuhan yang belum jelas; Spiral untuk proyek berisiko tinggi; Scrum untuk produk yang terus berkembang dengan keterlibatan pengguna intensif.
• Analisis dan desain tetap diperlukan dalam semua model pengembangan, termasuk Agile; perbedaannya terletak pada waktu, frekuensi, dan kedalamannya.

Daftar Pustaka Acuan:
[1] Pressman, R. S., & Maxim, B. R. Software Engineering: A Practitioner's Approach (9th ed.). McGraw-Hill Education.
[2] Sommerville, I. Software Engineering (10th ed.). Pearson Higher Education.`,
      },
    ],
  },
  2: {
    title: 'Metodologi Pengembangan Perangkat Lunak (SDLC)',
    readingTime: '8 menit baca',
    objectives: [
      'Memahami tahapan siklus hidup pengembangan sistem (SDLC).',
      'Menganalisis perbandingan antara pendekatan Waterfall, Prototyping, dan Agile Scrum.',
      'Menentukan metodologi yang paling sesuai dengan karakteristik proyek perkuliahan.',
    ],
    sections: [
      {
        heading: '1. Siklus Hidup Pengembangan Sistem (SDLC)',
        content: `System Development Life Cycle (SDLC) adalah kerangka kerja terstruktur yang digunakan oleh industri untuk merencanakan, menganalisis, merancang, menguji, dan menerapkan sistem informasi.

Tahapan dasar SDLC meliputi:
1. Perencanaan (Planning): Menentukan kelayakan proyek, jadwal, dan alokasi sumber daya.
2. Analisis (Analysis): Memahami kebutuhan pengguna dan kendala sistem saat ini.
3. Desain (Design): Merancang arsitektur data, alur proses, dan antarmuka pengguna.
4. Implementasi (Implementation): Pengkodean, instalasi basis data, dan konfigurasi server.
5. Pengujian (Testing): Memverifikasi fungsionalitas dan ketahanan sistem terhadap galat.
6. Pemeliharaan (Maintenance): Perbaikan bug, peningkatan performa, dan adaptasi fitur baru.`,
      },
      {
        heading: '2. Perbandingan Model Tradisional vs Agile',
        content: `Waterfall Model:
Metodologi berurutan di mana setiap fase harus diselesaikan secara penuh sebelum fase berikutnya dimulai. Sangat cocok untuk proyek dengan kebutuhan yang sudah pasti, regulasi ketat, dan tidak mudah berubah.

Agile (Scrum):
Pendekatan iteratif yang membagi proyek ke dalam siklus kerja pendek berdurasi 1-4 minggu (disebut Sprint). Sangat adaptif terhadap perubahan kebutuhan dan memungkinkan pengguna melihat hasil kerja secara bertahap.`,
        callout: {
          type: 'concept',
          title: 'Rekomendasi untuk Tugas Kuliah',
          text: 'Untuk tugas besar satu semester, gunakan pendekatan iteratif: selesaikan analisis inti dalam 2 minggu pertama, kemudian lakukan iterasi desain dan prototipe setiap 2 minggu sekali.',
        },
      },
    ],
  },
};

export const curriculumService = {
  getModuleContent(meetingNumber, materialTitle = '', materialDescription = '') {
    const num = Number(meetingNumber);
    const titleLower = (materialTitle || '').toLowerCase();
    const cleanDesc = (materialDescription || '').trim();

    // 1. JIKA MATERI MEMILIKI DESKRIPSI / TEKS ASLI DI DATABASE:
    // Selalu prioritaskan isi teks asli yang diunggah / ditulis pengguna!
    if (cleanDesc.length > 0) {
      const rawParagraphs = cleanDesc.split(/\n\s*\n/).filter((p) => p.trim());
      const paragraphs = rawParagraphs.length > 0 ? rawParagraphs : [cleanDesc];

      const wordCount = cleanDesc.split(/\s+/).filter(Boolean).length;
      const readingMinutes = Math.max(2, Math.ceil(wordCount / 150));

      return {
        title: materialTitle || `Materi Pertemuan ${meetingNumber}`,
        readingTime: `${readingMinutes} menit baca`,
        objectives: [
          `Memahami pokok bahasan dan konsep utama mengenai ${materialTitle || `pertemuan ke-${meetingNumber}`}.`,
          'Mampu menganalisis dan menerapkan materi pembelajaran pada studi kasus nyata.',
          'Menyelesaikan latihan pemahaman dan penugasan perkuliahan secara mandiri.',
        ],
        sections: paragraphs.map((par, idx) => {
          let heading = `Poin Pembahasan ${idx + 1}`;
          let content = par;

          const matchHeading = par.match(/^([#0-9A-Za-z\s\-_:]{3,60})\n([\s\S]+)$/);
          if (matchHeading && matchHeading[1].length < 60) {
            heading = matchHeading[1].replace(/^[#\s]+/, '').trim();
            content = matchHeading[2].trim();
          } else if (idx === 0) {
            heading = `Pengantar ${materialTitle || 'Materi'}`;
          }

          return {
            heading,
            content,
            callout:
              idx === 0
                ? {
                    type: 'concept',
                    title: 'Intisari Pembelajaran',
                    text: `Pahami prinsip dasar dari topik ${materialTitle || 'ini'} sebelum melanjutkan ke materi berikutnya.`,
                  }
                : idx === paragraphs.length - 1
                ? {
                    type: 'tip',
                    title: 'Catatan Perkuliahan',
                    text: 'Terapkan konsep di atas dan diskusikan implementasinya bersama kelompok tugas perkuliahan Anda.',
                  }
                : null,
          };
        }),
      };
    }

    // 2. JIKA DESKRIPSI KOSONG, CEK APAKAH TOPIK INI SESUAI DENGAN MODUL RPL/SDLC BAWAAN
    const isAuthenticRpl =
      titleLower.includes('rekayasa perangkat lunak') ||
      titleLower.includes('sdlc') ||
      titleLower.includes('rpl') ||
      titleLower.includes('analisis & desain');

    const predefined = DEFAULT_MODULE_CONTENT[num];
    if (isAuthenticRpl && predefined) {
      return {
        ...predefined,
        title: materialTitle || predefined.title,
      };
    }

    // 3. FALLBACK DINAMIS JIKA DESKRIPSI KOSONG DAN BUKAN MATERI RPL
    return {
      title: materialTitle || `Materi Pertemuan ${meetingNumber}`,
      readingTime: '4 menit baca',
      objectives: [
        `Memahami capaian pembelajaran untuk topik ${materialTitle || `pertemuan ke-${meetingNumber}`}.`,
        'Mempelajari materi melalui modul bacaan dan lampiran berkas yang tersedia.',
      ],
      sections: [
        {
          heading: `Pokok Bahasan: ${materialTitle || `Pertemuan ${meetingNumber}`}`,
          content: `Modul perkuliahan untuk topik "${materialTitle || `Pertemuan ${meetingNumber}`}". Anda dapat membaca materi secara lengkap atau membuka lampiran berkas presentasi/dokumen yang tersedia pada tombol "Opsi Dokumen" di atas.`,
          callout: {
            type: 'concept',
            title: 'Catatan Modul',
            text: 'Gunakan tombol Opsi Dokumen untuk melihat berkas lampiran slide presentasi atau dokumen modul pembelajaran.',
          },
        },
      ],
    };
  },

  /**
   * Menghasilkan konten pembelajaran ala Dicoding untuk halaman Buka Dokumen Lengkap Tugas Mahasiswa
   */
  getTaskContent(taskItem) {
    if (!taskItem) return null;

    const title = taskItem.title || 'Dokumen Tugas Mahasiswa';
    const student = taskItem.student_name || 'Mahasiswa UMC';
    const desc = (taskItem.description || '').trim();

    // 1. Jika tugas memiliki deskripsi teks pembahasan mandiri di database, selalu utamakan teks asli!
    if (desc && desc.length > 0 && !title.toLowerCase().includes('imk') && !title.toLowerCase().includes('interaksi manusia')) {
      const rawParagraphs = desc.split(/\n\s*\n/).filter((p) => p.trim());
      const paragraphs = rawParagraphs.length > 0 ? rawParagraphs : [desc];

      return {
        title,
        subtitle: `Disusun oleh: ${student} · Universitas Muhammadiyah Cirebon`,
        readingTime: `${Math.max(2, Math.ceil(desc.split(/\s+/).length / 150))} menit baca`,
        meta: {
          course: 'Tugas Perkuliahan',
          studentName: student,
          docType: taskItem.file_type?.toUpperCase() || 'DOKUMEN',
        },
        objectives: [
          `Menyelesaikan instruksi dan lembar kerja ${title}.`,
          'Menguraikan pembahasan hasil analisis secara komprehensif dan terstruktur.',
        ],
        sections: paragraphs.map((par, idx) => ({
          heading: idx === 0 ? 'Deskripsi & Lembar Tugas' : `Pembahasan Bagian ${idx + 1}`,
          content: par,
        })),
      };
    }

    // 2. Modul tugas terstruktur untuk tugas IMK (Interaksi Manusia dan Komputer)
    if (
      taskItem.id === '79a78fbb-fe02-4198-a0ee-1651e6a7065b' ||
      title.toLowerCase().includes('imk') ||
      title.toLowerCase().includes('interaksi') ||
      desc.toLowerCase().includes('imk')
    ) {
      return {
        title: title || 'Tugas 1: Pertanyaan Diskusi dan Evaluasi IMK',
        subtitle: 'Program Studi S1 Teknik Informatika · Fakultas Teknik · Universitas Muhammadiyah Cirebon',
        readingTime: '7 menit baca',
        meta: {
          course: 'Interaksi Manusia dan Komputer (IMK)',
          studentName: student,
          prodi: 'Teknik Informatika · Fakultas Teknik',
          docType: 'Laporan Tugas & Jawaban Diskusi Evaluasi',
        },
        objectives: [
          'Menjelaskan definisi Interaksi Manusia dan Komputer (IMK) beserta contoh penerapan nyata pada mesin ATM dan sistem navigasi.',
          'Menganalisis perbandingan antarmuka CLI vs GUI dari sisi kemudahan belajar, efisiensi waktu, dan beban memori pengguna.',
          'Mengidentifikasi faktor ergonomi fisik, persepsi visual, dan beban kognitif pada perancangan aplikasi mobile.',
          'Menganalisis perangkat input/output pada studi kasus aplikasi WhatsApp serta merumuskan dua usulan perbaikan desain antarmuka.',
        ],
        sections: [
          {
            heading: '1. Definisi Interaksi Manusia dan Komputer (IMK) & Contoh Penerapan',
            content: `Interaksi Manusia dan Komputer (IMK) adalah disiplin ilmu yang mempelajari perancangan, evaluasi, dan implementasi sistem komputasi interaktif untuk digunakan oleh manusia, serta studi tentang fenomena utama yang mengelilinginya.

Fokus utama dari IMK adalah menciptakan antarmuka yang mudah digunakan, efisien, aman, dan memberikan pengalaman yang memuaskan bagi pengguna melalui penggabungan ilmu komputer, psikologi kognitif, desain grafis, dan ergonomi.

Contoh Penerapan Nyata:
1. Mesin Anjungan Tunai Mandiri (ATM): Antarmuka ATM dirancang dengan tombol fisik atau layar sentuh berukuran besar, instruksi langkah demi langkah yang jelas, serta umpan balik suara dan visual agar dapat digunakan oleh masyarakat dari berbagai latar belakang usia dan pendidikan tanpa memerlukan pelatihan khusus.
2. Sistem Navigasi Kendaraan & Peta Digital: Menggunakan panduan suara dan visual peta yang disederhanakan agar pengemudi tetap dapat menerima informasi arah jalan secara akurat tanpa mengganggu konsentrasi saat berkendara.`,
            callout: {
              type: 'important',
              title: 'Prinsip Kunci IMK',
              text: 'Sistem komputasi yang unggul bukan hanya canggih secara algoritma, melainkan mampu menyesuaikan diri dengan keterbatasan dan cara berpikir alami manusia.',
            },
          },
          {
            heading: '2. Analisis Perbandingan: Command Line Interface (CLI) vs GUI',
            content: `Command Line Interface (CLI) dan Graphical User Interface (GUI) memiliki karakteristik yang sangat berbeda dalam pengalaman interaksi pengguna:

1. Kemudahan Belajar (Learnability):
• GUI jauh lebih mudah dipelajari oleh pengguna pemula karena memanfaatkan metafora dunia nyata (ikon map, tombol, jendela, dan kursor).
• CLI memiliki kurva belajar yang curam karena pengguna harus memahami aturan penulisan perintah atau sintaksis spesifik sebelum dapat mengoperasikan sistem.

2. Efisiensi Kerja (Efficiency):
• CLI sangat unggul bagi pengguna mahir (sistem administrator & pemrogram) karena tugas berulang dan rumit dapat dieksekusi sangat cepat menggunakan satu baris perintah atau skrip otomatisasi.
• GUI efisien untuk tugas umum sehari-hari, namun menjadi kurang efisien untuk pemrosesan skala besar yang repetitif karena menuntut banyak klik manual.

3. Kebutuhan Memori (Memory Load):
• CLI menuntut beban ingatan yang sangat tinggi (Recall) karena pengguna wajib menghafal ratusan nama perintah, atribut, dan parameter di luar kepala.
• GUI menuntut beban ingatan sangat rendah (Recognition) karena seluruh pilihan aksi sudah disajikan secara visual di layar.`,
            table: {
              title: 'Tabel Perbandingan Karakteristik Antarmuka CLI vs GUI',
              headers: ['Aspek Evaluasi', 'Command Line Interface (CLI)', 'Graphical User Interface (GUI)'],
              rows: [
                ['Kemudahan Belajar', 'Sulit (memerlukan hafalan sintaks spesifik)', 'Sangat Mudah (intuitif dengan metafora visual)'],
                ['Efisiensi Pengguna Ahli', 'Sangat Tinggi (eksekusi satu baris perintah / skrip)', 'Sedang (terbatas pada klik dan navigasi menu manual)'],
                ['Beban Kognitif / Ingatan', 'Tinggi (Prinsip Recall: wajib hafal nama perintah)', 'Rendah (Prinsip Recognition: seluruh opsi tampak di layar)'],
                ['Kebutuhan Sumber Daya', 'Sangat Ringan (hanya teks terminal)', 'Lebih Besar (rendering grafis & window manager)'],
                ['Target Pengguna Utama', 'Administrator Jaringan, Sysadmin, Developer', 'Masyarakat Umum, Mahasiswa, Klien Bisnis'],
              ],
            },
            callout: {
              type: 'concept',
              title: 'Prinsip Recognition vs Recall',
              text: 'Memori kerja manusia sangat terbatas. Antarmuka yang menyajikan opsi visual jelas (recognition) secara signifikan mengurangi kelelahan mental pengguna dan menekan risiko human error.',
            },
          },
          {
            heading: '3. Faktor Ergonomi Manusia dalam Perancangan Aplikasi Mobile',
            content: `Ketika merancang aplikasi pada perangkat seluler, terdapat 3 faktor manusia krusial yang wajib dipertimbangkan:

1. Aspek Motorik & Anatomi Fisik (Thumb Zone):
Keterbatasan jangkauan jemari saat memegang ponsel satu tangan menuntut sasaran sentuh (tombol) berukuran minimal 44 × 44 piksel dan penempatan navigasi utama di area yang mudah dijangkau ibu jari agar terhindar dari salah tekan.

2. Persepsi Visual di Lingkungan yang Berubah:
Perangkat mobile digunakan di bawah sinar matahari terik maupun di ruangan gelap. Rasio kontras teks, hierarki tipografi, dan mode gelap-terang harus menjamin informasi terbaca jelas tanpa membuat mata cepat lelah.

3. Keterbatasan Perhatian & Beban Kognitif saat Bergerak:
Pengguna sering memakai ponsel sambil berjalan, mengantre, atau berada di tempat umum yang penuh gangguan. Alur interaksi harus dirancang sesederhana mungkin dan sistem harus mampu memulihkan posisi terakhir secara mulus saat perhatian pengguna kembali.`,
            callout: {
              type: 'tip',
              title: 'Tips Desain Aplikasi Ponsel',
              text: 'Hindari meletakkan tombol destruktif (misal: Hapus Permanen) di dekat area jangkauan jemari alami untuk mencegah penekanan yang tidak disengaja.',
            },
          },
          {
            heading: '4. Studi Kasus Aplikasi WhatsApp: Identifikasi Perangkat I/O & Rekomendasi Desain',
            content: `Identifikasi Perangkat Input dan Output:
• Perangkat Input: Layar sentuh kapasitif (mengetik pesan teks melalui papan ketik virtual, menekan tombol, dan menggulir layar), mikrofon (merekam pesan suara dan panggilan telepon), kamera (mengambil foto, merekam video, memindai kode QR), sensor lokasi GPS (membagikan live location), dan sensor jarak (proximity sensor untuk mematikan layar saat ponsel didekatkan ke telinga).
• Perangkat Output: Layar tampilan ponsel (menyajikan obrolan, gambar, video, dan status), pengeras suara/speaker dan earphone (mengeluarkan nada dering, suara pesan suara, dan suara panggilan), serta motor getar (aktuator haptik) untuk memberikan umpan balik getaran fisik saat ada panggilan atau pesan masuk.

Dua Usulan Perbaikan Desain Antarmuka:
1. Fitur Pengelompokan Obrolan Otomatis (Custom Categories / Folders):
Menambahkan tab kategori di bagian atas (misal: Pribadi, Kuliah, Pekerjaan, Grup) untuk mengurangi kekacauan visual dan mempercepat pencarian pesan di antara ratusan obrolan aktif.
2. Fitur Pratinjau dan Pemotongan Pesan Suara (Voice Note Trimming):
Menyediakan fitur untuk memotong bagian rekaman suara yang salah ucap atau menyambung rekaman yang terjeda sebelum dikirimkan, sehingga pengguna tidak perlu menghapus seluruh rekaman dan mengulang dari awal saat terjadi salah kata di akhir rekaman panjang.`,
            callout: {
              type: 'important',
              title: 'Nilai Kegunaan Solusi (Usability Value)',
              text: 'Fitur pemotongan rekaman suara secara langsung menghemat waktu pengguna dan mengeliminasi rasa frustrasi (friction) dalam proses komunikasi berbasis suara.',
            },
          },
        ],
      };
    }

    // Jika tugas umum memiliki deskripsi teks panjang
    if (desc && desc.length > 80) {
      const paragraphs = desc.split('\n\n').filter((p) => p.trim());
      return {
        title,
        subtitle: `Disusun oleh: ${student} · Universitas Muhammadiyah Cirebon`,
        readingTime: `${Math.max(3, Math.ceil(desc.split(' ').length / 130))} menit baca`,
        meta: {
          course: 'Tugas Perkuliahan',
          studentName: student,
          docType: taskItem.file_type?.toUpperCase() || 'DOKUMEN',
        },
        objectives: [
          `Menyelesaikan instruksi dan lembar kerja ${title}.`,
          'Menguraikan argumentasi analisis secara komprehensif dan terstruktur.',
        ],
        sections: paragraphs.map((par, idx) => ({
          heading: idx === 0 ? 'Deskripsi & Lembar Tugas' : `Pembahasan Bagian ${idx + 1}`,
          content: par,
        })),
      };
    }

    // Fallback umum tugas
    return {
      title,
      subtitle: `Disusun oleh: ${student} · Universitas Muhammadiyah Cirebon`,
      readingTime: '5 menit baca',
      meta: {
        course: 'Tugas Perkuliahan',
        studentName: student,
        docType: taskItem.file_type?.toUpperCase() || 'DOKUMEN',
      },
      objectives: [
        `Memahami instruksi pengerjaan ${title}.`,
        'Mempelajari lembar jawaban atau berkas lampiran yang diunggah mahasiswa.',
      ],
      sections: [
        {
          heading: '1. Petunjuk Dokumen Tugas',
          content:
            desc ||
            'Silakan pelajari lembaran dokumen tugas atau jalankan ekstraksi halaman PDF di bawah ini untuk membaca seluruh isi tugas secara lengkap.',
        },
      ],
    };
  },
};

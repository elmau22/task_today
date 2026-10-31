// Artikel awal; hanya dimasukkan bila tabel blogs masih kosong.
export const INITIAL_BLOGS = [
  {
    id: 'b1',
    title: 'Pentingnya Tahap Analisis Kebutuhan dalam Pengembangan Sistem Informasi',
    slug: 'pentingnya-analisis-kebutuhan-sistem',
    category: 'Analisis Sistem',
    author: 'Mohamad Farael Maulana',
    date: '2026-10-20',
    read_time: '4 menit baca',
    cover_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
    summary: 'Mengapa lebih dari 60% kegagalan proyek perangkat lunak berakar dari ketidakjelasan definisi kebutuhan awal pengguna.',
    content: `Dalam siklus hidup pengembangan sistem (SDLC), tahap analisis kebutuhan sering kali menjadi penentu utama keberhasilan atau kegagalan sebuah proyek. Banyak pengembang tergoda untuk langsung melompat ke tahap penulisan kode tanpa memahami masalah inti yang dihadapi pengguna akhir.

Ketika kebutuhan sistem tidak diidentifikasi dan didokumentasikan dengan cermat, perubahan lingkup (scope creep) di pertengahan proyek akan menjadi tak terelakkan. Biaya perbaikan kesalahan analisis pada fase implementasi bisa mencapai 10 hingga 100 kali lebih mahal dibandingkan jika diperbaiki sejak awal.

Oleh karena itu, penguasaan teknik wawancara, observasi proses bisnis, dan pemodelan seperti Use Case Diagram dan Activity Diagram menjadi fondasi yang mutlak bagi setiap mahasiswa sistem informasi.`,
    is_featured: true,
  },
  {
    id: 'b2',
    title: 'Transformasi dari DFD Klasik Menuju Pemodelan Berorientasi Objek UML',
    slug: 'transformasi-dfd-ke-uml',
    category: 'Metodologi',
    author: 'Mohamad Farael Maulana',
    date: '2026-10-18',
    read_time: '5 menit baca',
    cover_url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80',
    summary: 'Perbandingan komprehensif antara Data Flow Diagram (DFD) struktural dan Unified Modeling Language (UML) dalam memetakan arsitektur modern.',
    content: `Pendekatan terstruktur yang dipelopori oleh DFD dan Kamus Data memberikan perspektif aliran data yang sangat jelas dalam organisasi. Namun, seiring dengan dominasi pemrograman berorientasi objek dan arsitektur microservices, UML hadir memberikan bahasa visual standar yang lebih kaya.

UML mengintegrasikan struktur statis (Class Diagram, Component Diagram) dengan perilaku dinamis (Sequence Diagram, State Machine Diagram). Memahami kapan harus menerapkan pemodelan proses berbasis DFD dan kapan beralih ke representasi objek UML adalah kompetensi esensial bagi seorang calon analis sistem.`,
    is_featured: true,
  },
  {
    id: 'b3',
    title: 'Tips Menyusun Dokumen SRS (Software Requirements Specification) yang Rapi',
    slug: 'tips-menyusun-dokumen-srs',
    category: 'Tips Kuliah',
    author: 'Mohamad Farael Maulana',
    date: '2026-10-14',
    read_time: '3 menit baca',
    cover_url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
    summary: 'Panduan praktis bagi mahasiswa agar tugas besar analisis sistem memiliki dokumentasi yang memenuhi standar IEEE 830.',
    content: `Dokumen SRS bukan sekadar formalitas pengumpulan tugas kuliah, melainkan kontrak kesepakatan antara analis, pengembang, dan pemangku kepentingan.

Tiga prinsip penting dalam menyusun SRS yang baik:
1. Ketelitian Kebutuhan Fungsional: Bedakan secara tegas antara apa yang sistem lakukan dan bagaimana sistem melakukannya.
2. Spesifikasi Non-Fungsional: Cantumkan parameter performa, keamanan, dan ketersediaan sistem dengan indikator terukur, bukan sekadar kata "cepat" atau "aman".
3. Ketertelusuran (Traceability): Pastikan setiap rancangan antarmuka dan basis data dapat dirunut kembali ke nomor kebutuhan fungsional yang bersangkutan.`,
    is_featured: true,
  },
  {
    id: 'b4',
    title: 'Mengenal Agile vs Waterfall dalam Praktik Proyek Perangkat Lunak Kampus',
    slug: 'agile-vs-waterfall-proyek-kampus',
    category: 'Metodologi',
    author: 'Mohamad Farael Maulana',
    date: '2026-10-10',
    read_time: '4 menit baca',
    cover_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    summary: 'Menentukan metodologi yang paling realistis untuk tugas perkuliahan dengan tenggat waktu satu semester.',
    content: `Dalam perkuliahan Analisis & Desain Sistem, mahasiswa kerap dihadapkan pada dilema memilih antara Waterfall yang terencana ketat atau Agile (Scrum) yang fleksibel dan iteratif.

Untuk proyek mata kuliah dengan tenggat waktu satu semester, pendekatan hybrid sering kali memberikan hasil terbaik: fase inisiasi dan analisis dasar dilakukan secara berurutan, kemudian perancangan antarmuka dan prototipe diiterasi dalam sprint pendek dua mingguan.`,
    is_featured: false,
  },
];

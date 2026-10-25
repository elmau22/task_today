/**
 * Layanan Pembantu Metadata Multi-Mata Kuliah
 * Mengelola kolom Dosen Pengampu, Mata Kuliah, Program Studi, dan Universitas
 * untuk Tugas dan Materi di portal Task Today.
 */

export function parseItemMetadata(item, defaultCourse = 'Analisis & Desain Sistem') {
  if (!item) {
    return {
      course: defaultCourse,
      lecturer: 'Dian Ade Kurnia, M.Kom',
      prodi: 'S1 Teknik Informatika',
      university: 'Universitas Muhammadiyah Cirebon',
      cleanDescription: '',
    };
  }

  // Mendukung parameter baik berupa objek utuh (item) maupun string (description)
  const itemObj = typeof item === 'string' ? { description: item } : item;

  let course = itemObj.mata_kuliah || itemObj.subject || '';
  let lecturer = itemObj.dosen_pengampu || itemObj.lecturer || '';
  let prodi = itemObj.prodi || itemObj.study_program || '';
  let university = itemObj.universitas || itemObj.university || '';
  let coverUrl = itemObj.cover_url || itemObj.coverUrl || '';
  let cleanDescription = itemObj.description || '';

  // Ekstrak dari format terstruktur <!--META:{...}--> jika tersimpan di deskripsi
  if (cleanDescription.includes('<!--META:')) {
    try {
      const match = cleanDescription.match(/<!--META:(.*?)-->/);
      if (match && match[1]) {
        const parsed = JSON.parse(match[1]);
        course = course || parsed.course || '';
        lecturer = lecturer || parsed.lecturer || '';
        prodi = prodi || parsed.prodi || '';
        university = university || parsed.university || '';
        coverUrl = coverUrl || parsed.coverUrl || '';
        cleanDescription = cleanDescription.replace(/<!--META:.*?-->\s*/, '').trim();
      }
    } catch (e) {
      console.warn('Gagal membaca tag metadata item:', e);
    }
  }

  // Inferensi otomatis berdasarkan judul atau isi jika belum terisi
  if (!course) {
    const combined = `${item.title || ''} ${cleanDescription}`.toLowerCase();
    if (combined.includes('imk') || combined.includes('interaksi manusia')) {
      course = 'Interaksi Manusia dan Komputer';
    } else if (combined.includes('basis data') || combined.includes('database')) {
      course = 'Basis Data';
    } else if (combined.includes('web') || combined.includes('pemrograman web')) {
      course = 'Pemrograman Web';
    } else if (
      combined.includes('sdlc') ||
      combined.includes('rekayasa perangkat lunak') ||
      combined.includes('analisis & desain')
    ) {
      course = 'Analisis & Desain Perangkat Lunak';
    } else {
      course = defaultCourse;
    }
  }

  if (!lecturer) {
    lecturer = course.includes('Interaksi')
      ? 'Dosen Pengampu IMK'
      : 'Ibu Dian (Dosen Pengampu)';
  }

  if (!prodi) {
    prodi = 'S1 Teknik Informatika';
  }

  if (!university) {
    university = 'Universitas Muhammadiyah Cirebon';
  }

  return {
    ...item,
    course,
    lecturer,
    prodi,
    university,
    coverUrl: coverUrl || item.cover_url || '',
    cleanDescription,
  };
}

export function packItemMetadata(metadata, userDescription = '') {
  const metaObj = {
    course: metadata.course || 'Analisis & Desain Perangkat Lunak',
    lecturer: metadata.lecturer || 'Dian Ade Kurnia, M.Kom',
    prodi: metadata.prodi || 'S1 Teknik Informatika',
    university: metadata.university || 'Universitas Muhammadiyah Cirebon',
    ...(metadata.coverUrl && { coverUrl: metadata.coverUrl }),
  };
  const clean = (userDescription || '').replace(/<!--META:.*?-->\s*/, '').trim();
  return `<!--META:${JSON.stringify(metaObj)}-->\n\n${clean}`;
}

// Daftar opsi mata kuliah bawaan untuk mempermudah pemilihan
export const COMMON_COURSES = [
  'Analisis & Desain Perangkat Lunak',
  'Interaksi Manusia dan Komputer',
  'Pemrograman Berorientasi Objek',
  'Pemrograman Web & Mobile',
  'Basis Data',
  'Rekayasa Perangkat Lunak',
  'Jaringan Komputer',
  'Kecerdasan Buatan',
  'Sistem Operasi',
  'Struktur Data & Algoritma',
];

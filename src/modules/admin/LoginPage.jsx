import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { blogService } from '../../services/blogService';
import SplitText from '../../components/effects/SplitText';
import Reveal from '../../components/effects/Reveal';
import SuccessModal from '../../components/SuccessModal';
import PreviewModal from '../../components/PreviewModal';
import { pdfExtractorService } from '../../services/pdfExtractorService';
import { parseItemMetadata, packItemMetadata, COMMON_COURSES } from '../../services/metadataHelper';

const DEFAULT_COVER =
  'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80';

export default function LoginPage() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('portal_user_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [inputName, setInputName] = useState('');
  const [inputNim, setInputNim] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState('tugas'); // 'tugas', 'materi', 'blog', 'logs'
  const [loading, setLoading] = useState(false);

  // Data
  const [assignments, setAssignments] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [deletionLogs, setDeletionLogs] = useState([]);

  // Form Tugas
  const [taskEditId, setTaskEditId] = useState(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskStudent, setTaskStudent] = useState('');
  const [taskCourse, setTaskCourse] = useState('Analisis & Desain Perangkat Lunak');
  const [taskLecturer, setTaskLecturer] = useState('Dian Ade Kurnia, M.Kom');
  const [taskProdi, setTaskProdi] = useState('S1 Teknik Informatika');
  const [taskUniversity, setTaskUniversity] = useState('Universitas Muhammadiyah Cirebon');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskType, setTaskType] = useState('pdf');
  const [taskYoutube, setTaskYoutube] = useState('');
  const [taskCoverFile, setTaskCoverFile] = useState(null);
  const [taskCoverPreview, setTaskCoverPreview] = useState('');
  const [taskDocFile, setTaskDocFile] = useState(null);

  // Form Materi
  const [matEditId, setMatEditId] = useState(null);
  const [matMeeting, setMatMeeting] = useState(1);
  const [matTitle, setMatTitle] = useState('');
  const [matCourse, setMatCourse] = useState('Analisis & Desain Perangkat Lunak');
  const [matLecturer, setMatLecturer] = useState('Dian Ade Kurnia, M.Kom');
  const [matProdi, setMatProdi] = useState('S1 Teknik Informatika');
  const [matUniversity, setMatUniversity] = useState('Universitas Muhammadiyah Cirebon');
  const [matDesc, setMatDesc] = useState('');
  const [matType, setMatType] = useState('pdf');
  const [matYoutube, setMatYoutube] = useState('');
  const [matDocFile, setMatDocFile] = useState(null);
  const [matCoverFile, setMatCoverFile] = useState(null);
  const [matCoverPreview, setMatCoverPreview] = useState('');

  // Form Blog
  const [blogEditId, setBlogEditId] = useState(null);
  const [blogTitle, setBlogTitle] = useState('');
  const [blogCategory, setBlogCategory] = useState('Analisis Sistem');
  const [blogAuthor, setBlogAuthor] = useState('Mohamad Farael Maulana');
  const [blogReadTime, setBlogReadTime] = useState('4 menit baca');
  const [blogCoverUrl, setBlogCoverUrl] = useState('');
  const [blogSummary, setBlogSummary] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogFeatured, setBlogFeatured] = useState(false);

  // Modal Status & Pratinjau
  const [successModalData, setSuccessModalData] = useState({
    isOpen: false,
    title: '',
    subtitle: '',
    itemType: '',
    item: null,
    targetUrl: '',
  });

  const [activePreview, setActivePreview] = useState(null);
  const [extractingPdfText, setExtractingPdfText] = useState(false);

  const handleExtractMatPdfText = async () => {
    if (!matDocFile) {
      alert('Pilih berkas dokumen PDF materi terlebih dahulu.');
      return;
    }
    setExtractingPdfText(true);
    try {
      const fullText = await pdfExtractorService.extractAllTextOnly(matDocFile);
      if (fullText) {
        setMatDesc((prev) => (prev ? `${prev}\n\n${fullText}` : fullText));
        alert('Seluruh isi teks PDF berhasil diekstrak ke dalam kolom bacaan modul!');
      } else {
        alert('Tidak ditemukan karakter teks pada berkas PDF ini (kemungkinan hasil scan gambar).');
      }
    } catch (err) {
      alert('Gagal mengekstrak teks PDF: ' + err.message);
    } finally {
      setExtractingPdfText(false);
    }
  };

  const handleMatFileChange = async (file) => {
    setMatDocFile(file);
    if (!file) return;

    const isPdf = matType === 'pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (isPdf) {
      setExtractingPdfText(true);
      try {
        // 1. Otomatis buat cover materi dari halaman pertama PDF
        const coverRes = await pdfExtractorService.renderFirstPageAsCover(file);
        if (coverRes) {
          setMatCoverPreview(coverRes.dataUrl);
          setMatCoverFile(coverRes.file);
        }

        // 2. Otomatis ekstrak seluruh teks modul materi
        const fullText = await pdfExtractorService.extractAllTextOnly(file);
        if (fullText) {
          setMatDesc((prev) => (prev ? `${prev}\n\n${fullText}` : fullText));
        }
      } catch (err) {
        console.warn('Gagal ekstraksi materi otomatis:', err);
      } finally {
        setExtractingPdfText(false);
      }
    }
  };

  const handleExtractTaskPdfText = async () => {
    if (!taskDocFile) {
      alert('Pilih berkas dokumen PDF tugas terlebih dahulu.');
      return;
    }
    setExtractingPdfText(true);
    try {
      const fullText = await pdfExtractorService.extractAllTextOnly(taskDocFile);
      if (fullText) {
        setTaskDesc((prev) => (prev ? `${prev}\n\n${fullText}` : fullText));
        alert('Seluruh isi teks PDF berhasil diekstrak ke dalam kolom deskripsi tugas!');
      } else {
        alert('Tidak ditemukan karakter teks pada berkas PDF ini (kemungkinan hasil scan gambar).');
      }
    } catch (err) {
      alert('Gagal mengekstrak teks PDF: ' + err.message);
    } finally {
      setExtractingPdfText(false);
    }
  };

  const handleTaskFileChange = async (file) => {
    setTaskDocFile(file);
    if (!file) return;

    const isPdf = taskType === 'pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (isPdf) {
      setExtractingPdfText(true);
      try {
        // 1. Otomatis buat cover tugas dari halaman pertama PDF
        const coverRes = await pdfExtractorService.renderFirstPageAsCover(file);
        if (coverRes) {
          setTaskCoverPreview(coverRes.dataUrl);
          setTaskCoverFile(coverRes.file);
        }

        // 2. Otomatis ekstrak seluruh teks tugas
        const fullText = await pdfExtractorService.extractAllTextOnly(file);
        if (fullText) {
          setTaskDesc((prev) => (prev ? `${prev}\n\n${fullText}` : fullText));
        }
      } catch (err) {
        console.warn('Gagal ekstraksi tugas otomatis:', err);
      } finally {
        setExtractingPdfText(false);
      }
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadAllDashboardData();
    }
  }, [currentUser]);

  async function loadAllDashboardData() {
    try {
      const { data: tasks } = await supabase
        .from('assignments')
        .select('*')
        .order('created_at', { ascending: false });
      const { data: mats } = await supabase
        .from('materials')
        .select('*')
        .order('meeting_number', { ascending: true });
      const { data: logs } = await supabase
        .from('deletion_logs')
        .select('*')
        .order('deleted_at', { ascending: false });

      if (tasks) setAssignments(tasks);
      if (mats) setMaterials(mats);
      if (logs) setDeletionLogs(logs);

      const blogList = await blogService.getAll();
      setBlogs(blogList);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  }

  /* ------------------- AUTENTIKASI ------------------- */
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const cleanName = inputName.trim().toLowerCase();
    const cleanNim = inputNim.trim();

    const isValidName =
      cleanName === 'elmau22' ||
      cleanName === 'mohamad farael maulana' ||
      cleanName === 'farael';
    const isValidNim = cleanNim === '240511086';

    if (isValidName && isValidNim) {
      const displayName = cleanName === 'elmau22' ? 'Mohamad Farael Maulana' : inputName.trim();
      const sessionData = { name: displayName, nim: cleanNim };
      setCurrentUser(sessionData);
      localStorage.setItem('portal_user_session', JSON.stringify(sessionData));
      setLoginError('');
      setBlogAuthor(displayName);
    } else {
      setLoginError('Nama Pengguna atau Kata Sandi NIM tidak sesuai. Silakan periksa kembali.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('portal_user_session');
  };

  /* ------------------- STORAGE HELPER ------------------- */
  const uploadFileSafe = async (file, bucket) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const { error } = await supabase.storage.from(bucket).upload(fileName, file);
      if (error) throw error;
      const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
      return data.publicUrl;
    } catch {
      // Fallback object url
      return URL.createObjectURL(file);
    }
  };

  /* ------------------- FORM TUGAS ACTIONS ------------------- */
  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalCover = taskCoverPreview || DEFAULT_COVER;
      let finalDoc = taskYoutube;

      if (taskCoverFile) {
        finalCover = await uploadFileSafe(taskCoverFile, 'covers');
      }

      if (taskType !== 'youtube' && taskDocFile) {
        finalDoc = await uploadFileSafe(taskDocFile, 'attachments');
      }

      const packedTaskDesc = packItemMetadata(
        {
          course: taskCourse,
          lecturer: taskLecturer,
          prodi: taskProdi,
          university: taskUniversity,
        },
        taskDesc
      );

      if (taskEditId) {
        const { error } = await supabase
          .from('assignments')
          .update({
            title: taskTitle,
            student_name: taskStudent,
            description: packedTaskDesc,
            file_type: taskType,
            cover_url: finalCover,
            ...(finalDoc && { file_url: finalDoc }),
          })
          .eq('id', taskEditId);
        if (error) throw error;
        setSuccessModalData({
          isOpen: true,
          title: 'Tugas Berhasil Diperbarui',
          subtitle: `${taskTitle} (${taskCourse} • Oleh ${taskStudent})`,
          itemType: 'Tugas',
          targetUrl: '/tugas',
          item: {
            id: taskEditId,
            title: taskTitle,
            student_name: taskStudent,
            description: packedTaskDesc,
            file_type: taskType,
            cover_url: finalCover,
            file_url: finalDoc,
          },
        });
      } else {
        const { data: inserted, error } = await supabase
          .from('assignments')
          .insert([
            {
              title: taskTitle,
              student_name: taskStudent,
              description: packedTaskDesc,
              file_type: taskType,
              cover_url: finalCover,
              file_url: finalDoc || '#',
              is_featured: false,
            },
          ])
          .select()
          .single();
        if (error) throw error;
        setSuccessModalData({
          isOpen: true,
          title: 'Tugas Baru Berhasil Dikumpulkan',
          subtitle: `${taskTitle} (${taskCourse} • Oleh ${taskStudent})`,
          itemType: 'Tugas',
          targetUrl: '/tugas',
          item: inserted || {
            title: taskTitle,
            student_name: taskStudent,
            description: packedTaskDesc,
            file_type: taskType,
            cover_url: finalCover,
            file_url: finalDoc,
          },
        });
      }

      resetTaskForm();
      loadAllDashboardData();
    } catch (err) {
      alert('Gagal menyimpan tugas: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetTaskForm = () => {
    setTaskEditId(null);
    setTaskTitle('');
    setTaskStudent(currentUser ? currentUser.name : '');
    setTaskCourse('Analisis & Desain Perangkat Lunak');
    setTaskLecturer('Dian Ade Kurnia, M.Kom');
    setTaskProdi('S1 Teknik Informatika');
    setTaskUniversity('Universitas Muhammadiyah Cirebon');
    setTaskDesc('');
    setTaskType('pdf');
    setTaskYoutube('');
    setTaskCoverFile(null);
    setTaskCoverPreview('');
    setTaskDocFile(null);
  };

  const startEditTask = (task) => {
    const parsed = parseItemMetadata(task);
    setTaskEditId(task.id);
    setTaskTitle(task.title);
    setTaskStudent(task.student_name || '');
    setTaskCourse(parsed.course);
    setTaskLecturer(parsed.lecturer);
    setTaskProdi(parsed.prodi);
    setTaskUniversity(parsed.university);
    setTaskDesc(parsed.cleanDescription || '');
    setTaskType(task.file_type || 'pdf');
    setTaskCoverPreview(task.cover_url || '');
    if (task.file_type === 'youtube') setTaskYoutube(task.file_url || '');
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  const deleteTask = async (task) => {
    if (!window.confirm(`Hapus tugas "${task.title}"?`)) return;
    try {
      await supabase.from('assignments').delete().eq('id', task.id);
      loadAllDashboardData();
    } catch (err) {
      alert('Gagal menghapus tugas: ' + err.message);
    }
  };

  const toggleTaskFeatured = async (task) => {
    await supabase
      .from('assignments')
      .update({ is_featured: !task.is_featured })
      .eq('id', task.id);
    loadAllDashboardData();
  };

  /* ------------------- FORM MATERI ACTIONS ------------------- */
  const handleMaterialSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalDoc = matYoutube;
      let finalCover = matCoverPreview || '';

      if (matCoverFile) {
        finalCover = await uploadFileSafe(matCoverFile, 'covers');
      }

      if (matType !== 'youtube' && matDocFile) {
        finalDoc = await uploadFileSafe(matDocFile, 'attachments');
      }

      const packedMatDesc = packItemMetadata(
        {
          course: matCourse,
          lecturer: matLecturer,
          prodi: matProdi,
          university: matUniversity,
          coverUrl: finalCover,
        },
        matDesc
      );

      if (matEditId) {
        const { error } = await supabase
          .from('materials')
          .update({
            meeting_number: parseInt(matMeeting, 10),
            title: matTitle,
            description: packedMatDesc,
            file_type: matType,
            ...(finalDoc && { file_url: finalDoc }),
          })
          .eq('id', matEditId);
        if (error) throw error;
        setSuccessModalData({
          isOpen: true,
          title: 'Materi Pertemuan Berhasil Diperbarui',
          subtitle: `Pertemuan ${matMeeting}: ${matTitle} (${matCourse})`,
          itemType: 'Materi',
          targetUrl: '/materi',
          item: {
            id: matEditId,
            meeting_number: parseInt(matMeeting, 10),
            title: matTitle,
            description: packedMatDesc,
            file_type: matType,
            file_url: finalDoc,
          },
        });
      } else {
        const { data: inserted, error } = await supabase
          .from('materials')
          .insert([
            {
              meeting_number: parseInt(matMeeting, 10),
              title: matTitle,
              description: packedMatDesc,
              file_type: matType,
              file_url: finalDoc || '#',
              is_featured: false,
            },
          ])
          .select()
          .single();
        if (error) throw error;
        setSuccessModalData({
          isOpen: true,
          title: 'Materi Pertemuan Berhasil Disimpan',
          subtitle: `Pertemuan ${matMeeting}: ${matTitle} (${matCourse})`,
          itemType: 'Materi',
          targetUrl: '/materi',
          item: inserted || {
            meeting_number: parseInt(matMeeting, 10),
            title: matTitle,
            description: packedMatDesc,
            file_type: matType,
            file_url: finalDoc,
          },
        });
      }

      resetMaterialForm();
      loadAllDashboardData();
    } catch (err) {
      alert('Gagal menyimpan materi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetMaterialForm = () => {
    setMatEditId(null);
    setMatMeeting(materials.length + 1);
    setMatTitle('');
    setMatCourse('Analisis & Desain Perangkat Lunak');
    setMatLecturer('Dian Ade Kurnia, M.Kom');
    setMatProdi('S1 Teknik Informatika');
    setMatUniversity('Universitas Muhammadiyah Cirebon');
    setMatDesc('');
    setMatType('pdf');
    setMatYoutube('');
    setMatDocFile(null);
    setMatCoverFile(null);
    setMatCoverPreview('');
  };

  const startEditMaterial = (mat) => {
    const parsed = parseItemMetadata(mat);
    setMatEditId(mat.id);
    setMatMeeting(mat.meeting_number);
    setMatTitle(mat.title);
    setMatCourse(parsed.course);
    setMatLecturer(parsed.lecturer);
    setMatProdi(parsed.prodi);
    setMatUniversity(parsed.university);
    setMatDesc(parsed.cleanDescription || '');
    setMatType(mat.file_type || 'pdf');
    setMatCoverPreview(parsed.coverUrl || mat.cover_url || '');
    setMatCoverFile(null);
    if (mat.file_type === 'youtube') setMatYoutube(mat.file_url || '');
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  const deleteMaterial = async (mat) => {
    if (!window.confirm(`Hapus materi pertemuan "${mat.title}"?`)) return;
    try {
      await supabase.from('materials').delete().eq('id', mat.id);
      loadAllDashboardData();
    } catch (err) {
      alert('Gagal menghapus materi: ' + err.message);
    }
  };

  const toggleMaterialFeatured = async (mat) => {
    await supabase
      .from('materials')
      .update({ is_featured: !mat.is_featured })
      .eq('id', mat.id);
    loadAllDashboardData();
  };

  /* ------------------- FORM BLOG ACTIONS ------------------- */
  const handleBlogSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title: blogTitle,
        category: blogCategory,
        author: blogAuthor || 'Mohamad Farael Maulana',
        read_time: blogReadTime || '4 menit baca',
        cover_url:
          blogCoverUrl ||
          'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
        summary: blogSummary,
        content: blogContent,
        is_featured: blogFeatured,
      };

      if (blogEditId) {
        await blogService.update(blogEditId, payload);
        setSuccessModalData({
          isOpen: true,
          title: 'Artikel Blog Berhasil Diperbarui',
          subtitle: blogTitle,
          itemType: 'Blog',
          targetUrl: `/blog/${blogEditId}`,
        });
      } else {
        const savedBlog = await blogService.create(payload);
        setSuccessModalData({
          isOpen: true,
          title: 'Artikel Blog Baru Berhasil Diterbitkan',
          subtitle: blogTitle,
          itemType: 'Blog',
          targetUrl: savedBlog ? `/blog/${savedBlog.id}` : '/blog',
          item: savedBlog,
        });
      }

      resetBlogForm();
      const updated = await blogService.getAll();
      setBlogs(updated);
    } catch (err) {
      alert('Gagal menyimpan blog: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetBlogForm = () => {
    setBlogEditId(null);
    setBlogTitle('');
    setBlogCategory('Analisis Sistem');
    setBlogAuthor(currentUser?.name || 'Mohamad Farael Maulana');
    setBlogReadTime('4 menit baca');
    setBlogCoverUrl('');
    setBlogSummary('');
    setBlogContent('');
    setBlogFeatured(false);
  };

  const startEditBlog = (blog) => {
    setBlogEditId(blog.id);
    setBlogTitle(blog.title);
    setBlogCategory(blog.category || 'Analisis Sistem');
    setBlogAuthor(blog.author || 'Mohamad Farael Maulana');
    setBlogReadTime(blog.read_time || '4 menit baca');
    setBlogCoverUrl(blog.cover_url || '');
    setBlogSummary(blog.summary || '');
    setBlogContent(blog.content || '');
    setBlogFeatured(!!blog.is_featured);
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  const deleteBlog = async (blog) => {
    if (!window.confirm(`Hapus artikel blog "${blog.title}"?`)) return;
    try {
      await blogService.delete(blog.id);
      const updated = await blogService.getAll();
      setBlogs(updated);
    } catch (err) {
      alert('Gagal menghapus blog: ' + err.message);
    }
  };

  const toggleBlogFeatured = async (blog) => {
    await blogService.toggleFeatured(blog.id);
    const updated = await blogService.getAll();
    setBlogs(updated);
  };

  /* ------------------- TAMPILAN LOGIN JIKA BELUM MASUK ------------------- */
  if (!currentUser) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center py-3 py-md-5">
          <div className="col-12 col-sm-10 col-md-7 col-lg-5">
            <div className="text-center mb-4">
              <span className="eyebrow fade-up">Akses Pengguna</span>
              <SplitText as="h1" className="page-title fs-2" text="Login Portal" delay={150} stagger={50} />
              <p className="text-muted fade-up" style={{ animationDelay: '800ms' }}>
                Masukkan Nama dan NIM untuk mengelola form tugas, materi perkuliahan, dan artikel blog.
              </p>
            </div>

            <Reveal className="panel p-4 p-md-5" delay={300}>
              {loginError && (
                <div className="notice notice-info text-danger border-danger mb-4 small fw-bold">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLoginSubmit}>
                <div className="mb-3">
                  <label className="form-label">Nama Pengguna</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Masukkan nama pengguna..."
                    required
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    autoComplete="username"
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label">Kata Sandi / NIM</label>
                  <div className="input-group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control"
                      placeholder="Masukkan kata sandi NIM..."
                      required
                      value={inputNim}
                      onChange={(e) => setInputNim(e.target.value)}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="btn btn-quiet d-flex align-items-center justify-content-center px-3"
                      onClick={() => setShowPassword((prev) => !prev)}
                      title={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                      tabIndex="-1"
                      aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                    >
                      {showPassword ? (
                        /* Icon Mata Tutup (Eye Slash) */
                        <svg
                          width="19"
                          height="19"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        /* Icon Mata Buka (Eye Open) */
                        <svg
                          width="19"
                          height="19"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn btn-ember w-100 py-2">
                  Masuk ke Panel Konten
                </button>
              </form>
            </Reveal>
          </div>
        </div>
      </div>
    );
  }

  /* ------------------- TAMPILAN PANEL SETELAH LOGIN ------------------- */
  return (
    <div className="container pb-5">
      <header className="page-head d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-4">
        <div>
          <span className="eyebrow fade-up">Panel Pengelolaan</span>
          <SplitText as="h1" className="page-title" text="Dashboard Konten" delay={150} stagger={40} />
          <p className="section-lead mb-0 fade-up" style={{ animationDelay: '700ms' }}>
            Masuk sebagai: <strong>{currentUser.name}</strong> (NIM: {currentUser.nim}). Kelola form tugas, materi perkuliahan, dan artikel blog di bawah ini.
          </p>
        </div>
        <button type="button" className="btn btn-danger-soft align-self-start align-self-md-end" onClick={handleLogout}>
          Keluar
        </button>
      </header>

      {/* Navigasi Tab */}
      <Reveal className="panel p-2 mb-4">
        <div className="d-flex flex-wrap gap-2">
          <button
            type="button"
            className={`btn btn-quiet flex-grow-1 ${activeTab === 'tugas' ? 'is-on' : ''}`}
            onClick={() => setActiveTab('tugas')}
          >
            Form &amp; Kelola Tugas ({assignments.length})
          </button>
          <button
            type="button"
            className={`btn btn-quiet flex-grow-1 ${activeTab === 'materi' ? 'is-on' : ''}`}
            onClick={() => setActiveTab('materi')}
          >
            Form &amp; Kelola Materi ({materials.length})
          </button>
          <button
            type="button"
            className={`btn btn-quiet flex-grow-1 ${activeTab === 'blog' ? 'is-on' : ''}`}
            onClick={() => setActiveTab('blog')}
          >
            Form &amp; Kelola Blog ({blogs.length})
          </button>
          <button
            type="button"
            className={`btn btn-quiet flex-grow-1 ${activeTab === 'logs' ? 'is-on' : ''}`}
            onClick={() => setActiveTab('logs')}
          >
            Riwayat Log ({deletionLogs.length})
          </button>
        </div>
      </Reveal>

      {/* ================= TAB 1: FORM & KELOLA TUGAS ================= */}
      {activeTab === 'tugas' && (
        <div className="space-y-4">
          <Reveal className="panel p-4 p-md-5 mb-5">
            <span className="eyebrow">{taskEditId ? 'Edit Tugas' : 'Form Pengumpulan Tugas'}</span>
            <h2 className="h3 mb-4">{taskEditId ? 'Perbarui Data Tugas' : 'Unggah Tugas Baru'}</h2>

            <form onSubmit={handleTaskSubmit}>
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label">Judul Tugas</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contoh: Analisis Kebutuhan Sistem Rumah Sakit"
                    required
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Nama Mahasiswa / Kelompok</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contoh: Kelompok 3 (Ahmad & Budi)"
                    required
                    value={taskStudent}
                    onChange={(e) => setTaskStudent(e.target.value)}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Mata Kuliah</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Pilih atau ketik mata kuliah..."
                    list="task-courses-list"
                    required
                    value={taskCourse}
                    onChange={(e) => setTaskCourse(e.target.value)}
                  />
                  <datalist id="task-courses-list">
                    {COMMON_COURSES.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Dosen Pengampu</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contoh: Dian Ade Kurnia, M.Kom"
                    required
                    value={taskLecturer}
                    onChange={(e) => setTaskLecturer(e.target.value)}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Program Studi (Prodi)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contoh: S1 Teknik Informatika"
                    required
                    value={taskProdi}
                    onChange={(e) => setTaskProdi(e.target.value)}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Universitas</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contoh: Universitas Muhammadiyah Cirebon"
                    required
                    value={taskUniversity}
                    onChange={(e) => setTaskUniversity(e.target.value)}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Deskripsi / Catatan Singkat Tugas</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Jelaskan ringkasan materi atau tujuan tugas ini..."
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                  ></textarea>
                </div>

                <div className="col-md-4">
                  <label className="form-label">Jenis / Format File</label>
                  <select
                    className="form-select"
                    value={taskType}
                    onChange={(e) => setTaskType(e.target.value)}
                  >
                    <option value="pdf">PDF Document</option>
                    <option value="ppt">PowerPoint (PPT / PPTX)</option>
                    <option value="excel">Excel Spreadsheet (XLSX)</option>
                    <option value="image">Gambar Desain / Diagram</option>
                    <option value="youtube">Video YouTube</option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label d-flex justify-content-between align-items-center">
                    <span>Cover Tugas (Otomatis / Kustom)</span>
                    {taskCoverPreview && (
                      <span className="badge bg-success" style={{ fontSize: '0.65rem' }}>
                        Cover Siap
                      </span>
                    )}
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setTaskCoverFile(file);
                        setTaskCoverPreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                  {taskCoverPreview ? (
                    <div className="mt-2 p-2 rounded bg-light border d-flex align-items-center gap-2">
                      <img
                        src={taskCoverPreview}
                        alt="Cover Tugas"
                        style={{
                          width: '64px',
                          height: '46px',
                          objectFit: 'cover',
                          borderRadius: '4px',
                          border: '1.5px solid var(--navy)',
                        }}
                      />
                      <span className="small text-muted" style={{ fontSize: '0.74rem' }}>
                        Visual cover otomatis dari hal. 1 PDF atau berkas gambar.
                      </span>
                    </div>
                  ) : (
                    <span className="small text-muted mt-1 d-block" style={{ fontSize: '0.74rem' }}>
                      Pilih berkas PDF di sebelah kanan, cover otomatis diambil dari halaman 1.
                    </span>
                  )}
                </div>

                <div className="col-md-4">
                  {taskType === 'youtube' ? (
                    <div>
                      <label className="form-label">Tautan Video YouTube</label>
                      <input
                        type="url"
                        className="form-control"
                        placeholder="https://www.youtube.com/watch?v=..."
                        required={!taskEditId}
                        value={taskYoutube}
                        onChange={(e) => setTaskYoutube(e.target.value)}
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="form-label">
                        Pilih Berkas Tugas{' '}
                        {taskType === 'ppt'
                          ? '(PowerPoint PPT / PPTX)'
                          : taskType === 'excel'
                          ? '(Excel XLSX)'
                          : taskType === 'image'
                          ? '(Gambar / Diagram)'
                          : '(PDF)'}
                      </label>
                      <input
                        type="file"
                        className="form-control"
                        required={!taskEditId}
                        accept={
                          taskType === 'ppt'
                            ? '.ppt,.pptx'
                            : taskType === 'excel'
                            ? '.xls,.xlsx'
                            : taskType === 'image'
                            ? 'image/*'
                            : '.pdf,application/pdf'
                        }
                        onChange={(e) => handleTaskFileChange(e.target.files[0])}
                      />
                      {taskType === 'ppt' && (
                        <div className="small text-muted mt-1" style={{ fontSize: '0.75rem' }}>
                          Slide PPT/PPTX akan disematkan menggunakan penampil interaktif Microsoft Office &amp; Google Presentation.
                        </div>
                      )}
                      {extractingPdfText && (
                        <div className="small text-navy fw-semibold mt-1">
                          Sedang mengekstrak seluruh teks berkas PDF secara otomatis...
                        </div>
                      )}
                      {!extractingPdfText && taskDocFile && (taskType === 'pdf' || taskDocFile.name.toLowerCase().endsWith('.pdf')) && (
                        <div className="small text-success mt-1 d-flex justify-content-between align-items-center">
                          <span>Berkas PDF siap. Teks telah otomatis diekstrak ke formulir di atas.</span>
                          <button
                            type="button"
                            className="btn btn-quiet btn-sm py-0 px-2"
                            style={{ fontSize: '0.72rem' }}
                            onClick={handleExtractTaskPdfText}
                            title="Ekstrak ulang jika diperlukan"
                          >
                            Ekstrak Ulang
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="col-12 d-flex flex-wrap gap-2 mt-4">
                  <button type="submit" className="btn btn-ember" disabled={loading}>
                    {loading ? 'Menyimpan...' : taskEditId ? 'Simpan Perubahan' : 'Kumpulkan Tugas'}
                  </button>
                  {taskEditId && (
                    <button type="button" className="btn btn-mist" onClick={resetTaskForm}>
                      Batal Edit
                    </button>
                  )}
                </div>
              </div>
            </form>
          </Reveal>

          {/* Daftar Kelola Tugas */}
          <Reveal className="panel p-4 p-md-5">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
              <div>
                <span className="eyebrow">Daftar Arsip</span>
                <h3 className="h4 mb-0">Kelola Tugas Mahasiswa</h3>
              </div>
              <span className="numeral">{String(assignments.length).padStart(2, '0')}</span>
            </div>

            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Judul &amp; Mahasiswa</th>
                    <th>Format</th>
                    <th>Memorial Home</th>
                    <th className="text-end">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((task) => {
                    const parsedTask = parseItemMetadata(task.description);
                    return (
                      <tr key={task.id}>
                        <td>
                          <div className="fw-semibold text-navy" style={{ lineHeight: 1.4, wordBreak: 'break-word' }}>
                            {task.title}
                          </div>
                          <div className="small text-muted mt-1" style={{ lineHeight: 1.35 }}>
                            {task.student_name}
                          </div>
                          <div className="small text-secondary mt-1" style={{ lineHeight: 1.35 }}>
                            {parsedTask.course} &bull; {parsedTask.lecturer}
                          </div>
                        </td>
                        <td>
                          <span className="tag">{task.file_type}</span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className={`btn btn-quiet ${task.is_featured ? 'is-on' : ''}`}
                            onClick={() => toggleTaskFeatured(task)}
                          >
                            {task.is_featured ? 'Ditampilkan di Home' : 'Sembunyikan'}
                          </button>
                        </td>
                        <td className="text-end">
                          <div className="d-inline-flex gap-2">
                            <button
                              type="button"
                              className="btn btn-sm btn-quiet"
                              onClick={() => setActivePreview({ item: task, itemType: 'Tugas' })}
                            >
                              Pratinjau
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-mist"
                              onClick={() => startEditTask(task)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-danger-soft"
                              onClick={() => deleteTask(task)}
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {assignments.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center py-4 text-muted">
                        Belum ada data tugas terkumpul.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      )}

      {/* ================= TAB 2: FORM & KELOLA MATERI ================= */}
      {activeTab === 'materi' && (
        <div className="space-y-4">
          <Reveal className="panel p-4 p-md-5 mb-5">
            <span className="eyebrow">{matEditId ? 'Edit Materi' : 'Form Upload Materi'}</span>
            <h2 className="h3 mb-4">{matEditId ? 'Perbarui Materi Pertemuan' : 'Tambah Materi Perkuliahan'}</h2>

            <form onSubmit={handleMaterialSubmit}>
              <div className="row g-4">
                <div className="col-md-3">
                  <label className="form-label">Pertemuan Ke-</label>
                  <input
                    type="number"
                    min="1"
                    max="32"
                    className="form-control"
                    required
                    value={matMeeting}
                    onChange={(e) => setMatMeeting(e.target.value)}
                  />
                </div>

                <div className="col-md-5">
                  <label className="form-label">Judul Materi</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contoh: Pemodelan Berorientasi Objek dengan UML"
                    required
                    value={matTitle}
                    onChange={(e) => setMatTitle(e.target.value)}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Tipe Berkas Materi</label>
                  <select
                    className="form-select"
                    value={matType}
                    onChange={(e) => setMatType(e.target.value)}
                  >
                    <option value="pdf">PDF Dokumen</option>
                    <option value="ppt">PowerPoint (PPT / PPTX)</option>
                    <option value="excel">Excel (XLSX)</option>
                    <option value="youtube">Video Pembelajaran YouTube</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Mata Kuliah</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Pilih atau ketik mata kuliah..."
                    list="mat-courses-list"
                    required
                    value={matCourse}
                    onChange={(e) => setMatCourse(e.target.value)}
                  />
                  <datalist id="mat-courses-list">
                    {COMMON_COURSES.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Dosen Pengampu</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contoh: Dian Ade Kurnia, M.Kom"
                    required
                    value={matLecturer}
                    onChange={(e) => setMatLecturer(e.target.value)}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Program Studi (Prodi)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contoh: S1 Teknik Informatika"
                    required
                    value={matProdi}
                    onChange={(e) => setMatProdi(e.target.value)}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Universitas</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contoh: Universitas Muhammadiyah Cirebon"
                    required
                    value={matUniversity}
                    onChange={(e) => setMatUniversity(e.target.value)}
                  />
                </div>

                <div className="col-12">
                  <div className="row g-3 align-items-center">
                    <div className="col-md-6">
                      <label className="form-label d-flex justify-content-between align-items-center">
                        <span>Cover Materi (Otomatis dari Halaman 1 PDF)</span>
                        {matCoverPreview && (
                          <span className="badge bg-success" style={{ fontSize: '0.65rem' }}>
                            Cover Halaman 1 Siap
                          </span>
                        )}
                      </label>
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setMatCoverFile(file);
                            setMatCoverPreview(URL.createObjectURL(file));
                          }
                        }}
                      />
                      <span className="small text-muted mt-1 d-block" style={{ fontSize: '0.74rem' }}>
                        Saat mengunggah berkas PDF di bawah, sistem otomatis mengekstrak halaman 1 sebagai cover visual materi. Anda juga dapat memilih gambar kustom di sini.
                      </span>
                    </div>

                    <div className="col-md-6">
                      {matCoverPreview ? (
                        <div className="p-2 rounded bg-light border d-flex align-items-center gap-3">
                          <img
                            src={matCoverPreview}
                            alt="Cover Materi"
                            style={{
                              width: '85px',
                              height: '60px',
                              objectFit: 'cover',
                              borderRadius: '4px',
                              border: '1.5px solid var(--navy)',
                            }}
                          />
                          <div>
                            <div className="small fw-bold text-navy">Pratinjau Cover Materi Siap</div>
                            <div className="small text-muted" style={{ fontSize: '0.75rem' }}>
                              Cover visual ini otomatis tampil pada kartu materi di beranda dan katalog.
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded bg-light border text-muted small text-center" style={{ fontSize: '0.78rem' }}>
                          Belum ada cover. Cover visual akan otomatis dibuat dari halaman pertama berkas PDF materi.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-12">
                  <label className="form-label">
                    Isi Teks Modul Pembelajaran (Bacaan Ala Dicoding / Ringkasan Materi)
                  </label>
                  <textarea
                    className="form-control"
                    rows="6"
                    placeholder="Tuliskan pokok bahasan, penjelasan konsep, dan catatan penting per paragraf. Teks ini akan langsung ditampilkan sebagai modul pembelajaran yang nyaman dibaca di HP & laptop..."
                    value={matDesc}
                    onChange={(e) => setMatDesc(e.target.value)}
                  ></textarea>
                  <span className="small text-muted mt-1 d-block">
                    Format paragraf bertingkat akan otomatis disusun rapi dengan poin penting dan kotak catatan di halaman materi.
                  </span>
                </div>

                <div className="col-12">
                  {matType === 'youtube' ? (
                    <div>
                      <label className="form-label">Link YouTube Materi</label>
                      <input
                        type="url"
                        className="form-control"
                        placeholder="https://www.youtube.com/watch?v=..."
                        required={!matEditId}
                        value={matYoutube}
                        onChange={(e) => setMatYoutube(e.target.value)}
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="form-label">
                        Pilih Berkas Dokumen Materi{' '}
                        {matType === 'ppt'
                          ? '(PowerPoint PPT / PPTX)'
                          : matType === 'excel'
                          ? '(Excel XLSX)'
                          : '(PDF)'}
                      </label>
                      <input
                        type="file"
                        className="form-control"
                        required={!matEditId}
                        accept={
                          matType === 'ppt'
                            ? '.ppt,.pptx'
                            : matType === 'excel'
                            ? '.xls,.xlsx'
                            : '.pdf,application/pdf'
                        }
                        onChange={(e) => handleMatFileChange(e.target.files[0])}
                      />
                      {matType === 'ppt' && (
                        <div className="small text-muted mt-1" style={{ fontSize: '0.75rem' }}>
                          Slide PPT/PPTX akan disematkan menggunakan penampil interaktif Microsoft Office &amp; Google Presentation.
                        </div>
                      )}
                      {extractingPdfText && (
                        <div className="small text-navy fw-semibold mt-1">
                          Sedang mengekstrak seluruh teks berkas PDF materi secara otomatis...
                        </div>
                      )}
                      {!extractingPdfText && matDocFile && (matType === 'pdf' || matDocFile.name.toLowerCase().endsWith('.pdf')) && (
                        <div className="small text-success mt-1 d-flex justify-content-between align-items-center">
                          <span>Berkas PDF materi siap. Teks telah otomatis diekstrak ke kolom bacaan.</span>
                          <button
                            type="button"
                            className="btn btn-quiet btn-sm py-0 px-2"
                            style={{ fontSize: '0.72rem' }}
                            onClick={handleExtractMatPdfText}
                            title="Ekstrak ulang jika diperlukan"
                          >
                            Ekstrak Ulang
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="col-12 d-flex flex-wrap gap-2 mt-4">
                  <button type="submit" className="btn btn-ember" disabled={loading}>
                    {loading ? 'Menyimpan...' : matEditId ? 'Simpan Perubahan' : 'Tambahkan Materi'}
                  </button>
                  {matEditId && (
                    <button type="button" className="btn btn-mist" onClick={resetMaterialForm}>
                      Batal
                    </button>
                  )}
                </div>
              </div>
            </form>
          </Reveal>

          {/* Daftar Kelola Materi */}
          <Reveal className="panel p-4 p-md-5">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
              <div>
                <span className="eyebrow">Daftar Pertemuan</span>
                <h3 className="h4 mb-0">Kelola Materi Perkuliahan</h3>
              </div>
              <span className="numeral">{String(materials.length).padStart(2, '0')}</span>
            </div>

            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Pertemuan &amp; Judul</th>
                    <th>Format</th>
                    <th>Memorial Home</th>
                    <th className="text-end">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map((mat) => {
                    const parsedMat = parseItemMetadata(mat.description);
                    return (
                      <tr key={mat.id}>
                        <td>
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <span className="tag">P-{mat.meeting_number}</span>
                            <span className="badge bg-secondary" style={{ fontSize: '0.68rem' }}>{parsedMat.prodi}</span>
                          </div>
                          <div className="fw-semibold text-navy" style={{ lineHeight: 1.4, wordBreak: 'break-word' }}>
                            {mat.title}
                          </div>
                          <div className="small text-secondary mt-1" style={{ lineHeight: 1.35 }}>
                            {parsedMat.course} &bull; {parsedMat.lecturer}
                          </div>
                          <div className="small text-muted text-truncate" style={{ maxWidth: '340px', lineHeight: 1.35 }}>
                            {parsedMat.cleanDescription}
                          </div>
                        </td>
                        <td>
                          <span className="tag">{mat.file_type}</span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className={`btn btn-quiet ${mat.is_featured ? 'is-on' : ''}`}
                            onClick={() => toggleMaterialFeatured(mat)}
                          >
                            {mat.is_featured ? 'Ditampilkan di Home' : 'Sembunyikan'}
                          </button>
                        </td>
                        <td className="text-end">
                          <div className="d-inline-flex gap-2">
                            <button
                              type="button"
                              className="btn btn-sm btn-quiet"
                              onClick={() => setActivePreview({ item: mat, itemType: 'Materi' })}
                            >
                              Pratinjau
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-mist"
                              onClick={() => startEditMaterial(mat)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-danger-soft"
                              onClick={() => deleteMaterial(mat)}
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {materials.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center py-4 text-muted">
                        Belum ada materi pertemuan tersimpan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      )}

      {/* ================= TAB 3: FORM & KELOLA BLOG ================= */}
      {activeTab === 'blog' && (
        <div className="space-y-4">
          <Reveal className="panel p-4 p-md-5 mb-5">
            <span className="eyebrow">{blogEditId ? 'Edit Artikel' : 'Form Buat Blog'}</span>
            <h2 className="h3 mb-4">{blogEditId ? 'Perbarui Artikel Blog' : 'Tulis Artikel Blog Baru'}</h2>

            <form onSubmit={handleBlogSubmit}>
              <div className="row g-4">
                <div className="col-md-8">
                  <label className="form-label">Judul Artikel Blog</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contoh: Memahami Hubungan Antara Analisis Sistem dan Efisiensi Bisnis"
                    required
                    value={blogTitle}
                    onChange={(e) => setBlogTitle(e.target.value)}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Kategori / Topik</label>
                  <select
                    className="form-select"
                    value={blogCategory}
                    onChange={(e) => setBlogCategory(e.target.value)}
                  >
                    <option value="Analisis Sistem">Analisis Sistem</option>
                    <option value="Metodologi">Metodologi SDLC &amp; Agile</option>
                    <option value="Tips Kuliah">Tips Kuliah &amp; Tugas</option>
                    <option value="Berita Kampus">Wawasan &amp; Kampus</option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label">Nama Penulis Blog</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contoh: Mohamad Farael Maulana"
                    required
                    value={blogAuthor}
                    onChange={(e) => setBlogAuthor(e.target.value)}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Estimasi Waktu Baca</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contoh: 4 menit baca"
                    value={blogReadTime}
                    onChange={(e) => setBlogReadTime(e.target.value)}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">URL Gambar Sampul (Cover)</label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://images.unsplash.com/..."
                    value={blogCoverUrl}
                    onChange={(e) => setBlogCoverUrl(e.target.value)}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Ringkasan Singkat (Muncul di Kartu)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Tuliskan 1-2 kalimat ringkasan artikel..."
                    required
                    value={blogSummary}
                    onChange={(e) => setBlogSummary(e.target.value)}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Konten Lengkap Artikel (Gunakan paragraf berjarak)</label>
                  <textarea
                    className="form-control"
                    rows="8"
                    placeholder="Tuliskan isi artikel blog Anda secara mendalam..."
                    required
                    value={blogContent}
                    onChange={(e) => setBlogContent(e.target.value)}
                  ></textarea>
                </div>

                <div className="col-12">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="checkFeatured"
                      checked={blogFeatured}
                      onChange={(e) => setBlogFeatured(e.target.checked)}
                    />
                    <label className="form-check-label fw-bold text-navy" htmlFor="checkFeatured">
                      Tampilkan artikel ini di Beranda (Section Blog Home)
                    </label>
                  </div>
                </div>

                <div className="col-12 d-flex flex-wrap gap-2 mt-4">
                  <button type="submit" className="btn btn-ember" disabled={loading}>
                    {loading ? 'Menerbitkan...' : blogEditId ? 'Simpan Perubahan' : 'Terbitkan Artikel Blog'}
                  </button>
                  {blogEditId && (
                    <button type="button" className="btn btn-mist" onClick={resetBlogForm}>
                      Batal
                    </button>
                  )}
                </div>
              </div>
            </form>
          </Reveal>

          {/* Daftar Kelola Blog */}
          <Reveal className="panel p-4 p-md-5">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
              <div>
                <span className="eyebrow">Daftar Publikasi</span>
                <h3 className="h4 mb-0">Kelola Artikel Blog</h3>
              </div>
              <span className="numeral">{String(blogs.length).padStart(2, '0')}</span>
            </div>

            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Judul &amp; Penulis</th>
                    <th>Kategori</th>
                    <th>Ditampilkan di Home</th>
                    <th className="text-end">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {blogs.map((b) => (
                    <tr key={b.id}>
                      <td>
                        <div className="fw-semibold text-navy" style={{ lineHeight: 1.4, wordBreak: 'break-word' }}>
                          {b.title}
                        </div>
                        <span className="small text-muted mt-1 d-block" style={{ lineHeight: 1.35 }}>
                          Oleh {b.author} • {b.date || 'Terbaru'}
                        </span>
                      </td>
                      <td>
                        <span className="tag tag-ember">{b.category}</span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={`btn btn-quiet ${b.is_featured ? 'is-on' : ''}`}
                          onClick={() => toggleBlogFeatured(b)}
                        >
                          {b.is_featured ? 'Ditampilkan di Home' : 'Sembunyikan'}
                        </button>
                      </td>
                      <td className="text-end">
                        <div className="d-inline-flex gap-2">
                          <a
                            href={`/blog/${b.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-sm btn-quiet"
                            title="Buka halaman lengkap artikel ini"
                          >
                            Lihat
                          </a>
                          <button
                            type="button"
                            className="btn btn-sm btn-mist"
                            onClick={() => startEditBlog(b)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-danger-soft"
                            onClick={() => deleteBlog(b)}
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {blogs.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center py-4 text-muted">
                        Belum ada artikel blog tersimpan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      )}

      {/* ================= TAB 4: LOG PENGHAPUSAN ================= */}
      {activeTab === 'logs' && (
        <Reveal className="panel p-4 p-md-5">
          <div className="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-4">
            <div>
              <span className="eyebrow">Catatan Log</span>
              <h3 className="h4 mb-0">Riwayat Berkas yang Pernah Dihapus</h3>
            </div>
            <span className="numeral">{String(deletionLogs.length).padStart(2, '0')}</span>
          </div>

          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th>Waktu</th>
                  <th>Kategori</th>
                  <th>Judul Berkas</th>
                  <th>Pelapor</th>
                  <th>Alasan</th>
                </tr>
              </thead>
              <tbody>
                {deletionLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="small text-muted">
                      {new Date(log.deleted_at).toLocaleString('id-ID')}
                    </td>
                    <td>
                      <span className="tag">{log.item_type}</span>
                    </td>
                    <td className="fw-semibold text-navy">{log.item_title}</td>
                    <td>{log.deleted_by}</td>
                    <td style={{ color: 'var(--ember-soft)' }}>{log.reason}</td>
                  </tr>
                ))}
                {deletionLogs.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-4">
                      Belum ada aktivitas penghapusan berkas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Reveal>
      )}

      {/* Pop-up Notifikasi Berhasil Simpan */}
      <SuccessModal
        isOpen={successModalData.isOpen}
        title={successModalData.title}
        subtitle={successModalData.subtitle}
        itemType={successModalData.itemType}
        item={successModalData.item}
        targetUrl={successModalData.targetUrl}
        onClose={() => setSuccessModalData((prev) => ({ ...prev, isOpen: false }))}
        onViewPreview={(item, type) => {
          setActivePreview({ item, itemType: type });
        }}
      />

      {/* Pratinjau Dokumen Nyaman */}
      {activePreview && (
        <PreviewModal
          item={activePreview.item}
          itemType={activePreview.itemType}
          onClose={() => setActivePreview(null)}
          onRequestEdit={(item) => {
            setActivePreview(null);
            if (activePreview.itemType === 'Tugas') startEditTask(item);
            else if (activePreview.itemType === 'Materi') startEditMaterial(item);
          }}
          onRequestDelete={(item) => {
            setActivePreview(null);
            if (activePreview.itemType === 'Tugas') deleteTask(item);
            else if (activePreview.itemType === 'Materi') deleteMaterial(item);
          }}
        />
      )}
    </div>
  );
}

import * as pdfjsLib from 'pdfjs-dist';

// Konfigurasi Worker dan Font Data agar decoding PDF 100% lengkap
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

/**
 * Mengonversi objek gambar internal PDF.js (ImageBitmap, RGBA, RGB, atau Grayscale)
 * menjadi Base64 PNG Data URL yang dapat langsung ditampilkan di tag <img>.
 */
function convertPdfImageToDataUrl(img) {
  if (!img) return null;
  const width = img.width;
  const height = img.height;
  if (!width || !height || width <= 0 || height <= 0) return null;

  try {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // 1. Jika browser mendukung ImageBitmap
    if (img.bitmap && typeof ctx.drawImage === 'function') {
      ctx.drawImage(img.bitmap, 0, 0);
      return canvas.toDataURL('image/png');
    }

    // 2. Jika tersedia buffer data piksel (Uint8Array / Uint8ClampedArray)
    if (img.data) {
      const imgData = ctx.createImageData(width, height);
      const dst = imgData.data;
      const src = img.data;

      // Format 1: Grayscale (1 byte per piksel)
      if (img.kind === 1 || src.length === width * height) {
        for (let i = 0, j = 0; i < src.length; i++, j += 4) {
          const v = src[i];
          dst[j] = v;
          dst[j + 1] = v;
          dst[j + 2] = v;
          dst[j + 3] = 255;
        }
      }
      // Format 2: RGB 24-bit (3 bytes per piksel)
      else if (img.kind === 2 || src.length === width * height * 3) {
        for (let i = 0, j = 0; i < src.length; i += 3, j += 4) {
          dst[j] = src[i];
          dst[j + 1] = src[i + 1];
          dst[j + 2] = src[i + 2];
          dst[j + 3] = 255;
        }
      }
      // Format 3: RGBA 32-bit (4 bytes per piksel)
      else {
        const copyLen = Math.min(src.length, dst.length);
        for (let i = 0; i < copyLen; i++) {
          dst[i] = src[i];
        }
      }

      ctx.putImageData(imgData, 0, 0);
      return canvas.toDataURL('image/png');
    }
  } catch (err) {
    console.warn('Gagal mengonversi gambar PDF ke dataUrl:', err);
  }

  return null;
}

export const pdfExtractorService = {
  /**
   * Mengekstrak seluruh halaman dari URL berkas PDF atau objek File (Blob).
   * Mengekstrak teks, visual lembaran halaman, serta SEMUA gambar/diagram di setiap halaman!
   *
   * @param {string|Blob|File} source - URL atau objek berkas PDF
   * @param {Function} onProgress - Callback progres ({ current, total, percent })
   * @param {Function} onPageLoaded - Callback setiap kali 1 halaman berhasil diekstrak
   * @returns {Promise<Array>} Seluruh halaman yang diekstrak [{ pageNumber, text, imageUrl, extractedImages: [...] }]
   */
  async extractPdfPages(source, onProgress = null, onPageLoaded = null) {
    let loadingTask;

    try {
      if (source instanceof Blob || source instanceof File) {
        const arrayBuffer = await source.arrayBuffer();
        loadingTask = pdfjsLib.getDocument({
          data: arrayBuffer,
          cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
          cMapPacked: true,
          standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/standard_fonts/`,
        });
      } else if (typeof source === 'string') {
        let arrayBuffer;
        try {
          const resp = await fetch(source);
          if (!resp.ok) throw new Error(`HTTP Error: ${resp.status}`);
          arrayBuffer = await resp.arrayBuffer();
        } catch {
          arrayBuffer = null;
        }

        if (arrayBuffer) {
          loadingTask = pdfjsLib.getDocument({
            data: arrayBuffer,
            cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
            cMapPacked: true,
            standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/standard_fonts/`,
          });
        } else {
          loadingTask = pdfjsLib.getDocument({
            url: source,
            cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
            cMapPacked: true,
            standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/standard_fonts/`,
          });
        }
      } else {
        throw new Error('Format sumber PDF tidak valid.');
      }
    } catch (initErr) {
      console.error('Gagal memuat dokumen PDF:', initErr);
      throw new Error(`Gagal membuka dokumen PDF: ${initErr.message}`);
    }

    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;
    const extractedPages = [];

    // Loop mengekstrak seluruh halaman dari 1 sampai numPages tanpa terkecuali
    for (let pageNum = 1; pageNum <= numPages; pageNum += 1) {
      if (onProgress) {
        onProgress({
          current: pageNum,
          total: numPages,
          percent: Math.round(((pageNum - 1) / numPages) * 100),
        });
      }

      try {
        const page = await pdfDoc.getPage(pageNum);

        // 1. Ekstraksi teks lengkap dengan mempertahankan baris dan paragraf
        let pageText = '';
        try {
          const textContent = await page.getTextContent({
            normalizeWhitespace: true,
            disableCombineTextItems: false,
          });

          let lastY = undefined;
          for (const item of textContent.items) {
            if (!item.str && !item.hasEOL) continue;

            if (lastY !== undefined && Math.abs(item.transform[5] - lastY) > 5) {
              pageText += '\n';
            } else if (pageText.length > 0 && !pageText.endsWith('\n') && !pageText.endsWith(' ')) {
              pageText += ' ';
            }

            pageText += item.str || '';

            if (item.hasEOL) {
              pageText += '\n';
            }
            lastY = item.transform[5];
          }
        } catch (textErr) {
          console.warn(`Gagal mengekstrak teks halaman ${pageNum}:`, textErr);
        }

        // 2. Render visual lembaran halaman ke canvas (skala 1.25 seimbang untuk kejelasan & hemat RAM)
        let imageUrl = '';
        try {
          const viewport = page.getViewport({ scale: 1.25 });
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({
            canvasContext: ctx,
            viewport,
          }).promise;

          imageUrl = canvas.toDataURL('image/jpeg', 0.82);
        } catch (renderErr) {
          console.warn(`Gagal me-render gambar lembar halaman ${pageNum}:`, renderErr);
        }

        // 3. Ekstraksi gambar individual / diagram yang tertanam di halaman ini
        const extractedImages = [];
        try {
          const ops = await page.getOperatorList();
          const imgNames = [];

          for (let i = 0; i < ops.fnArray.length; i += 1) {
            // pdfjsLib.OPS.paintImageXObject = 85
            if (ops.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
              const name = ops.argsArray[i][0];
              if (name && !imgNames.includes(name)) {
                imgNames.push(name);
              }
            }
          }

          // Ambil setiap objek gambar dari page.objs
          for (let idx = 0; idx < imgNames.length; idx += 1) {
            const name = imgNames[idx];
            try {
              const imgObj = await new Promise((resolve) => {
                let resolved = false;
                const timer = setTimeout(() => {
                  if (!resolved) resolve(null);
                }, 1500);

                page.objs.get(name, (res) => {
                  resolved = true;
                  clearTimeout(timer);
                  resolve(res);
                });
              });

              if (imgObj && imgObj.width >= 32 && imgObj.height >= 32) {
                const dataUrl = convertPdfImageToDataUrl(imgObj);
                if (dataUrl) {
                  extractedImages.push({
                    id: name,
                    name: `Gambar ${idx + 1} (Hal. ${pageNum})`,
                    width: imgObj.width,
                    height: imgObj.height,
                    dataUrl,
                  });
                }
              }
            } catch (imgErr) {
              console.warn(`Gagal mengekstrak objek gambar ${name}:`, imgErr);
            }
          }
        } catch (opsErr) {
          console.warn(`Gagal membaca operator list halaman ${pageNum}:`, opsErr);
        }

        const pageData = {
          pageNumber: pageNum,
          text: pageText.trim() || `[Halaman ${pageNum}: Berisi diagram, gambar atau tabel visual]`,
          imageUrl,
          extractedImages,
        };

        extractedPages.push(pageData);

        // Panggil callback real-time agar halaman langsung tampil di layar
        if (onPageLoaded) {
          onPageLoaded(pageData, pageNum, numPages);
        }

        // Bebaskan memori halaman
        page.cleanup();

        // Beri jeda 10ms ke event loop browser agar UI tetap responsif
        await new Promise((resolve) => setTimeout(resolve, 10));
      } catch (pageLoopErr) {
        console.error(`Gagal memproses halaman ${pageNum}:`, pageLoopErr);
        const fallbackPage = {
          pageNumber: pageNum,
          text: `[Halaman ${pageNum}: Memerlukan waktu pemrosesan lebih lanjut]`,
          imageUrl: '',
          extractedImages: [],
        };
        extractedPages.push(fallbackPage);
        if (onPageLoaded) {
          onPageLoaded(fallbackPage, pageNum, numPages);
        }
      }
    }

    if (onProgress) {
      onProgress({ current: numPages, total: numPages, percent: 100 });
    }

    return extractedPages;
  },

  /**
   * Ekstraksi cepat hanya teks untuk form upload
   */
  async extractAllTextOnly(source) {
    let loadingTask;
    if (source instanceof Blob || source instanceof File) {
      const arrayBuffer = await source.arrayBuffer();
      loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
        cMapPacked: true,
      });
    } else {
      loadingTask = pdfjsLib.getDocument({ url: source });
    }

    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;
    const allPageTexts = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum += 1) {
      try {
        const page = await pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();
        const text = textContent.items.map((i) => i.str).join(' ').trim();
        if (text) {
          allPageTexts.push(`### Halaman ${pageNum}\n${text}`);
        }
        page.cleanup();
      } catch (e) {
        console.warn(`Halaman ${pageNum} skip text:`, e);
      }
    }

    return allPageTexts.join('\n\n');
  },

  /**
   * Menghasilkan cover gambar dari halaman pertama berkas PDF.
   * Mendukung objek File (Blob) maupun URL string.
   * Menghasilkan { dataUrl, blob, file } untuk pratinjau instan dan upload ke Supabase Storage.
   */
  async renderFirstPageAsCover(source, options = {}) {
    const scale = options.scale || 1.25;
    const quality = options.quality || 0.85;

    try {
      let loadingTask;
      if (source instanceof Blob || source instanceof File) {
        const arrayBuffer = await source.arrayBuffer();
        loadingTask = pdfjsLib.getDocument({
          data: arrayBuffer,
          cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
          cMapPacked: true,
          standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/standard_fonts/`,
        });
      } else if (typeof source === 'string') {
        let arrayBuffer;
        try {
          const resp = await fetch(source);
          if (resp.ok) arrayBuffer = await resp.arrayBuffer();
        } catch {
          arrayBuffer = null;
        }

        if (arrayBuffer) {
          loadingTask = pdfjsLib.getDocument({
            data: arrayBuffer,
            cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
            cMapPacked: true,
            standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/standard_fonts/`,
          });
        } else {
          loadingTask = pdfjsLib.getDocument({
            url: source,
            cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
            cMapPacked: true,
            standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/standard_fonts/`,
          });
        }
      } else {
        return null;
      }

      const pdfDoc = await loadingTask.promise;
      if (pdfDoc.numPages < 1) return null;

      const page = await pdfDoc.getPage(1);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: ctx,
        viewport,
      }).promise;

      const dataUrl = canvas.toDataURL('image/jpeg', quality);

      // Konversi canvas ke Blob dan File
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
      const baseName = (source && source.name)
        ? source.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_')
        : `cover-p1-${Date.now()}`;
      const coverFile = new File([blob], `${baseName}-cover.jpg`, { type: 'image/jpeg' });

      page.cleanup();

      return {
        dataUrl,
        blob,
        file: coverFile,
      };
    } catch (err) {
      console.warn('Gagal menghasilkan cover dari halaman 1 PDF:', err);
      return null;
    }
  },
};

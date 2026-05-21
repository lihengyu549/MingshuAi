import html2canvas from 'html2canvas';
import JsPDF from 'jspdf';

/**
 * 导出页面为 PDF 文件（优化版：解决卡顿问题）
 * @param {Object} options
 * @param {string} options.title - 导出文件名，默认"导出报告"
 * @param {string} options.className - 目标容器类名，默认"pdf-cell"
 * @param {number} [options.scale] - 截图清晰度倍率，默认最高2倍（平衡清晰度和性能）
 * @param {number} [options.quality=0.7] - JPEG 图片质量 0~1（0.7肉眼几乎无差异，体积大幅减小）
 * @param {number} [options.dpi=200] - 截图 DPI（屏幕查看足够，打印可改为300）
 * @param {number} [options.margin=20] - PDF 页边距（pt）
 * @param {number} [options.gap=10] - 元素之间间距（pt）
 * @param {boolean} [options.showLoading=true] - 是否显示默认加载提示
 * @returns {Promise<void>}
 */
export async function downloadPDF(options) {
  const {
    title = '导出报告',
    className = 'pdf-cell',
    scale = Math.min(window.devicePixelRatio, 2), // 核心优化1：限制最高2倍缩放
    quality = 1,
    dpi = 500,
    margin = 20,
    gap = 10,
    showLoading = true
  } = options || {};

  const A4_WIDTH = 595.28;
  const A4_HEIGHT = 841.89;
  const USABLE_WIDTH = A4_WIDTH - margin * 2;
  const USABLE_HEIGHT = A4_HEIGHT - margin * 2;

  // 显示加载提示
  let loadingEl = null;
  if (showLoading) {
    loadingEl = document.createElement('div');
    loadingEl.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      z-index: 99999;
    `;
    loadingEl.textContent = '正在生成PDF，请稍候...';
    document.body.appendChild(loadingEl);
  }

  try {
    const container = document.querySelector('.' + className);
    if (!container) {
      throw new Error(`PDF导出：未找到类名为 "${className}" 的容器元素`);
    }

    const children = Array.from(container.children).filter(el => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });

    if (!children.length) {
      throw new Error('PDF导出：容器内没有可见的子元素');
    }

    // 核心优化2：串行截图（避免同时占用全部CPU，主线程不会完全卡死）
    const canvases = [];
    for (const child of children) {
      const canvas = await html2canvas(child, {
        scale,
        dpi,
        background: '#fff',
        useCORS: true,
        allowTaint: true,
        logging: false,
        willReadFrequently: true,
        onclone(doc) {
          // 隐藏导出时不需要的元素
          doc.querySelectorAll('.no-print, [data-no-print]').forEach(el => {
            el.style.display = 'none';
          });
        }
      });
      canvases.push(canvas);

      // 让出主线程10ms，让浏览器有机会响应其他操作
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    // 计算每张图片在PDF中的尺寸
    const images = canvases.map(cvs => {
      const ratio = USABLE_WIDTH / cvs.width;
      return {
        canvas: cvs,
        width: USABLE_WIDTH,
        height: cvs.height * ratio
      };
    });

    // 分页逻辑（保留原有的防截断功能）
    const pages = [];
    let currentPage = [];
    let currentHeight = 0;
    images.forEach(img => {
      const needNewPage = currentPage.length > 0 && currentHeight + img.height > USABLE_HEIGHT;
      if (needNewPage) {
        pages.push(currentPage);
        currentPage = [];
        currentHeight = 0;
      }
      currentPage.push(img);
      currentHeight += img.height + gap;
    });
    if (currentPage.length) {
      pages.push(currentPage);
    }

    // 生成PDF
    const pdf = new JsPDF('p', 'pt', 'a4');
    const objectUrls = []; // 用于存储所有生成的ObjectURL，最后统一释放

    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
      if (pageIndex > 0) {
        pdf.addPage();
      }

      let y = margin;
      const page = pages[pageIndex];

      for (const img of page) {
        // 核心优化3：使用异步toBlob代替同步toDataURL，不阻塞主线程
        const imgData = await new Promise((resolve, reject) => {
          img.canvas.toBlob(blob => {
            if (!blob) {
              reject(new Error('Canvas转Blob失败'));
              return;
            }
            const url = URL.createObjectURL(blob);
            objectUrls.push(url);
            resolve(url);
          }, 'image/jpeg', quality);
        });

        // 超大元素跨页切割（保留原功能）
        if (img.height > USABLE_HEIGHT) {
          let remaining = img.height;
          let srcY = 0;

          while (remaining > 0) {
            const drawHeight = Math.min(remaining, USABLE_HEIGHT - (y - margin));
            const srcHeight = (drawHeight / img.height) * img.canvas.height;

            pdf.addImage(
              imgData,
              'JPEG',
              margin,
              y,
              img.width,
              drawHeight,
              undefined,
              'FAST',
              0,
              srcY / img.canvas.height,
              1,
              srcHeight / img.canvas.height
            );

            remaining -= drawHeight;
            srcY += srcHeight;

            if (remaining > 0) {
              pdf.addPage();
              y = margin;
            }
          }
        } else {
          pdf.addImage(imgData, 'JPEG', margin, y, img.width, img.height);
          y += img.height + gap;
        }
      }
    }

    // 保存PDF
    pdf.save(title + '.pdf');

    // 核心优化4：释放所有ObjectURL，避免内存泄漏
    objectUrls.forEach(url => URL.revokeObjectURL(url));

  } catch (error) {
    console.error('PDF导出失败：', error);
    alert(`PDF导出失败：${error.message}`);
    throw error; // 抛出错误，让调用方可以捕获
  } finally {
    // 隐藏加载提示
    if (loadingEl && document.body.contains(loadingEl)) {
      document.body.removeChild(loadingEl);
    }
  }
}
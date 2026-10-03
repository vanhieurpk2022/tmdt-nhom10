/**
 * layout.js - Tự động nạp Header và Footer dùng chung cho tất cả các trang
 */
(function () {
  // Xác định đường dẫn tương đối tới thư mục component
  const isPagesFolder = window.location.pathname.includes('/pages/');
  const componentBasePath = isPagesFolder ? '../component/' : './component/';

  async function loadComponent(url, placeholderId, selector) {
    try {
      const response = await fetch(url);
      if (!response.ok) return;
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const element = doc.querySelector(selector) || doc.body.firstElementChild;
      const placeholder = document.getElementById(placeholderId);

      if (placeholder && element) {
        placeholder.replaceWith(element);

        // Kích hoạt các script đi kèm trong component
        doc.querySelectorAll('script').forEach(s => {
          if (!s.src && s.textContent) {
            try {
              new Function(s.textContent)();
            } catch (e) {
              console.error('Lỗi chạy script component:', e);
            }
          }
        });

        // Tự động highlight menu tương ứng với trang hiện tại
        if (selector === 'header') {
          const currentPath = window.location.pathname;
          const menuLinks = document.querySelectorAll('header nav ul a');
          menuLinks.forEach(link => {
            const href = link.getAttribute('href') || '';
            const text = link.textContent.trim().toLowerCase();
            if (
              (currentPath.includes('tat-ca') && (text === 'tất cả' || href.includes('tat-ca'))) ||
              (currentPath.endsWith('/') && text === 'trang chủ')
            ) {
              link.classList.add('fw-semibold', 'text-danger');
              link.classList.remove('text-dark');
            }
          });
        }
      }
    } catch (err) {
      console.error(`Không thể nạp component từ ${url}:`, err);
    }
  }

  // Tải Header & Footer khi DOM sẵn sàng
  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('header-placeholder')) {
      loadComponent(`${componentBasePath}header.html`, 'header-placeholder', 'header');
    }
    if (document.getElementById('footer-placeholder')) {
      loadComponent(`${componentBasePath}footer.html`, 'footer-placeholder', 'footer');
    }
  });
})();

# tmdt-nhom10

## Hướng dẫn Cài đặt

### Tải về dự án

Clone repository về máy:

```bash
git clone https://github.com/<tên-tổ-chức-hoặc-user>/tmdt-nhom10.git
cd tmdt-nhom10
```

> Thay `<tên-tổ-chức-hoặc-user>` bằng đường dẫn thực tế của repo.

### Frontend

Để chạy được React + TypeScript, mở cmd tại thư mục `frontend`:

```bash
npm run dev
```

> **Nếu không chạy được `npm run dev`:**
> Mở PowerShell và chạy:
> ```powershell
> Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```

### Backend

Để chạy được backend, cần chạy Docker để tiến hành cài đặt MySQL:

```bash
# Khởi động
docker compose up -d

# Dừng
docker compose stop
```

Sau khi chạy xong docker, có thể tiến hành bật backend từ idle.

## Kết nối hệ quản trị với cơ sở dữ liệu

<img width="690" height="556" alt="image" src="https://github.com/user-attachments/assets/7e1c0fec-0612-45fa-a74a-16edabc6733c" />

Qua tab **Driver properties**:

<img width="697" height="560" alt="image" src="https://github.com/user-attachments/assets/6a1175d1-b8d1-4a24-895c-eac54f1cd9a7" />

Điều chỉnh: `allowPublicKeyRetrieval` → `True`

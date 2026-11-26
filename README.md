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
npm.cmd run dev
```

Trong PowerShell, gọi `npm.cmd` để chạy trực tiếp, không cần đổi Execution Policy của máy.

### Backend

Để chạy được backend, cần chạy Docker để tiến hành cài đặt MySQL:

```bash
# Khởi động
docker compose up -d

# Dừng
docker compose stop
```

Sau khi MySQL đã chạy, bật backend từ IDE hoặc dùng Maven đã cài: `mvn.cmd -o spring-boot:run` tại thư mục `backend`.

### Chatbot

Chatbot đọc `/products/chatbot-catalog` từ BE cho mỗi câu hỏi. Giá, dung tích, tồn kho và link luôn lấy từ catalog hiện tại. Không cần chạy `build_index.py` hay dựng lại FAISS từ SQL mẫu.

- FE gọi qua `/chatbot` (Vite proxy sang cổng 8000).
- Chạy cục bộ bằng `chatbot/run.bat`, hoặc khởi động container đã có: `docker compose -f docker-compose.chatbot.yml up -d ollama chatbot`.
- Dùng BGE đã có để xếp hạng theo ngữ nghĩa. Nếu đã cài model chat phù hợp, có thể chọn qua `LLM_MODEL`; khi model không sẵn sàng vẫn tìm được sản phẩm bằng catalog.
- Không tự tải model. Dịch vụ tải model thuộc profile `models`, chỉ chạy khi chủ động chọn profile đó.
- Câu hỏi đã rõ mùi, giá, dung tích hoặc xưởng trả trực tiếp từ catalog. Câu cần xếp hạng AI chỉ chờ tối đa `RERANK_WAIT_SECONDS` (mặc định 0,6 giây); một tác vụ AI tính tiếp trong nền và lưu thứ tự ID trong RAM. Giá và tồn kho vẫn đọc lại từ BE mỗi câu hỏi.
- `GET http://localhost:8000/health` kiểm tra cả kết nối catalog và model, không chỉ kiểm tra thư mục chỉ mục.
- Khi chạy Python ngoài Docker, có thể đặt `CATALOG_URL=http://localhost:8080/products/chatbot-catalog`. Trong Docker, mặc định dùng `host.docker.internal`.

### Kiểm tra

- BE: `mvn.cmd -o test` tại `backend`.
- FE: `npm.cmd run lint` và `node_modules\\.bin\\tsc.cmd --project tsconfig.app.json --noEmit --incremental false` tại `frontend`.
- Chatbot: `python -B -m unittest -v test_chatbot` tại `chatbot`; không tải model hoặc tạo chỉ mục để chạy các kiểm thử này.

Mỗi đơn thanh toán chứa sản phẩm của một xưởng. Giá phối hương gồm nguyên liệu xuất kho theo chai, phí chai đựng và phí phối của xưởng (hoặc phí mặc định cấu hình ở BE). Trang đối soát ghi nhận biên nhận chuyển tiền đã thực hiện, không tự chuyển tiền qua ngân hàng.

Công thức phối hương cũ chưa lưu dung tích nguyên liệu xuất kho cần được mở phối lại để nhận báo giá mới trước khi đặt hàng.

## Kết nối hệ quản trị với cơ sở dữ liệu

<img width="690" height="556" alt="image" src="https://github.com/user-attachments/assets/7e1c0fec-0612-45fa-a74a-16edabc6733c" />

Qua tab **Driver properties**:

<img width="697" height="560" alt="image" src="https://github.com/user-attachments/assets/6a1175d1-b8d1-4a24-895c-eac54f1cd9a7" />

Điều chỉnh: `allowPublicKeyRetrieval` → `True`

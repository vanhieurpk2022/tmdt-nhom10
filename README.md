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
- Chạy cục bộ bằng `chatbot/run.bat`. Với Docker, dùng chung project `chatbot`: `docker compose -p chatbot -f docker-compose.chatbot.yml up -d --build ollama chatbot`. Container/image đã có có thể chạy bằng `up -d --no-build --pull never ollama chatbot` với cùng project và file compose. Hai file compose dùng chung volume model `tmdt-nhom10_ollama_data`.
- Tư vấn dùng model chat `LLM_MODEL` (mặc định `qwen2.5:3b`); tìm kiếm ngữ nghĩa dùng `EMBEDDING_MODEL` (mặc định `embeddinggemma:300m-qat-q8_0`, khoảng 338 MB). Đây là chạy suy luận trên model đã huấn luyện, không phải train lại bằng CPU.
- Không tự tải model. Dịch vụ tải model thuộc profile `models`, chỉ chạy khi chủ động chọn profile đó.
- Câu hỏi số liệu rõ ràng được tính trực tiếp từ BE: đếm sản phẩm, tồn kho, giá, xếp hạng xưởng, liệt kê theo điều kiện và số lượng khách yêu cầu. Không gọi model chỉ để chép lại số liệu. Câu tư vấn lọc trước các điều kiện mua hàng (xưởng, giá, dung tích, còn hàng, mùi đã chọn hoặc loại trừ), tìm ngữ nghĩa khi cần, rồi gọi model một lần để giải thích hoặc hỏi thêm. Không bắt buộc trả sản phẩm. Câu thống kê phức tạp chưa nhận diện được mới dùng model lập kế hoạch JSON với các thao tác/ID được kiểm tra.
- Model chỉ viết lời tư vấn chung và chọn ID; tên, xưởng, dung tích, giá, tồn kho và đường dẫn từng sản phẩm được ứng dụng gắn từ catalog. Không cho model tự sinh thêm thuộc tính sản phẩm hoặc dùng tên sản phẩm làm bằng chứng cho công dụng/xuất xứ. Mức tiền trong lời tư vấn phải khớp giá được cấp hoặc ngân sách khách nêu. Đầu ra sai ID/giá, tự sinh thuộc tính/link hoặc hỏi lặp nhu cầu được yêu cầu sửa một lần rồi kiểm tra lại; vẫn cần đánh giá chất lượng tư vấn thực tế.
- Câu hỏi có mục đích như “sản phẩm nào giúp dễ ngủ” đi qua tư vấn, không bị xem như yêu cầu liệt kê đơn thuần. Câu “ừ/vâng” sau câu hỏi được nối với yêu cầu trước, kể cả khi lịch sử cũ đã chứa câu hỏi lặp; câu hỏi lặp cũ không được đưa lại làm ví dụ cho model. Khi khách đã hỏi chọn sản phẩm theo tiêu chí xác định và có kết quả, câu trả lời phải có lựa chọn thay vì tiếp tục hỏi lại nhu cầu đó. Các nhóm nhu cầu chỉ hỗ trợ tìm mùi; không xác nhận tác dụng điều trị hay bảo đảm giấc ngủ.
- Với nhu cầu chung không nêu số lượng, danh sách gửi cho model lấy các nhóm mùi khác nhau, mỗi nhóm ưu tiên sản phẩm có giá thấp nhất phù hợp bộ lọc. Khi khách nêu số lượng, giữ các lựa chọn từ nhiều xưởng để đáp ứng số lượng đó. Nếu phần diễn giải sai nhưng ID hợp lệ, chỉ viết lại từ tên/xưởng của các sản phẩm đã chọn; không đưa câu trả lời sai vào bước viết lại. Nếu vẫn chưa viết được lời tư vấn phù hợp, trả thông tin sản phẩm đã đối chiếu kèm thông báo rõ phần tư vấn AI chưa sẵn sàng. Bài đánh giá model không tính trường hợp dự phòng này là tư vấn thành công.
- Không dùng thời hạn xếp hạng 0,6 giây cho hội thoại AI. `CHAT_TIMEOUT` giới hạn toàn lượt tư vấn (mặc định 240 giây với model 3B chạy CPU), xử lý một lượt AI tại một thời điểm để tránh dồn tải CPU. FE chờ tối đa 250 giây. `LLM_KEEP_ALIVE` mặc định 15 phút để tránh nạp lại Qwen mỗi lượt. Lỗi model không âm thầm biến thành ba đề xuất cố định.
- Máy ít RAM dùng context 4K, batch nhỏ, mmap và tắt weight repacking. Compose cho giữ tối đa hai model, mỗi model xử lý một lượt; embedding nhỏ không chủ động giải phóng Qwen khi tìm kiếm. Nếu cấu hình lại BGE lớn, ứng dụng vẫn giải phóng Qwen trước bước embedding để giảm áp lực RAM.
- Vector của tên/mô tả công khai được lưu nhỏ gọn tại `chatbot/runtime/embeddings.sqlite3` (tối đa 1024 mục), không lưu hội thoại, giá hay tồn kho vào file này. Cache dùng cả digest model và nội dung tài liệu làm khóa, tự tạo lại khi thay model/mô tả. Vector câu hỏi chỉ lưu tạm trong RAM. Compose gắn thư mục runtime để cache còn sau khi tạo lại container; không cần FAISS hay SQL mẫu.
- FE nhận trạng thái xử lý qua `POST /api/chat/events` (NDJSON), sau đó nhận câu trả lời đã kiểm tra. Đây là tiến trình xử lý, không phải phát từng token chưa kiểm chứng. Khi xóa hội thoại hoặc rời giao diện, request và lời gọi Ollama đang chờ được hủy. Thẻ sản phẩm hiển thị thông tin một lần, giữ đầy đủ nội dung cho lịch sử hội thoại.
- Chế độ `includeUnavailable=true` của catalog dùng cho thống kê sản phẩm công khai, gồm cả hết hàng; mỗi sản phẩm chỉ đếm một lần dù có nhiều dung tích. Danh sách xưởng lấy từ `/factories` để bao gồm cả xưởng mới chưa có sản phẩm. Xếp hạng đếm cả các xưởng đồng hạng.
- Model tự chọn số sản phẩm cần tư vấn, giới hạn hiển thị theo `TOP_K` hoặc số lượng khách yêu cầu, tối đa 12. Liệt kê dài hiển thị tối đa 12 kết quả kèm tổng số và đường dẫn xem thêm.
- Khi thiếu hoặc tắt model chat, chỉ có chế độ tra cứu dự phòng bằng catalog và một số mẫu câu; không tương đương tư vấn AI. `GET http://localhost:8000/health` báo `status=limited`, `model_ready=false`, `chat_model_ready=false` trong trường hợp này, dù model embedding vẫn sẵn sàng. Health trả HTTP 200 nếu catalog truy cập được; model đã cài không đồng nghĩa đã nạp vào RAM.
- Khi chạy Python ngoài Docker, có thể đặt `CATALOG_URL=http://localhost:8080/products/chatbot-catalog`. Trong Docker, mặc định dùng `host.docker.internal`.

### Kiểm tra

- BE: `mvn.cmd -o test` tại `backend`.
- FE: `npm.cmd run lint` và `node_modules\\.bin\\tsc.cmd --project tsconfig.app.json --noEmit --incremental false` tại `frontend`.
- Chatbot: `python -B -m unittest -v test_chatbot test_conversation test_streaming test_vector_cache` tại `chatbot`; không tải model hoặc tạo chỉ mục để chạy các kiểm thử này. Kiểm thử model dùng phản hồi giả lập để kiểm tra luồng và ràng buộc. Thử model đã cài với catalog thật: `python -B evaluate_chatbot.py --mode consult --model qwen2.5:3b` (không tải thêm model, không ghi đơn hàng).
- Giao thức streaming và hiển thị chatbot: `node --test test/chatbotStream.test.mjs test/chatPresentation.test.mjs` tại `frontend` (Node 24 hỗ trợ đọc TypeScript trực tiếp).

Mỗi đơn thanh toán chứa sản phẩm của một xưởng. Giá phối hương gồm nguyên liệu xuất kho theo chai, phí chai đựng và phí phối của xưởng (hoặc phí mặc định cấu hình ở BE). Trang đối soát ghi nhận biên nhận chuyển tiền đã thực hiện, không tự chuyển tiền qua ngân hàng.

Công thức phối hương cũ chưa lưu dung tích nguyên liệu xuất kho cần được mở phối lại để nhận báo giá mới trước khi đặt hàng.

## Kết nối hệ quản trị với cơ sở dữ liệu

<img width="690" height="556" alt="image" src="https://github.com/user-attachments/assets/7e1c0fec-0612-45fa-a74a-16edabc6733c" />

Qua tab **Driver properties**:

<img width="697" height="560" alt="image" src="https://github.com/user-attachments/assets/6a1175d1-b8d1-4a24-895c-eac54f1cd9a7" />

Điều chỉnh: `allowPublicKeyRetrieval` → `True`

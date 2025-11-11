# Hướng dẫn Test Comments API trong Postman

## Bước 1: Khởi động Server

Mở terminal và chạy lệnh:

```bash
npm run start:dev
```

Đợi server khởi động thành công. Bạn sẽ thấy thông báo:
```
Application is running on: http://localhost:3080
```

---

## Bước 2: Mở Postman và Import Collection

1. Mở Postman
2. Click **Import** (góc trên bên trái)
3. Chọn file `postman_collection.json` trong thư mục project
4. Collection "RealWorld API - Articles" sẽ xuất hiện

---

## Bước 3: Kiểm tra Collection Variables

1. Click vào collection "RealWorld API - Articles"
2. Click tab **Variables**
3. Đảm bảo các biến sau đã được thiết lập:
   - `baseUrl`: `http://localhost:3080`
   - `token`: (để trống, sẽ được tự động set sau khi login)
   - `articleSlug`: (để trống, sẽ được tự động set sau khi tạo article)
   - `commentId`: (để trống, sẽ được tự động set sau khi tạo comment)

---

## Bước 4: Test Authentication (Bắt buộc để test Comments)

### 4.1. Đăng ký User mới (hoặc Login)

**Option A: Register User**
1. Mở request: **Auth > Register User**
2. Click **Send**
3. Kiểm tra response:
   - Status: `200` hoặc `201`
   - Response body có chứa `token`
   - Token sẽ tự động được lưu vào biến `{{token}}`

**Option B: Login User** (nếu đã có tài khoản)
1. Mở request: **Auth > Login User**
2. Click **Send**
3. Kiểm tra response tương tự như trên

---

## Bước 5: Tạo Article (Cần có article để test comments)

1. Mở request: **Articles > Create Article**
2. Click **Send**
3. Kiểm tra response:
   - Status: `200` hoặc `201`
   - Response có chứa `article.slug`
   - `articleSlug` sẽ tự động được lưu vào biến collection

**Lưu ý:** Nếu bạn đã có article, có thể bỏ qua bước này và set `articleSlug` thủ công.

---

## Bước 6: Test Comments Endpoints

### 6.1. POST - Add Comment to Article (Tạo Comment)

**Endpoint:** `POST /api/articles/:slug/comments`

**Các bước:**
1. Mở request: **Articles > Add Comment to Article**
2. Kiểm tra:
   - Method: `POST`
   - URL: `{{baseUrl}}/api/articles/{{articleSlug}}/comments`
   - Headers:
     - `Content-Type: application/json`
     - `Authorization: Bearer {{token}}`
   - Body (raw JSON):
     ```json
     {
       "comment": {
         "body": "His name was my name too."
       }
     }
     ```

3. Click **Send**

4. **Kiểm tra Response:**
   - Status: `200` hoặc `201`
   - Response body format:
     ```json
     {
       "comment": {
         "id": 1,
         "createdAt": "2024-01-01T12:00:00.000Z",
         "updatedAt": "2024-01-01T12:00:00.000Z",
         "body": "His name was my name too.",
         "author": {
           "username": "jake",
           "bio": "I work at statefarm",
           "image": "https://i.stack.imgur.com/xHWG8.jpg",
           "following": false
         }
       }
     }
     ```
   - `commentId` sẽ tự động được lưu vào biến collection

---

### 6.2. GET - Get Comments from Article (Lấy danh sách Comments)

**Endpoint:** `GET /api/articles/:slug/comments`

**Các bước:**
1. Mở request: **Articles > Get Comments from Article**
2. Kiểm tra:
   - Method: `GET`
   - URL: `{{baseUrl}}/api/articles/{{articleSlug}}/comments`
   - Headers:
     - `Content-Type: application/json`
     - **Không cần Authorization** (auth optional)

3. Click **Send**

4. **Kiểm tra Response:**
   - Status: `200`
   - Response body format:
     ```json
     {
       "comments": [
         {
           "id": 1,
           "createdAt": "2024-01-01T12:00:00.000Z",
           "updatedAt": "2024-01-01T12:00:00.000Z",
           "body": "His name was my name too.",
           "author": {
             "username": "jake",
             "bio": "I work at statefarm",
             "image": "https://i.stack.imgur.com/xHWG8.jpg",
             "following": false
           }
         }
       ]
     }
     ```

**Test thêm:**
- Thử gửi request với Authorization header (để xem có khác gì không)
- Tạo thêm vài comments và kiểm tra thứ tự (nên sắp xếp theo createdAt DESC)

---

### 6.3. DELETE - Delete Comment (Xóa Comment)

**Endpoint:** `DELETE /api/articles/:slug/comments/:id`

**Các bước:**
1. Mở request: **Articles > Delete Comment**
2. Kiểm tra:
   - Method: `DELETE`
   - URL: `{{baseUrl}}/api/articles/{{articleSlug}}/comments/{{commentId}}`
   - Headers:
     - `Authorization: Bearer {{token}}` (bắt buộc)

3. Click **Send**

4. **Kiểm tra Response:**
   - Status: `200`
   - Response body:
     ```json
     {
       "message": "Comment deleted successfully"
     }
     ```

5. **Verify:** Gửi lại request GET Comments để xác nhận comment đã bị xóa

---

## Bước 7: Test Error Cases (Kiểm tra xử lý lỗi)

### 7.1. Test POST Comment không có Authentication
1. Tạm thời xóa hoặc comment Authorization header
2. Gửi request POST Comment
3. **Expected:** Status `401 Unauthorized`

### 7.2. Test POST Comment với Article không tồn tại
1. Thay đổi `{{articleSlug}}` thành một slug không tồn tại (ví dụ: "non-existent-article")
2. Gửi request POST Comment
3. **Expected:** Status `404 Not Found` với message "Article not found"

### 7.3. Test DELETE Comment của người khác
1. Tạo comment với user A
2. Login với user B
3. Thử xóa comment của user A
4. **Expected:** Status `403 Forbidden` với message "You can only delete your own comments"

### 7.4. Test DELETE Comment không tồn tại
1. Set `{{commentId}}` thành một ID không tồn tại (ví dụ: 99999)
2. Gửi request DELETE Comment
3. **Expected:** Status `404 Not Found` với message "Comment not found"

### 7.5. Test POST Comment với body rỗng
1. Gửi request POST Comment với body:
   ```json
   {
     "comment": {
       "body": ""
     }
   }
   ```
2. **Expected:** Status `400 Bad Request` (validation error)

---

## Bước 8: Test Flow Hoàn Chỉnh

Thực hiện theo thứ tự để test toàn bộ flow:

1. ✅ **Register/Login User** → Lấy token
2. ✅ **Create Article** → Lấy articleSlug
3. ✅ **POST Comment** → Tạo comment đầu tiên
4. ✅ **GET Comments** → Kiểm tra comment vừa tạo
5. ✅ **POST Comment** → Tạo comment thứ hai
6. ✅ **GET Comments** → Kiểm tra có 2 comments
7. ✅ **DELETE Comment** → Xóa comment đầu tiên
8. ✅ **GET Comments** → Kiểm tra chỉ còn 1 comment

---

## Tips & Best Practices

1. **Sử dụng Collection Variables:**
   - Các biến `{{token}}`, `{{articleSlug}}`, `{{commentId}}` sẽ tự động được set
   - Không cần copy/paste thủ công

2. **Kiểm tra Response Headers:**
   - Đảm bảo `Content-Type: application/json; charset=utf-8`

3. **Test với nhiều users:**
   - Tạo 2 users khác nhau
   - Test xem user này có thể xóa comment của user kia không (should fail)

4. **Kiểm tra Database:**
   - Sau khi test, có thể kiểm tra database để xác nhận data đã được lưu đúng

5. **Sử dụng Postman Console:**
   - Mở Postman Console (View > Show Postman Console)
   - Xem chi tiết request/response để debug

---

## Troubleshooting

### Lỗi: "Cannot GET /api/articles/..."
- **Nguyên nhân:** Server chưa khởi động hoặc route chưa được đăng ký
- **Giải pháp:** Kiểm tra server đang chạy và route đã được import vào module

### Lỗi: "401 Unauthorized"
- **Nguyên nhân:** Token không hợp lệ hoặc đã hết hạn
- **Giải pháp:** Login lại để lấy token mới

### Lỗi: "404 Not Found" khi GET comments
- **Nguyên nhân:** Article slug không đúng
- **Giải pháp:** Kiểm tra `{{articleSlug}}` đã được set đúng chưa

### Lỗi: "403 Forbidden" khi DELETE comment
- **Nguyên nhân:** Bạn không phải là author của comment
- **Giải pháp:** Đây là behavior đúng, chỉ author mới có thể xóa comment

---

## Kết luận

Sau khi hoàn thành tất cả các bước trên, bạn đã test thành công tính năng CR-D Comments on Articles! 🎉


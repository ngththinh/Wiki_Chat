# 🔐 Tài Khoản Test - WikiChatbot

## 📋 Danh Sách Tài Khoản Test

Hệ thống hiện đang sử dụng **Mock Authentication Service** để test frontend mà không cần backend.

### Tài Khoản Có Sẵn

| Email                  | Password   | Tên        | Vai trò | Mô Tả                            |
| ---------------------- | ---------- | ---------- | ------- | -------------------------------- |
| `demo@example.com`     | `demo123`  | Demo User  | User    | Tài khoản demo                   |
| `admin@wikichatbot.vn` | `admin123` | Admin User | Admin   | Tài khoản admin quản lý tài liệu |

---

## 🚀 Hướng Dẫn Test Chức Năng

### 1. Test Chức Năng Login

#### Bước 1: Mở trang login

```
http://localhost:3000/login
```

#### Bước 2: Thử login với tài khoản test

- **Email**: `test@example.com`
- **Password**: `password123`
- Click nút **"Login"**

#### Kết quả mong đợi:

✅ Hiển thị "Login successful!"  
✅ Redirect về trang home (/)  
✅ Token và user info được lưu trong localStorage

#### Test các trường hợp lỗi:

**Test 1: Email không hợp lệ**

- Email: `invalid-email`
- Password: `password123`
- Kết quả: "Please enter a valid email"

**Test 2: Email không tồn tại**

- Email: `notfound@example.com`
- Password: `password123`
- Kết quả: "Invalid email or password"

**Test 3: Sai mật khẩu**

- Email: `test@example.com`
- Password: `wrongpassword`
- Kết quả: "Invalid email or password"

**Test 4: Trường trống**

- Bỏ trống email hoặc password
- Kết quả: "Email is required" hoặc "Password is required"

---

### 2. Test Chức Năng Register

#### Bước 1: Mở trang register

```
http://localhost:3000/register
```

#### Bước 2: Tạo tài khoản mới

- **Email**: `newuser@example.com`
- **Password**: `newpass123`
- **Confirm Password**: `newpass123`
- ✅ Check "I agree to the Terms of Service"
- Click nút **"Get started free"**

#### Kết quả mong đợi:

✅ Hiển thị "Registration successful!"  
✅ Redirect về trang home (/)  
✅ Tài khoản mới được tạo và có thể login  
✅ Token và user info được lưu trong localStorage

#### Test các trường hợp lỗi:

**Test 1: Email đã tồn tại**

- Email: `test@example.com` (đã có sẵn)
- Password: `password123`
- Confirm Password: `password123`
- Kết quả: "Email already exists"

**Test 2: Password không khớp**

- Email: `newuser@example.com`
- Password: `password123`
- Confirm Password: `password456`
- Kết quả: "Passwords do not match"

**Test 3: Password quá ngắn**

- Email: `newuser@example.com`
- Password: `123`
- Confirm Password: `123`
- Kết quả: "Password must be at least 6 characters"

**Test 4: Không chấp nhận điều khoản**

- Email: `newuser@example.com`
- Password: `password123`
- Confirm Password: `password123`
- ❌ Không check "Terms of Service"
- Kết quả: "You must accept the Terms of Service"

---

## 🔧 Kiểm Tra LocalStorage

Sau khi login hoặc register thành công, mở **Developer Tools** (F12) và kiểm tra:

### Chrome/Edge:

1. Mở Developer Tools (F12)
2. Chọn tab **Application**
3. Chọn **Local Storage** > `http://localhost:3000`
4. Kiểm tra các key:
   - `authToken`: Chứa token authentication
   - `user`: Chứa thông tin user (JSON)

### Firefox:

1. Mở Developer Tools (F12)
2. Chọn tab **Storage**
3. Chọn **Local Storage** > `http://localhost:3000`

### Ví dụ dữ liệu trong localStorage:

```javascript
// authToken
"mock-token-1-1737000000000"

// user
{
  "id": "1",
  "email": "test@example.com",
  "name": "Test User"
}
```

---

## 🎯 Test Flow Hoàn Chỉnh

### Scenario 1: Đăng ký tài khoản mới → Login

1. Vào `/register`
2. Đăng ký với email mới: `mytest@example.com` / password: `test1234`
3. Sau khi đăng ký thành công, logout (xóa localStorage)
4. Vào `/login`
5. Login với tài khoản vừa tạo: `mytest@example.com` / `test1234`
6. Kết quả: ✅ Login thành công

### Scenario 2: Remember Me

1. Vào `/login`
2. Login với `test@example.com` / `password123`
3. ✅ Check "Remember me"
4. Login thành công
5. Đóng browser và mở lại
6. Kết quả: ✅ Vẫn còn session (localStorage vẫn lưu token)

---

## 📝 Ghi Chú Quan Trọng

### Mock Authentication Service

- Hiện tại đang sử dụng **mockAuthService** trong file `src/lib/authService.ts`
- Dữ liệu được lưu trong memory và localStorage
- Khi reload page, mock users sẽ reset về danh sách ban đầu
- Các tài khoản đăng ký mới chỉ tồn tại trong session hiện tại

### Chuyển sang Real API

Khi backend đã sẵn sàng, chỉ cần thay đổi trong file `src/lib/authService.ts`:

```typescript
// Thay đổi dòng cuối cùng từ:
export default mockAuthService;

// Thành:
export default authService;
```

Sau đó cập nhật biến môi trường:

```env
NEXT_PUBLIC_API_BASE_URL=http://your-backend-url/api
```

---

## 🛠️ Troubleshooting

### Lỗi: "Network error. Please check your connection."

- Đang sử dụng mock service nên không có lỗi này
- Nếu xuất hiện, kiểm tra console log

### Lỗi: Login thành công nhưng không redirect

- Kiểm tra console có lỗi navigation không
- Đảm bảo trang `/` (home) đã tồn tại

### Clear localStorage để test lại

```javascript
// Chạy trong console:
localStorage.clear();
```

---

## 📞 Support

Nếu có vấn đề, kiểm tra:

1. Console log trong Developer Tools (F12)
2. Network tab để xem API calls
3. LocalStorage để xem token và user data

---

**Happy Testing! 🎉**

# Module: Branding

Module này quản lý nhận diện thương hiệu của Tenant trên giao diện người dùng.

## 1. Các thông số cấu hình
| Tham số | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `companyName` | String | Tên hiển thị chính thức của công ty |
| `logoUrl` | String (URL) | Đường dẫn tới ảnh logo (PNG/SVG) |
| `primaryColor` | String (Hex) | Màu chủ đạo (Nút bấm, Header) |
| `secondaryColor` | String (Hex) | Màu phụ (Background, Border) |

## 2. Quy tắc áp dụng
- Các màu sắc được áp dụng động vào CSS Variable của giao diện Runtime hoặc Portal dành cho khách hàng.
- `companyName` được sử dụng trong tiêu đề trang và các mẫu thông báo (Templates).

## 3. Schema ví dụ
```json
"branding": {
    "companyName": "Standard Insurance Co.",
    "logoUrl": "https://cdn.example.com/logo.png",
    "primaryColor": "#2563eb",
    "secondaryColor": "#64748b"
}
```

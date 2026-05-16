# Module: Custom Fields

Module này cho phép Tenant mở rộng dữ liệu của hồ sơ claim mà không cần thay đổi cấu trúc bảng database.

## 1. Các thông số cấu hình
- **ID**: Mã định danh (field_1, field_2...).
- **Label**: Tên hiển thị trên form.
- **Enabled**: Bật/tắt field.
- **Required**: Bắt buộc nhập hay không.

## 2. Các loại Field hỗ trợ
Hệ thống hỗ trợ sẵn:
- **3 String Fields**: Dành cho các thông tin dạng chữ (Ghi chú, Mã tham chiếu ngoại...).
- **3 Numeric Fields**: Dành cho các thông tin dạng số (Số lượng hành khách, Năm sản xuất...).

## 3. Quy tắc Validation (Runtime)
- Khi `processClaim` chạy, hệ thống kiểm tra các field được đánh dấu `required: true` và `enabled: true`.
- Trả về danh sách lỗi nếu dữ liệu claim gửi lên thiếu các field này.

## 4. Schema ví dụ
```json
"customFields": {
    "text": [
        { "id": "field_1", "label": "External Reference", "enabled": true, "required": true },
        { "id": "field_2", "label": "Notes", "enabled": true, "required": false }
    ],
    "number": [
        { "id": "field_4", "label": "Incident Year", "enabled": true, "required": true }
    ]
}
```

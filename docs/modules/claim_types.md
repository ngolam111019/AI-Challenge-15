# Module: Claim Types & Documents

Module này định nghĩa các loại hình bảo hiểm mà Tenant hỗ trợ và danh sách giấy tờ bắt buộc đi kèm.

## 1. Các thông số cấu hình
- **ID**: Mã định danh loại claim (ví dụ: `health`, `auto`, `property`).
- **Name**: Tên hiển thị.
- **Enabled**: Trạng thái bật/tắt của loại hình này đối với Tenant.
- **Required Documents**: Danh sách các loại giấy tờ bắt buộc phải upload.
- **Optional Documents**: Danh sách các loại giấy tờ không bắt buộc.

## 2. Quy tắc Validation (Runtime)
- Khi một hồ sơ claim được gửi lên, hệ thống sẽ đối chiếu `claimType` với danh sách này.
- Nếu `claimType` không tồn tại hoặc bị `enabled: false`, hệ thống sẽ từ chối xử lý.
- Trả về danh sách `requiredDocs` để Frontend hiển thị form upload tương ứng.

## 3. Schema ví dụ
```json
"claimTypes": [
    {
        "id": "health",
        "name": "Health Insurance",
        "enabled": true,
        "requiredDocs": ["Identity Card", "Medical Record"],
        "optionalDocs": ["Prescription"]
    }
]
```

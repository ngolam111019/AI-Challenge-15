# Module: Claim Types & Documents

Module này định nghĩa các loại hình bảo hiểm chuẩn mà Tenant hỗ trợ và danh sách giấy tờ chứng từ đính kèm (bắt buộc hoặc tùy chọn).

## 1. Các loại hình tiêu chuẩn (Standard Claim Types)
Hệ thống hỗ trợ sẵn 5 loại hình bảo hiểm sau, cho phép từng Tenant bật/tắt linh hoạt:
- **OUTPATIENT**: Điều trị ngoại trú.
- **INPATIENT**: Điều trị nội trú.
- **DENTAL**: Nha khoa.
- **MATERNITY**: Thai sản.
- **OPTICAL**: Nhãn khoa.

## 2. Cấu trúc tài liệu chứng từ (Verification Documents)
Mỗi loại hình khi được bật sẽ đi kèm một danh sách chứng từ (`requiredDocs`). Mỗi chứng từ bao gồm:
- `name` (String): Tên loại tài liệu (Ví dụ: Hóa đơn viện phí, Đơn thuốc).
- `required` (Boolean): `true` nếu là chứng từ bắt buộc phải nộp, `false` nếu là chứng từ bổ sung tùy chọn.

## 3. Quy tắc Validation (Runtime)
- Khi một hồ sơ claim được gửi lên, hệ thống đối chiếu `claimType` với danh sách này.
- Nếu `claimType` không tồn tại hoặc bị `enabled: false`, hệ thống từ chối xử lý.
- Trả về chính xác cấu trúc tài liệu bắt buộc và tùy chọn để Frontend / Portal hiển thị cho khách hàng.

## 4. Schema ví dụ
```json
"claimTypes": [
    {
        "id": "OUTPATIENT",
        "name": "Outpatient",
        "enabled": true,
        "requiredDocs": [
            { "name": "ID Card", "required": true },
            { "name": "Medical Invoice", "required": true },
            { "name": "Doctor Prescription", "required": false }
        ]
    },
    {
        "id": "INPATIENT",
        "name": "Inpatient",
        "enabled": false,
        "requiredDocs": []
    }
]
```

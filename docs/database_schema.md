# Cấu trúc Cơ sở dữ liệu (Database Schema)

Hệ thống sử dụng PostgreSQL với mô hình lưu trữ kết hợp giữa quan hệ (Relational) và phi quan hệ (JSONB).

## 1. Sơ đồ thực thể

### Bảng `tenants`
Lưu trữ thông tin định danh cơ bản của một khách hàng (Tenant).
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | SERIAL | Khóa chính |
| `slug` | VARCHAR | Mã định danh duy nhất (ví dụ: 'standard-insure') |
| `name` | VARCHAR | Tên công ty |
| `current_version_id` | INT | Liên kết tới phiên bản cấu hình đang hoạt động |
| `created_at` | TIMESTAMP | Thời gian tạo |

### Bảng `tenant_configs`
Lưu trữ các phiên bản cấu hình. Đây là bảng quan trọng nhất.
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | SERIAL | Khóa chính |
| `tenant_id` | INT | FK tới bảng tenants |
| `version_number` | INT | Số thứ tự phiên bản (1, 2, 3...) |
| `config_data` | JSONB | Dữ liệu cấu hình thực tế |
| `note` | TEXT | Ghi chú thay đổi (ví dụ: "Initial", "Rollback from v2") |
| `created_at` | TIMESTAMP | Thời gian lưu cấu hình |

## 2. Chiến lược Versioning (GitHub-style)
Hệ thống sử dụng chiến lược **Additive History (Lịch sử cộng dồn)** tương tự Git:
- **Không bao giờ xóa hoặc sửa** các bản ghi cũ trong `tenant_configs`.
- **Rollback logic**: Khi thực hiện Rollback về phiên bản `vN`, hệ thống sẽ không chỉ đơn giản là đổi Pointer. Thay vào đó, nó sẽ lấy dữ liệu từ `vN`, tạo một bản ghi mới (ví dụ `vN+2`) với nội dung y hệt `vN` và ghi chú rõ: `Rollback from vN`.
- **Ưu điểm**:
    - Minh bạch tuyệt đối: Biết được ai đã rollback, khi nào và từ đâu.
    - Duy trì luồng thời gian tuyến tính (Linear History).

## 3. Cấu trúc JSONB (config_data)
Dữ liệu trong `config_data` có cấu trúc phân cấp:
```json
{
  "branding": { ... },
  "claimTypes": [ ... ],
  "approvalRules": { ... },
  "notifications": { ... },
  "sla": { ... },
  "customFields": { ... }
}
```
Việc thêm module mới chỉ đơn giản là thêm một key mới vào object này.

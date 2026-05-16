# Module: SLA & Escalation

Module này quản lý cấu hình ngày làm việc hoạt động trong tuần, mục tiêu thời gian giải quyết cho từng loại hồ sơ và các quy tắc tự động leo thang thông báo khi xử lý trễ hạn.

## 1. Cấu hình ngày làm việc (Active Working Days)
- `workingDays`: Danh sách các ngày làm việc tiêu chuẩn trong tuần (Ví dụ: từ Monday đến Friday). Các ngày không nằm trong danh sách được tự động loại trừ khỏi công thức tính thời gian xử lý thực tế.

## 2. Mục tiêu xử lý & Quy tắc leo thang từng loại hồ sơ (Per-Claim Target & Escalations)
Đối với từng loại hình bảo hiểm được bật (Enabled), Tenant có thể cấu hình:
- `targetDays`: Thời gian xử lý mục tiêu (tính theo ngày làm việc).
- `escalations`: Danh sách các quy tắc cảnh báo leo thang động:
    - `delayDays`: Số ngày xử lý trễ hạn so với mốc `targetDays`.
    - `notifyRole`: Vai trò thẩm quyền nhận cảnh báo tự động (`assessor`, `team_lead`, hoặc `director`).

## 3. Logic tính toán (Runtime Engine)
- `SLA Deadline` = Ngày nộp hồ sơ + `targetDays` (chỉ cộng dồn các ngày nằm trong danh sách `workingDays`).
- Khi một hồ sơ chưa hoàn tất và thời gian hiện tại vượt qua `SLA Deadline` + `delayDays`, hệ thống kích hoạt gửi thông báo ưu tiên cao tới `notifyRole`.

## 4. Schema ví dụ
```json
"sla": {
    "workingDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    "claimTypeSla": {
        "OUTPATIENT": {
            "targetDays": 5,
            "escalations": [
                { "delayDays": 1, "notifyRole": "assessor" },
                { "delayDays": 3, "notifyRole": "team_lead" },
                { "delayDays": 5, "notifyRole": "director" }
            ]
        },
        "INPATIENT": {
            "targetDays": 10,
            "escalations": [
                { "delayDays": 2, "notifyRole": "team_lead" }
            ]
        }
    }
}
```

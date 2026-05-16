# Module: SLA & Escalation

Module này quản lý thời gian cam kết xử lý dịch vụ và quy trình leo thang khi quá hạn.

## 1. Thời gian xử lý mục tiêu (SLA)
- **Default Target Days**: Số ngày làm việc mặc định để xử lý một hồ sơ.
- **Claim Type Specific SLA**: Cấu hình riêng cho từng loại claim (ví dụ: Health 3 ngày, Auto 7 ngày).

## 2. Quy tắc leo thang (Escalation Matrix)
Định nghĩa các hành động tự động khi hồ sơ bị trễ quá X ngày:
- **Level 1**: Cảnh báo nhân viên trực tiếp.
- **Level 2**: Thông báo cho Trưởng nhóm (Team Leader).
- **Level 3**: Thông báo cho Giám đốc (Director) và QA Team.

## 3. Logic tính toán
- Ngày làm việc (Working Days): Thường loại trừ Thứ 7, Chủ Nhật và ngày lễ (Cần Module Calendar hỗ trợ).
- Deadline = Submission Date + SLA Days.

## 4. Schema ví dụ
```json
"sla": {
    "defaultTargetDays": 5,
    "claimTypeSla": {
        "health": 3,
        "auto": 7
    },
    "escalation": [
        { "overdueDays": 1, "notify": "handler", "action": "send_alert" },
        { "overdueDays": 3, "notify": "team_lead", "action": "reassign" },
        { "overdueDays": 5, "notify": "director", "action": "critical_alert" }
    ]
}
```

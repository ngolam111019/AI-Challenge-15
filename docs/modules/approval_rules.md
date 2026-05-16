# Module: Approval Rules

Module này xác định quy trình phê duyệt hồ sơ dựa trên giá trị (số tiền) của claim.

## 1. Các thông số cấu hình
- **Auto-approval Threshold**: Ngưỡng số tiền mà dưới đó hệ thống sẽ tự động phê duyệt (Status: `Approved`).
- **Approval Tiers**: Các cấp độ phê duyệt thủ công.
    - `min`: Số tiền tối thiểu.
    - `max`: Số tiền tối đa.
    - `role`: Vai trò người cần phê duyệt (ví dụ: `assessor`, `team_lead`, `director`).

## 2. Quy tắc Logic
1. Nếu `amount` <= `autoApproveThreshold` -> **Auto-approve**.
2. Nếu `amount` > `autoApproveThreshold`:
   - Tìm Tier phù hợp trong danh sách `tiers`.
   - Gán hồ sơ cho vai trò `role` tương ứng.
3. Nếu không tìm thấy Tier phù hợp -> Chuyển sang trạng thái "Manual Review Required" cho cấp cao nhất.

## 3. Schema ví dụ
```json
"approvalRules": {
    "autoApproveThreshold": 5000,
    "tiers": [
        { "min": 0, "max": 10000, "role": "assessor" },
        { "min": 10000, "max": 100000, "role": "team_lead" },
        { "min": 100000, "max": 1000000000, "role": "director" }
    ]
}
```

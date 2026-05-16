# Module: Approval Rules

Module này xác định quy trình và các cấp thẩm quyền phê duyệt hồ sơ dựa trên giá trị bồi thường (số tiền) của claim.

## 1. Các thông số cấu hình
- **Auto-approval Threshold**: Ngưỡng số tiền mà dưới hoặc bằng mức đó, hệ thống tự động phê duyệt (Status: `Auto-Approve ⚡`).
- **Approval Tiers**: Bảng phân cấp thẩm quyền phê duyệt thủ công.
    - `min`: Số tiền tối thiểu trong khung.
    - `max`: Số tiền tối đa trong khung.
    - `role`: Vai trò người thẩm định bắt buộc. Hệ thống giới hạn nghiêm ngặt trong 3 cấp độ thẩm quyền sau:
        1. `assessor`: Chuyên viên thẩm định (Cơ bản).
        2. `team_lead`: Trưởng nhóm thẩm định (Trung cấp).
        3. `director`: Giám đốc / Lãnh đạo cấp cao (Cao cấp).

## 2. Quy tắc Logic (Runtime Engine)
1. Nếu `amount` <= `autoApproveThreshold` -> Trả về kết quả **Auto-approve**.
2. Nếu `amount` > `autoApproveThreshold`:
   - Duyệt qua bảng phân cấp `tiers` để tìm khoảng `[min, max]` chứa `amount`.
   - Gán luồng phê duyệt cho vai trò `role` tương ứng.
3. Nếu hồ sơ vượt khỏi toàn bộ các khung cấu hình -> Gán nhãn "Needs Manual Review (Out of bounds)".

## 3. Schema ví dụ
```json
"approvalRules": {
    "autoApproveThreshold": 20000,
    "tiers": [
        { "min": 20000, "max": 100000, "role": "assessor" },
        { "min": 100000, "max": 500000, "role": "team_lead" },
        { "min": 500000, "max": 1000000000, "role": "director" }
    ]
}
```

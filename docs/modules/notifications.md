# Module: Notifications

Module này quản lý việc gửi thông báo tới khách hàng hoặc nhân viên dựa trên các sự kiện (Events).

## 1. Các sự kiện hỗ trợ (Events)
- `claim_submitted`: Khi hồ sơ vừa được gửi.
- `approved`: Khi hồ sơ được phê duyệt.
- `rejected`: Khi hồ sơ bị từ chối.
- `payment_sent`: Khi tiền bồi thường đã được chuyển.

## 2. Các kênh gửi (Channels)
- `email`: Gửi qua dịch vụ SMTP/SendGrid.
- `SMS`: Gửi qua Twilio/Stringee.
- `webhook`: Gửi dữ liệu JSON tới một URL bên thứ ba.

## 3. Quản lý Templates
Mỗi sự kiện có thể chọn:
- **Default Template**: Mẫu chung của hệ thống.
- **Custom Template**: Mẫu riêng dành cho từng Tenant.

## 4. Schema ví dụ
```json
"notifications": {
    "events": [
        { 
            "event": "claim_submitted", 
            "channels": ["email"], 
            "template": "standard_welcome_v1" 
        },
        { 
            "event": "approved", 
            "channels": ["email", "sms"], 
            "template": "congrats_template" 
        }
    ]
}
```

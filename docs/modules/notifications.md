# Module: Notifications

Module này quản lý cấu hình tự động gửi thông báo đa kênh tới khách hàng, chuyên viên hoặc hệ thống ERP nội bộ dựa trên các sự kiện vòng đời (Events).

## 1. Các sự kiện vòng đời (Lifecycle Events)
- `claim_submitted`: Gửi ngay khi hồ sơ bồi thường được nộp.
- `approved`: Kích hoạt khi hồ sơ được phê duyệt hoàn tất.
- `rejected`: Kích hoạt khi hồ sơ bị từ chối.
- `payment_sent`: Thông báo giải ngân thành công.

## 2. Các kênh gửi & Cấu hình chi tiết (Active Outbound Channels)
Mỗi sự kiện cho phép bật/tắt linh hoạt 3 kênh thông báo sau:
- `email`: Gửi thông báo qua dịch vụ Email Gateway. Cho phép chọn dùng **Default Template** hoặc điền **Custom Template ID** riêng của Tenant.
- `sms`: Gửi thông báo qua SMS Gateway (Twilio/AWS SNS). Cho phép chọn dùng **Default SMS Template** hoặc điền mã mẫu tin nhắn riêng.
- `webhook`: Tích hợp HTTP Webhook để đồng bộ thời gian thực với hệ thống Gov/ERP của doanh nghiệp. Cho phép điền trực tiếp **Custom Endpoint URL** để nhận JSON payload.

## 3. Schema ví dụ
```json
"notifications": {
    "events": [
        { 
            "event": "claim_submitted", 
            "channels": ["email", "webhook"],
            "channelConfigs": {
                "email": {
                    "templateType": "custom",
                    "customTemplateId": "sendgrid_corp_tpl_01"
                },
                "sms": {
                    "templateType": "default",
                    "customTemplateId": ""
                },
                "webhook": {
                    "templateType": "custom",
                    "customTemplateId": "https://api.govhealth.local/v1/sync/claims"
                }
            }
        }
    ]
}
```

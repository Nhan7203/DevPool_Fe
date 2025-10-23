



stateDiagram-v2
    [*] --> New: HR tạo hồ sơ từ CV
    
    New --> Screening: HR bắt đầu review
    Screening --> Available: Pass screening
    Screening --> Rejected: Không đạt yêu cầu
    
    Available --> Interviewing: Submit cho job request
    Available --> Reserved: Client đặt trước
    Available --> OnHold: Tạm không available
    
    Interviewing --> Available: Không được chọn
    Interviewing --> Offered: Nhận offer
    
    Offered --> Negotiating: Thương lượng terms
    Negotiating --> Offered: Chưa đạt thỏa thuận
    Negotiating --> Available: Từ chối offer
    Negotiating --> Working: Chấp nhận offer
    
    Reserved --> Working: Ký hợp đồng
    Reserved --> Available: Client hủy
    
    Working --> Available: Hoàn thành dự án
    Working --> OnLeave: Nghỉ phép có lương
    Working --> Suspended: Tạm dừng vi phạm
    
    OnLeave --> Working: Quay lại làm việc
    
    OnHold --> Available: Có thể làm lại
    OnHold --> Inactive: Không hoạt động lâu
    
    Suspended --> Working: Được phép quay lại
    Suspended --> Terminated: Chấm dứt hợp đồng
    
    Available --> Inactive: 6 tháng không hoạt động
    Inactive --> Available: Reactivate
    Inactive --> Archived: Không làm việc nữa
    
    Terminated --> Available: Có thể join dự án mới
    Terminated --> Blacklisted: Vi phạm nghiêm trọng
    
    Rejected --> Archived
    Blacklisted --> [*]
    Archived --> [*]
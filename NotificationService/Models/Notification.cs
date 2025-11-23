namespace NotificationService.Models
{
    public class Notification
    {
        public int Id { get; set; }
        public Guid OrderId { get; set; }
        public string Recipient { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public NotificationType Type { get; set; }
        public NotificationStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? SentAt { get; set; }
        public string? ErrorMessage { get; set; }
        public int RetryCount { get; set; }
    }

    public enum NotificationType
    {
        Email,
        SMS
    }

    public enum NotificationStatus
    {
        Pending,
        Sent,
        Failed
    }
}
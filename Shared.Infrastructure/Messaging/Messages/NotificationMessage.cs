namespace Shared.Infrastructure.Messaging.Messages
{
    public class NotificationMessage
    {
        public Guid OrderId { get; set; }
        public string CustomerEmail { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public NotificationType Type { get; set; }
    }

    public enum NotificationType
    {
        Email,
        SMS,
        Both
    }
}
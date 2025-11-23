using NotificationService.DTOs;
using NotificationService.Models;

namespace NotificationService.Services
{
    public interface INotificationService
    {
        Task<bool> SendNotificationAsync(SendNotificationRequest request);
        Task<NotificationResponse?> GetNotificationByIdAsync(int id);
        Task<IEnumerable<NotificationResponse>> GetNotificationsByOrderIdAsync(Guid orderId);
        Task<IEnumerable<NotificationResponse>> GetAllNotificationsAsync();
    }
}
namespace Shared.Infrastructure.Messaging
{
    public class RabbitMQSettings
    {
        public string Host { get; set; } = "localhost";
        public string Username { get; set; } = "guest";
        public string Password { get; set; } = "guest";
        public int Port { get; set; } = 5672;
    }
}
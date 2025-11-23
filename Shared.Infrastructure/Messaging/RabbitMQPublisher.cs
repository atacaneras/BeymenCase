using Microsoft.Extensions.Logging;
using Polly;
using RabbitMQ.Client;
using System.Text;
using System.Text.Json;

namespace Shared.Infrastructure.Messaging
{
    public class RabbitMQPublisher : IMessagePublisher, IDisposable
    {
        private readonly IConnection _connection;
        private readonly IModel _channel;
        private readonly ILogger<RabbitMQPublisher> _logger;

        public RabbitMQPublisher(RabbitMQSettings settings, ILogger<RabbitMQPublisher> logger)
        {
            _logger = logger;

            var factory = new ConnectionFactory
            {
                HostName = settings.Host,
                UserName = settings.Username,
                Password = settings.Password,
                Port = settings.Port,
                AutomaticRecoveryEnabled = true,
                NetworkRecoveryInterval = TimeSpan.FromSeconds(10)
            };

            // Bağlantı için retry (tekrar deneme) deseni
            var retryPolicy = Policy
                .Handle<Exception>()
                .WaitAndRetry(5, retryAttempt =>
                    TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)),
                    (exception, timeSpan, retryCount, context) =>
                    {
                        _logger.LogWarning(exception,
                            "RabbitMQ bağlantı denemesi {RetryCount} başarısız oldu. Bir sonraki deneme öncesi {TimeSpan} bekleniyor.",
                            retryCount, timeSpan);
                    });

            _connection = retryPolicy.Execute(() => factory.CreateConnection());
            _channel = _connection.CreateModel();

            _logger.LogInformation("RabbitMQ bağlantısı başarıyla kuruldu");
        }

        public async Task PublishAsync<T>(string exchange, string routingKey, T message) where T : class
        {
            var retryPolicy = Policy
                .Handle<Exception>()
                .WaitAndRetryAsync(3, retryAttempt =>
                    TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)),
                    (exception, timeSpan, retryCount, context) =>
                    {
                        _logger.LogWarning(exception,
                            "Mesaj yayınlama denemesi {RetryCount} başarısız oldu. Exchange '{Exchange}', routing key '{RoutingKey}'. {TimeSpan} sonra tekrar deneniyor.",
                            retryCount, exchange, routingKey, timeSpan);
                    });

            await retryPolicy.ExecuteAsync(async () =>
            {
                var json = JsonSerializer.Serialize(message);
                var body = Encoding.UTF8.GetBytes(json);

                var properties = _channel.CreateBasicProperties();
                properties.Persistent = true;
                properties.ContentType = "application/json";
                properties.Timestamp = new AmqpTimestamp(DateTimeOffset.UtcNow.ToUnixTimeSeconds());

                _channel.BasicPublish(
                    exchange: exchange,
                    routingKey: routingKey,
                    basicProperties: properties,
                    body: body);

                _logger.LogInformation(
                    "Mesaj başarıyla yayınlandı. Exchange '{Exchange}', routing key '{RoutingKey}'. Mesaj: {Message}",
                    exchange, routingKey, json);

                await Task.CompletedTask;
            });
        }

        public void Dispose()
        {
            _channel?.Close();
            _channel?.Dispose();
            _connection?.Close();
            _connection?.Dispose();
            _logger.LogInformation("RabbitMQ bağlantısı kapatıldı ve kaynaklar serbest bırakıldı");
        }
    }
}

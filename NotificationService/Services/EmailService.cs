using System.Net;
using System.Net.Mail;

namespace NotificationService.Services
{
    public class EmailService : IEmailService
    {
        private readonly ILogger<EmailService> _logger;
        private readonly IConfiguration _configuration;

        public EmailService(ILogger<EmailService> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
        }

        public async Task<bool> SendEmailAsync(string to, string subject, string body)
        {
            try
            {
                var smtpHost = _configuration["Email:SmtpHost"];
                var smtpPort = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
                var smtpUsername = _configuration["Email:SmtpUsername"];
                var smtpPassword = _configuration["Email:SmtpPassword"];
                var fromEmail = _configuration["Email:FromEmail"];

                // Eğer SMTP ayarları yapılmamışsa, simüle et
                if (string.IsNullOrEmpty(smtpHost))
                {
                    _logger.LogInformation(
                        "Gönderilecek: {To}, Konu: {Subject}, İçerik: {Body}",
                        to, subject, body);
                    await Task.Delay(100); // Gönderimi simüle et
                    return true;
                }

                using var client = new SmtpClient(smtpHost, smtpPort)
                {
                    Credentials = new NetworkCredential(smtpUsername, smtpPassword),
                    EnableSsl = true
                };

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(fromEmail ?? "atacaneras@gmail.com"),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true
                };

                mailMessage.To.Add(to);

                await Task.Run(() => client.Send(mailMessage));

                _logger.LogInformation("E-posta başarıyla gönderildi: {To}", to);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "E-posta gönderilemedi: {To}. Hata: {Message}", to, ex.Message);
                return false;
            }
        }
    }
}

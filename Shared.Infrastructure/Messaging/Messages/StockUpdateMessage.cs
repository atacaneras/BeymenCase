namespace Shared.Infrastructure.Messaging.Messages
{
    public class StockUpdateMessage
    {
        public Guid OrderId { get; set; }
        public List<StockItem> Items { get; set; } = new();
    }

    public class StockItem
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }
}
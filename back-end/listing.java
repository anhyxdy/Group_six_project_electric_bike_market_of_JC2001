public class Listing {
    private int listingId;
    private double price;
    private String location;
    private String status; 
    private Ebike ebike;
    private User publisher;
    private Admin auditedBy;

    public Listing(int listingId, double price, String location, Ebike ebike, User publisher) {
        this.listingId = listingId;
        this.price = price;
        this.location = location;
        this.status = "pending"; 
        this.ebike = ebike;
        this.publisher = publisher;
        ebike.setListing(this); 
    }

    public void publish() {
        System.out.println("用户[" + publisher.getUsername() + "]发布列表[" + listingId + "]：" + ebike.getModel());
    }

    public void display() {
        System.out.println("列表[" + listingId + "]：" + ebike.getModel() + "，价格：" + price + "，状态：" + status);
    }

    public void setStatus(String status) { this.status = status; }
    public void setAuditedBy(Admin auditedBy) { this.auditedBy = auditedBy; }
    public int getListingId() { return listingId; }
    public String getStatus() { return status; }
}
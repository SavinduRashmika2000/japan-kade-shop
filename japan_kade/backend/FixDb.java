import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class FixDb {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/spare_part?useSSL=false&allowPublicKeyRetrieval=true";
        String user = "root";
        String password = "";

        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {
            stmt.executeUpdate("ALTER TABLE job_cards MODIFY COLUMN status VARCHAR(20)");
            System.out.println("Successfully altered job_cards table.");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

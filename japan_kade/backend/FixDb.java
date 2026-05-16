import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class FixDb {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/spare_part?useSSL=false&allowPublicKeyRetrieval=true";
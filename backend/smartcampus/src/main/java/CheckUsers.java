import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class CheckUsers {
    public static void main(String[] args) {
        try {
            Connection conn = DriverManager.getConnection("jdbc:mysql://127.0.0.1:3306/smartcampusdb", "root", "TDl998924@");
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT id, email, password FROM users");
            while (rs.next()) {
                System.out.println("ID: " + rs.getLong("id") + " | Email: " + rs.getString("email") + " | Password: " + rs.getString("password"));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

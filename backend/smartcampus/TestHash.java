public class TestHash { 
    public static void main(String[] args) { 
        System.out.println("Check Password123: " + org.springframework.security.crypto.bcrypt.BCrypt.checkpw("Password123", "$2a$10$7/O9o.tK/n5I/QvH7h7u2.N7D8A.Q6b0R1C9Z5/M3l4E9p2W6wYmO")); 
        System.out.println("check password123: " + org.springframework.security.crypto.bcrypt.BCrypt.checkpw("password123", "$2a$10$7/O9o.tK/n5I/QvH7h7u2.N7D8A.Q6b0R1C9Z5/M3l4E9p2W6wYmO")); 
    } 
}

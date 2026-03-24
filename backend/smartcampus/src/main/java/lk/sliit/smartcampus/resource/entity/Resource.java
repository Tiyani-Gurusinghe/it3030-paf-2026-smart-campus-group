package lk.sliit.smartcampus.resource.entity;

import jakarta.persistence.*;
import java.time.LocalTime;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;
import lk.sliit.smartcampus.resource.enums.ResourceType;
import lk.sliit.smartcampus.resource.enums.ResourceStatus;

@Entity
@Table(name = "resources")
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Matches 'resource_name' in SQL
    @Column(name = "resource_name", nullable = false, length = 100)
    private String name;

    // Matches 'resource_type' in SQL
    @Enumerated(EnumType.STRING)
    @Column(name = "resource_type", nullable = false)
    private ResourceType type;

    private Integer capacity; 

    @Column(nullable = false, length = 150)
    private String location;

    // Matches 'availability_start' in SQL
    @Column(name = "availability_start")
    private LocalTime availableFrom;

    // Matches 'availability_end' in SQL
    @Column(name = "availability_end")
    private LocalTime availableTo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResourceStatus status = ResourceStatus.ACTIVE;

    // Matches 'created_at' in SQL
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // --- Getters and Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public ResourceType getType() { return type; }
    public void setType(ResourceType type) { this.type = type; }
    
    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
    
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    
    public LocalTime getAvailableFrom() { return availableFrom; }
    public void setAvailableFrom(LocalTime availableFrom) { this.availableFrom = availableFrom; }
    
    public LocalTime getAvailableTo() { return availableTo; }
    public void setAvailableTo(LocalTime availableTo) { this.availableTo = availableTo; }
    
    public ResourceStatus getStatus() { return status; }
    public void setStatus(ResourceStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
package lk.sliit.smartcampus.resource.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalTime;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;
import lk.sliit.smartcampus.resource.enums.ResourceType;
import lk.sliit.smartcampus.resource.enums.ResourceCategory;
import lk.sliit.smartcampus.resource.enums.ResourceStatus;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.HashSet;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lk.sliit.smartcampus.resource.enums.ConfigurationType;
import lk.sliit.smartcampus.resource.enums.FacultyType;

@Entity
@Table(name = "resources")
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Matches 'resource_name' in SQL
    @NotBlank(message = "Name is required")
    @Column(name = "resource_name", nullable = false, length = 100)
    private String name;

    // Matches 'resource_type' in SQL
    @NotNull(message = "Type is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "resource_type", nullable = false)
    private ResourceType type;

    @NotNull(message = "Category is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "resource_category", nullable = false)
    private ResourceCategory category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    @JsonIgnoreProperties({"subResources", "hibernateLazyInitializer", "handler"})
    private Resource parentResource;

    @OneToMany(mappedBy = "parentResource", cascade = CascadeType.ALL)
    @JsonIgnoreProperties("parentResource")
    private List<Resource> subResources = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "config_type")
    private ConfigurationType configType = ConfigurationType.NONE;

    @ElementCollection(targetClass = FacultyType.class, fetch = FetchType.EAGER)
    @CollectionTable(name = "resource_faculties", joinColumns = @JoinColumn(name = "resource_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "faculty")
    private Set<FacultyType> faculties = new HashSet<>();

    @Column(name = "floor")
    private String floor;

    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity; 

    @NotBlank(message = "Location is required")
    @Column(nullable = false, length = 150)
    private String location;

    // Matches 'availability_start' in SQL
    @Column(name = "availability_start")
    private LocalTime availableFrom;

    // Matches 'availability_end' in SQL
    @Column(name = "availability_end")
    private LocalTime availableTo;

    @NotNull(message = "Status is required")
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

    public ResourceCategory getCategory() { return category; }
    public void setCategory(ResourceCategory category) { this.category = category; }

    public Resource getParentResource() { return parentResource; }
    public void setParentResource(Resource parentResource) { this.parentResource = parentResource; }

    public List<Resource> getSubResources() { return subResources; }
    public void setSubResources(List<Resource> subResources) { this.subResources = subResources; }

    public ConfigurationType getConfigType() { return configType; }
    public void setConfigType(ConfigurationType configType) { this.configType = configType; }

    public Set<FacultyType> getFaculties() { return faculties; }
    public void setFaculties(Set<FacultyType> faculties) { this.faculties = faculties; }

    public String getFloor() { return floor; }
    public void setFloor(String floor) { this.floor = floor; }
}
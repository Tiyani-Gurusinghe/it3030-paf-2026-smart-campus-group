package lk.sliit.smartcampus.resource.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import lk.sliit.smartcampus.resource.entity.Resource;
import lk.sliit.smartcampus.resource.enums.ResourceType;

import java.util.List;

import lk.sliit.smartcampus.resource.enums.ResourceCategory;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {
    
    // Custom query to support dynamic filtering for search
    @Query("SELECT r FROM Resource r WHERE " +
           "(:category IS NULL OR r.category = :category) AND " +
           "(:type IS NULL OR r.type = :type) AND " +
           "(:minCapacity IS NULL OR r.capacity >= :minCapacity) AND " +
           "(:location IS NULL OR LOWER(r.location) LIKE LOWER(CONCAT('%', :location, '%')))")
    List<Resource> searchResources(
            @Param("category") ResourceCategory category,
            @Param("type") ResourceType type, 
            @Param("minCapacity") Integer minCapacity, 
            @Param("location") String location);
}

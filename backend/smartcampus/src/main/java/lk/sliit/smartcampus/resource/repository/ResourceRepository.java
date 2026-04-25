package lk.sliit.smartcampus.resource.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import lk.sliit.smartcampus.resource.entity.Resource;
import lk.sliit.smartcampus.resource.enums.ResourceType;

import java.util.List;

import lk.sliit.smartcampus.resource.enums.ResourceCategory;
import lk.sliit.smartcampus.resource.enums.FacultyType;
import lk.sliit.smartcampus.resource.enums.ResourceStatus;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {
    
    // Custom query to support dynamic filtering for search
    @Query("SELECT r FROM Resource r WHERE " +
           "(:category IS NULL OR r.category = :category) AND " +
           "(:type IS NULL OR r.type = :type) AND " +
           "(:faculty IS NULL OR :faculty MEMBER OF r.faculties) AND " +
           "(:floor IS NULL OR r.floor = :floor) AND " +
           "(:minCapacity IS NULL OR r.capacity >= :minCapacity) AND " +
           "(:location IS NULL OR LOWER(r.location) LIKE LOWER(CONCAT('%', :location, '%')))")
    List<Resource> searchResources(
            @Param("category") ResourceCategory category,
            @Param("type") ResourceType type, 
            @Param("faculty") FacultyType faculty,
            @Param("floor") String floor,
            @Param("minCapacity") Integer minCapacity, 
            @Param("location") String location);

    @Query("SELECT DISTINCT f FROM Resource r JOIN r.faculties f WHERE r.parentResource.id = :buildingId")
    List<FacultyType> findDistinctFacultiesByBuildingId(@Param("buildingId") Long buildingId);

    @Query("SELECT DISTINCT r.floor FROM Resource r WHERE :faculty MEMBER OF r.faculties AND r.floor IS NOT NULL")
    List<String> findDistinctFloorsByFaculty(@Param("faculty") FacultyType faculty);

    @Query("SELECT COUNT(r) > 0 FROM Resource r WHERE r.name = :name AND r.category = :category AND r.type = :type AND LOWER(r.location) = LOWER(:location)")
    boolean existsByExactMatch(@Param("name") String name, @Param("category") ResourceCategory category, @Param("type") ResourceType type, @Param("location") String location);

    long countByStatus(ResourceStatus status);
}

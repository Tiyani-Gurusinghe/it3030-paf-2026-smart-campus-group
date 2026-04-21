package lk.sliit.smartcampus.resource.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lk.sliit.smartcampus.resource.entity.Resource;
import lk.sliit.smartcampus.resource.enums.ResourceType;
import lk.sliit.smartcampus.resource.enums.ResourceCategory;
import lk.sliit.smartcampus.resource.enums.FacultyType;
import lk.sliit.smartcampus.resource.repository.ResourceRepository;
import lk.sliit.smartcampus.exception.ResourceNotFoundException;
//import lk.sliit.smartcampus.resource.enums.ResourceStatus;

import java.util.List;

@Service
public class ResourceService {

    @Autowired
    private ResourceRepository resourceRepository;

    public Resource createResource(Resource resource) {
        if (resourceRepository.existsByExactMatch(resource.getName(), resource.getCategory(), resource.getType(), resource.getLocation())) {
            throw new lk.sliit.smartcampus.exception.BadRequestException("Cannot add: Resource already exists with this exact Name, Category, Type, and Location.");
        }

        if (resource.getParentResource() != null && resource.getParentResource().getId() != null) {
            Resource parent = getResourceById(resource.getParentResource().getId());
            resource.setParentResource(parent);
        } else {
            resource.setParentResource(null);
        }
        return resourceRepository.save(resource);
    }

    public List<Resource> getFilteredResources(String categoryStr, String typeStr, String facultyStr, String floorStr, Integer capacity, String location) {
        ResourceCategory category = null;
        if (categoryStr != null && !categoryStr.trim().isEmpty()) {
            category = ResourceCategory.valueOf(categoryStr);
        }
        
        ResourceType type = null;
        if (typeStr != null && !typeStr.trim().isEmpty()) {
            type = ResourceType.valueOf(typeStr);
        }

        FacultyType faculty = null;
        if (facultyStr != null && !facultyStr.trim().isEmpty()) {
            faculty = FacultyType.valueOf(facultyStr);
        }
        
        return resourceRepository.searchResources(category, type, faculty, floorStr, capacity, location);
    }

    public List<FacultyType> getFacultiesByBuilding(Long buildingId) {
        return resourceRepository.findDistinctFacultiesByBuildingId(buildingId);
    }

    public List<String> getFloorsByFaculty(String facultyStr) {
        FacultyType faculty = FacultyType.valueOf(facultyStr.trim().toUpperCase());
        return resourceRepository.findDistinctFloorsByFaculty(faculty);
    }


    public Resource getResourceById(Long id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id)); 
    }

    public Resource updateResource(Long id, Resource resourceDetails) {
        Resource existingResource = getResourceById(id);
        
        existingResource.setName(resourceDetails.getName());
        existingResource.setCategory(resourceDetails.getCategory());
        existingResource.setType(resourceDetails.getType());
        existingResource.setConfigType(resourceDetails.getConfigType());
        existingResource.setFaculties(resourceDetails.getFaculties());
        existingResource.setFloor(resourceDetails.getFloor());
        existingResource.setCapacity(resourceDetails.getCapacity());
        existingResource.setLocation(resourceDetails.getLocation());
        existingResource.setAvailableFrom(resourceDetails.getAvailableFrom());
        existingResource.setAvailableTo(resourceDetails.getAvailableTo());
        existingResource.setStatus(resourceDetails.getStatus());

        if (resourceDetails.getParentResource() != null && resourceDetails.getParentResource().getId() != null) {
            // Prevent circular dependency where resource is its own parent
            if (resourceDetails.getParentResource().getId().equals(id)) {
                throw new lk.sliit.smartcampus.exception.BadRequestException("Resource cannot be its own parent.");
            }

            Resource parent = getResourceById(resourceDetails.getParentResource().getId());
            existingResource.setParentResource(parent);
        } else {
            existingResource.setParentResource(null);
        }

        return resourceRepository.save(existingResource);
    }

    public void deleteResource(Long id) {
        Resource existingResource = getResourceById(id);
        resourceRepository.delete(existingResource);
    }
}

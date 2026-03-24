package lk.sliit.smartcampus.resource.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lk.sliit.smartcampus.resource.entity.Resource;
import lk.sliit.smartcampus.resource.enums.ResourceType;
import lk.sliit.smartcampus.resource.repository.ResourceRepository;
//import lk.sliit.smartcampus.resource.enums.ResourceStatus;

import java.util.List;

@Service
public class ResourceService {

    @Autowired
    private ResourceRepository resourceRepository;

    public Resource createResource(Resource resource) {
        return resourceRepository.save(resource);
    }

    public List<Resource> getFilteredResources(ResourceType type, Integer capacity, String location) {
        return resourceRepository.searchResources(type, capacity, location);
    }

    public Resource getResourceById(Long id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found with id: " + id)); 
                // Note: Replace RuntimeException with the ResourceNotFoundException we discussed earlier!
    }

    public Resource updateResource(Long id, Resource resourceDetails) {
        Resource existingResource = getResourceById(id);
        
        existingResource.setName(resourceDetails.getName());
        existingResource.setType(resourceDetails.getType());
        existingResource.setCapacity(resourceDetails.getCapacity());
        existingResource.setLocation(resourceDetails.getLocation());
        existingResource.setAvailableFrom(resourceDetails.getAvailableFrom());
        existingResource.setAvailableTo(resourceDetails.getAvailableTo());
        existingResource.setStatus(resourceDetails.getStatus());

        return resourceRepository.save(existingResource);
    }

    public void deleteResource(Long id) {
        Resource existingResource = getResourceById(id);
        resourceRepository.delete(existingResource);
    }
}

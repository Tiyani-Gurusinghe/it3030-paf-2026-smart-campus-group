package lk.sliit.smartcampus.resource.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lk.sliit.smartcampus.booking.repository.BookingRepository;
import lk.sliit.smartcampus.notification.repository.NotificationRepository;
import lk.sliit.smartcampus.resource.entity.Resource;
import lk.sliit.smartcampus.resource.enums.ResourceType;
import lk.sliit.smartcampus.resource.enums.ResourceCategory;
import lk.sliit.smartcampus.resource.enums.FacultyType;
import lk.sliit.smartcampus.resource.enums.ResourceStatus;
import lk.sliit.smartcampus.resource.repository.ResourceRepository;
import lk.sliit.smartcampus.exception.ResourceNotFoundException;
import lk.sliit.smartcampus.ticket.entity.Ticket;
import lk.sliit.smartcampus.ticket.entity.TicketStatus;
import lk.sliit.smartcampus.ticket.repository.TicketHistoryRepository;
import lk.sliit.smartcampus.ticket.repository.TicketRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class ResourceService {

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private TicketHistoryRepository ticketHistoryRepository;

    @Autowired
    private NotificationRepository notificationRepository;

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
        
        List<Resource> resources = resourceRepository.searchResources(category, type, faculty, floorStr, capacity, location);
        attachHealthScores(resources);
        return resources;
    }

    public List<FacultyType> getFacultiesByBuilding(Long buildingId) {
        return resourceRepository.findDistinctFacultiesByBuildingId(buildingId);
    }

    public List<String> getFloorsByFaculty(String facultyStr) {
        FacultyType faculty = FacultyType.valueOf(facultyStr.trim().toUpperCase());
        return resourceRepository.findDistinctFloorsByFaculty(faculty);
    }


    public Resource getResourceById(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
        attachHealthScore(resource);
        return resource;
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

    @Transactional
    public void deleteResource(Long id) {
        Resource existingResource = getResourceById(id);

        List<Long> ticketIds = ticketRepository.findByResourceId(id).stream()
                .map(Ticket::getId)
                .toList();

        if (!ticketIds.isEmpty()) {
            notificationRepository.deleteByTicketIdIn(ticketIds);
            ticketHistoryRepository.deleteByTicketIdIn(ticketIds);
            ticketRepository.deleteByResourceId(id);
        }

        bookingRepository.deleteByResourceId(id);
        resourceRepository.detachChildren(id);
        resourceRepository.delete(existingResource);
    }

    private void attachHealthScores(List<Resource> resources) {
        resources.forEach(this::attachHealthScore);
    }

    private void attachHealthScore(Resource resource) {
        if (resource == null || resource.getId() == null) {
            return;
        }

        LocalDateTime since = LocalDateTime.now().minusDays(30);
        List<TicketStatus> unresolvedStatuses = Arrays.asList(TicketStatus.OPEN, TicketStatus.IN_PROGRESS);

        long totalTickets = ticketRepository.countByResourceId(resource.getId());
        long openTickets = ticketRepository.countByResourceIdAndStatusIn(resource.getId(), unresolvedStatuses);
        long recentTickets = ticketRepository.countByResourceIdAndCreatedAtAfter(resource.getId(), since);
        long recentMaintenance = ticketRepository.countByResourceIdAndResolvedAtAfter(resource.getId(), since);
        long recentBookings = bookingRepository.countRecentBookingsForResource(resource.getId(), since);

        int risk = 0;
        if (resource.getStatus() != ResourceStatus.ACTIVE) {
            risk += 45;
        }
        risk += Math.min((int) openTickets * 14, 42);
        risk += Math.min((int) totalTickets * 5, 20);
        risk += Math.min((int) recentTickets * 10, 30);
        risk += Math.min((int) recentMaintenance * 6, 18);
        risk += Math.min((int) recentBookings * 2, 16);

        int score = Math.max(0, 100 - risk);
        String label = score >= 80 ? "Excellent" : score >= 55 ? "Needs Attention" : "High Risk";
        String reason = buildHealthReason(resource, openTickets, recentTickets, recentMaintenance, recentBookings);

        resource.setHealthScore(score);
        resource.setHealthLabel(label);
        resource.setHealthReason(reason);
        resource.setHealthTotalTickets(totalTickets);
        resource.setHealthOpenTickets(openTickets);
        resource.setHealthRecentTickets(recentTickets);
        resource.setHealthRecentMaintenance(recentMaintenance);
        resource.setHealthRecentBookings(recentBookings);
    }

    private String buildHealthReason(Resource resource, long openTickets, long recentTickets, long recentMaintenance, long recentBookings) {
        List<String> reasons = new ArrayList<>();

        if (resource.getStatus() != ResourceStatus.ACTIVE) {
            reasons.add("inactive resource");
        }
        if (openTickets > 0) {
            reasons.add(openTickets + " unresolved ticket(s)");
        }
        if (recentTickets > 0) {
            reasons.add(recentTickets + " new ticket(s) in 30 days");
        }
        if (recentMaintenance > 0) {
            reasons.add(recentMaintenance + " recent maintenance fix(es)");
        }
        if (recentBookings >= 8) {
            reasons.add("heavy booking usage");
        }

        return reasons.isEmpty() ? "No recent issues detected" : String.join(", ", reasons);
    }
}

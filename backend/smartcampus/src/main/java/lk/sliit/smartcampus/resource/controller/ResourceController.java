package lk.sliit.smartcampus.resource.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import lk.sliit.smartcampus.resource.entity.Resource;
import lk.sliit.smartcampus.resource.enums.ResourceType;
import lk.sliit.smartcampus.resource.enums.ResourceCategory;
import lk.sliit.smartcampus.resource.enums.FacultyType;
import lk.sliit.smartcampus.resource.service.ResourceService;

import java.util.List;

@RestController
@RequestMapping("/api/resources") // Standard RESTful naming
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}) // Allow your React frontend to connect
public class ResourceController {

    @Autowired
    private ResourceService resourceService;

    // 1. POST: Create a new resource (Returns 201 Created)
    @PostMapping
    public ResponseEntity<Resource> createResource(@Valid @RequestBody Resource resource) {
        Resource savedResource = resourceService.createResource(resource);
        return new ResponseEntity<>(savedResource, HttpStatus.CREATED);
    }

    // 2. GET: Retrieve all resources, with optional filtering (Returns 200 OK)
    @GetMapping
    public ResponseEntity<List<Resource>> getAllResources(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String faculty,
            @RequestParam(required = false) String floor,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) String location) {
        List<Resource> resources = resourceService.getFilteredResources(category, type, faculty, floor, minCapacity, location);
        return ResponseEntity.ok(resources);
    }

    // GET faculties in a building
    @GetMapping("/building/{buildingId}/faculties")
    public ResponseEntity<List<FacultyType>> getFacultiesByBuilding(@PathVariable Long buildingId) {
        return ResponseEntity.ok(resourceService.getFacultiesByBuilding(buildingId));
    }

    // GET floors of a faculty
    @GetMapping("/faculty/{faculty}/floors")
    public ResponseEntity<List<String>> getFloorsByFaculty(@PathVariable String faculty) {
        return ResponseEntity.ok(resourceService.getFloorsByFaculty(faculty));
    }

    // GET by ID (Returns 200 OK)
    @GetMapping("/{id}")
    public ResponseEntity<Resource> getResourceById(@PathVariable Long id) {
        Resource resource = resourceService.getResourceById(id);
        return ResponseEntity.ok(resource);
    }

    // 3. PUT: Update an existing resource (Returns 200 OK)
    @PutMapping("/{id}")
    public ResponseEntity<Resource> updateResource(@PathVariable Long id, @Valid @RequestBody Resource resourceDetails) {
        Resource updatedResource = resourceService.updateResource(id, resourceDetails);
        return ResponseEntity.ok(updatedResource);
    }

    // 4. DELETE: Remove a resource (Returns 204 No Content)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }
}


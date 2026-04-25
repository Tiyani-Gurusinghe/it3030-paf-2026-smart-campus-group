package lk.sliit.smartcampus.admin.controller;

import lk.sliit.smartcampus.admin.dto.AdminDashboardSummaryDto;
import lk.sliit.smartcampus.admin.service.AdminDashboardService;
import lk.sliit.smartcampus.common.dto.ApiSuccessResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    public AdminDashboardController(AdminDashboardService adminDashboardService) {
        this.adminDashboardService = adminDashboardService;
    }

    @GetMapping
    public ResponseEntity<ApiSuccessResponse<AdminDashboardSummaryDto>> getDashboardSummary() {
        return ResponseEntity.ok(
                ApiSuccessResponse.success(adminDashboardService.getSummary(), "Admin dashboard summary fetched successfully")
        );
    }
}

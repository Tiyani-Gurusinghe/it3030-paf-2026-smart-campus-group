package lk.sliit.smartcampus.booking.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lk.sliit.smartcampus.booking.dto.BookingRequestDto;
import lk.sliit.smartcampus.booking.dto.BookingResponseDto;
import lk.sliit.smartcampus.booking.enums.BookingStatus;
import lk.sliit.smartcampus.booking.service.BookingService;
import lk.sliit.smartcampus.common.dto.ApiSuccessResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@Tag(name = "Booking Management", description = "Endpoints for managing resource bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    @Operation(summary = "Create a new booking")
    public ResponseEntity<ApiSuccessResponse<BookingResponseDto>> createBooking(@Valid @RequestBody BookingRequestDto requestDto) {
        BookingResponseDto createdBooking = bookingService.createBooking(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiSuccessResponse.success(createdBooking, "Booking created successfully"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get booking by ID")
    public ResponseEntity<ApiSuccessResponse<BookingResponseDto>> getBookingById(@PathVariable Long id) {
        BookingResponseDto booking = bookingService.getBookingById(id);
        return ResponseEntity.ok(ApiSuccessResponse.success(booking, "Booking fetched successfully"));
    }

    @GetMapping
    @Operation(summary = "Get all bookings")
    public ResponseEntity<ApiSuccessResponse<List<BookingResponseDto>>> getAllBookings() {
        List<BookingResponseDto> bookings = bookingService.getAllBookings();
        return ResponseEntity.ok(ApiSuccessResponse.success(bookings, "All bookings fetched successfully"));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get bookings by User ID")
    public ResponseEntity<ApiSuccessResponse<List<BookingResponseDto>>> getBookingsByUserId(@PathVariable Long userId) {
        List<BookingResponseDto> bookings = bookingService.getBookingsByUserId(userId);
        return ResponseEntity.ok(ApiSuccessResponse.success(bookings, "User bookings fetched successfully"));
    }

    @GetMapping("/resource/{resourceId}")
    @Operation(summary = "Get bookings by Resource ID")
    public ResponseEntity<ApiSuccessResponse<List<BookingResponseDto>>> getBookingsByResourceId(@PathVariable Long resourceId) {
        List<BookingResponseDto> bookings = bookingService.getBookingsByResourceId(resourceId);
        return ResponseEntity.ok(ApiSuccessResponse.success(bookings, "Resource bookings fetched successfully"));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update booking status")
    public ResponseEntity<ApiSuccessResponse<BookingResponseDto>> updateBookingStatus(
            @PathVariable Long id, 
            @RequestParam BookingStatus status) {
        BookingResponseDto updatedBooking = bookingService.updateBookingStatus(id, status);
        return ResponseEntity.ok(ApiSuccessResponse.success(updatedBooking, "Booking status updated successfully"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a booking")
    public ResponseEntity<ApiSuccessResponse<Void>> deleteBooking(@PathVariable Long id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.ok(ApiSuccessResponse.success(null, "Booking deleted successfully"));
    }
}

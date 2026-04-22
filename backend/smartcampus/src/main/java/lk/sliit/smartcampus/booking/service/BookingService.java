package lk.sliit.smartcampus.booking.service;

import lk.sliit.smartcampus.booking.dto.BookingRequestDto;
import lk.sliit.smartcampus.booking.dto.BookingResponseDto;
import lk.sliit.smartcampus.booking.enums.BookingStatus;

import java.util.List;

public interface BookingService {
    
    BookingResponseDto createBooking(BookingRequestDto requestDto);
    
    BookingResponseDto getBookingById(Long id);
    
    List<BookingResponseDto> getAllBookings();
    
    List<BookingResponseDto> getBookingsByUserId(Long userId);
    
    List<BookingResponseDto> getBookingsByResourceId(Long resourceId);
    
    BookingResponseDto updateBookingStatus(Long id, BookingStatus status);
    
    void deleteBooking(Long id);
}

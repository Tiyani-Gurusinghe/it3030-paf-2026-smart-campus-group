package lk.sliit.smartcampus.resource.enums;

public enum ResourceType {
    // Buildings
    ACADEMIC, LIBRARY, ADMINISTRATIVE, HOSTEL, CAFETERIA,
    // Spaces
    LECTURE_HALL, LAB, MEETING_ROOM, CLASSROOM, STUDY_AREA, READING_AREA, CORRIDOR, OFFICE,
    // Equipment (Isolated via strict mapping constraints)
    EQUIPMENT,
    PC, SMART_BOARD, TABLE, CHAIR, PROJECTOR, CAMERA, WHITE_BOARD, SCREEN,
    // Utilities
    ELECTRICITY, INTERNET, WATER, SECURITY;
}

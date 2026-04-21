package lk.sliit.smartcampus.resource.enums;

public enum ConfigurationType {
    FIXED,      // Assets attached are locked. Cannot request more from Inventory.
    FLEXIBLE,   // Space has base assets, but allows user to dynamically request from Inventory.
    NONE        // Meaningless for standalone inventory items or plain buildings.
}

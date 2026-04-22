package lk.sliit.smartcampus.common.dto;

public class ApiSuccessResponse<T> {
    private boolean success;
    private String message;
    private T data;

    public ApiSuccessResponse(boolean success, String message, T data) {
        this.success = success;
        this.message = message;
        this.data = data;
    }

    public static <T> ApiSuccessResponse<T> success(T data, String message) {
        return new ApiSuccessResponse<>(true, message, data);
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }
}

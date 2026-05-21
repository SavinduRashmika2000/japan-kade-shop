package com.autocare.backend.exception;

public class StockLockException extends RuntimeException {
    public StockLockException(String message) {
        super(message);
    }
    public StockLockException(String message, Throwable cause) {
        super(message, cause);
    }
}

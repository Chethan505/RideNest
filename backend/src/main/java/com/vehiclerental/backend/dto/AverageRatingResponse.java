package com.vehiclerental.backend.dto;

public class AverageRatingResponse {

    private double averageRating;
    private long totalReviews;

    public AverageRatingResponse() {
    }

    public AverageRatingResponse(double averageRating, long totalReviews) {
        this.averageRating = averageRating;
        this.totalReviews = totalReviews;
    }

    public double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(double averageRating) {
        this.averageRating = averageRating;
    }

    public long getTotalReviews() {
        return totalReviews;
    }

    public void setTotalReviews(long totalReviews) {
        this.totalReviews = totalReviews;
    }
}
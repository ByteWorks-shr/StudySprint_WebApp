package com.omnistudy.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "study_tasks")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudyTask {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String subject;
    private String topic;
    private String dueDate;
    private String priority; // low, medium, high
    private String status;   // pending, in_progress, completed
    private Integer estimatedMinutes;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime completedAt;
}

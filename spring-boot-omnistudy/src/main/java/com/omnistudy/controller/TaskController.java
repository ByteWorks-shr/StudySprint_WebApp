package com.omnistudy.controller;

import com.omnistudy.model.StudyTask;
import com.omnistudy.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
public class TaskController {

    @Autowired
    private TaskRepository taskRepository;

    @GetMapping
    public List<StudyTask> getAllTasks() {
        return taskRepository.findAll();
    }

    @PostMapping
    public StudyTask createTask(@RequestBody StudyTask task) {
        return taskRepository.save(task);
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudyTask> updateTask(@PathVariable Long id, @RequestBody StudyTask taskDetails) {
        return taskRepository.findById(id).map(task -> {
            task.setTitle(taskDetails.getTitle());
            task.setSubject(taskDetails.getSubject());
            task.setTopic(taskDetails.getTopic());
            task.setDueDate(taskDetails.getDueDate());
            task.setPriority(taskDetails.getPriority());
            task.setStatus(taskDetails.getStatus());
            task.setEstimatedMinutes(taskDetails.getEstimatedMinutes());
            return ResponseEntity.ok(taskRepository.save(task));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        if (taskRepository.existsById(id)) {
            taskRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}

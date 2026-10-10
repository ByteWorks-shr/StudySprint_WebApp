package com.omnistudy.repository;

import com.omnistudy.model.StudyTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskRepository extends JpaRepository<StudyTask, Long> {
}

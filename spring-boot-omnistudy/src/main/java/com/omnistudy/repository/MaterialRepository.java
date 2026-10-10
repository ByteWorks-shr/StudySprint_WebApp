package com.omnistudy.repository;

import com.omnistudy.model.StudyMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MaterialRepository extends JpaRepository<StudyMaterial, Long> {
}

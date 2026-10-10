package com.omnistudy.controller;

import com.omnistudy.model.StudyMaterial;
import com.omnistudy.repository.MaterialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/materials")
@CrossOrigin(origins = "*")
public class MaterialController {

    @Autowired
    private MaterialRepository materialRepository;

    @GetMapping
    public List<StudyMaterial> getAllMaterials() {
        return materialRepository.findAll();
    }

    @PostMapping
    public StudyMaterial createMaterial(@RequestBody StudyMaterial material) {
        material.setCreatedAt(LocalDateTime.now());
        material.setUpdatedAt(LocalDateTime.now());
        return materialRepository.save(material);
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudyMaterial> updateMaterial(@PathVariable Long id, @RequestBody StudyMaterial details) {
        return materialRepository.findById(id).map(material -> {
            material.setTitle(details.getTitle());
            material.setSubject(details.getSubject());
            material.setTopic(details.getTopic());
            material.setContent(details.getContent());
            material.setTags(details.getTags());
            material.setUpdatedAt(LocalDateTime.now());
            return ResponseEntity.ok(materialRepository.save(material));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMaterial(@PathVariable Long id) {
        if (materialRepository.existsById(id)) {
            materialRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}

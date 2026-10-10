package com.omnistudy.controller;

import com.omnistudy.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/gemini")
@CrossOrigin(origins = "*")
public class GeminiController {

    @Autowired
    private GeminiService geminiService;

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, Object> payload) {
        @SuppressWarnings("unchecked")
        List<Map<String, String>> messages = (List<Map<String, String>>) payload.get("messages");
        String systemInstruction = (String) payload.get("systemInstruction");
        String model = (String) payload.get("model");

        String reply = geminiService.chat(messages, systemInstruction, model);
        return ResponseEntity.ok(Map.of("reply", reply));
    }

    @PostMapping("/transcribe")
    public ResponseEntity<Map<String, String>> transcribe(@RequestBody Map<String, String> payload) {
        String base64Audio = payload.get("audioBase64");
        String mimeType = payload.get("mimeType");

        String transcript = geminiService.transcribe(base64Audio, mimeType);
        return ResponseEntity.ok(Map.of("transcript", transcript));
    }

    @PostMapping("/study-plan")
    public ResponseEntity<String> studyPlan(@RequestBody Map<String, Object> payload) {
        String subjects = String.valueOf(payload.get("subjects"));
        String topics = String.valueOf(payload.get("topics"));
        String examDate = String.valueOf(payload.get("examDate"));
        Double dailyHours = Double.valueOf(String.valueOf(payload.getOrDefault("dailyHours", 3.0)));

        String jsonPlan = geminiService.generateStudyPlan(subjects, topics, examDate, dailyHours);
        return ResponseEntity.ok(jsonPlan);
    }
}

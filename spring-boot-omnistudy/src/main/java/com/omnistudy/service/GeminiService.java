package com.omnistudy.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models}")
    private String baseUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Multi-turn chat using Gemini API
     */
    public String chat(List<Map<String, String>> messages, String systemInstruction, String model) {
        try {
            String selectedModel = (model != null && !model.isBlank()) ? model : "gemini-3.5-flash";
            String endpoint = String.format("%s/%s:generateContent?key=%s", baseUrl, selectedModel, apiKey);

            Map<String, Object> requestBody = new HashMap<>();

            // Format contents
            List<Map<String, Object>> contents = new ArrayList<>();
            for (Map<String, String> msg : messages) {
                Map<String, Object> contentMap = new HashMap<>();
                String role = "user".equalsIgnoreCase(msg.get("role")) ? "user" : "model";
                contentMap.put("role", role);
                contentMap.put("parts", List.of(Map.of("text", msg.getOrDefault("content", ""))));
                contents.add(contentMap);
            }
            requestBody.put("contents", contents);

            if (systemInstruction != null && !systemInstruction.isBlank()) {
                requestBody.put("systemInstruction", Map.of(
                    "parts", List.of(Map.of("text", systemInstruction))
                ));
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("User-Agent", "aistudio-build");

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(endpoint, entity, String.class);

            JsonNode root = objectMapper.readTree(response.getBody());
            return root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
        } catch (Exception e) {
            e.printStackTrace();
            return "Error calling Gemini: " + e.getMessage();
        }
    }

    /**
     * Transcribe spoken audio using gemini-3.5-transcribe
     */
    public String transcribe(String base64Audio, String mimeType) {
        try {
            String endpoint = String.format("%s/gemini-3.5-transcribe:generateContent?key=%s", baseUrl, apiKey);

            String cleanBase64 = base64Audio.replaceFirst("^data:audio/\\w+;base64,", "");
            String resolvedMime = (mimeType != null && !mimeType.isBlank()) ? mimeType : "audio/webm";

            Map<String, Object> inlineData = Map.of(
                "mimeType", resolvedMime,
                "data", cleanBase64
            );

            Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                    Map.of("parts", List.of(
                        Map.of("inlineData", inlineData),
                        Map.of("text", "Transcribe the audio accurately into clear text.")
                    ))
                )
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("User-Agent", "aistudio-build");

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(endpoint, entity, String.class);

            JsonNode root = objectMapper.readTree(response.getBody());
            return root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
        } catch (Exception e) {
            e.printStackTrace();
            return "Transcription failed: " + e.getMessage();
        }
    }

    /**
     * Formulate smart study plan using Gemini
     */
    public String generateStudyPlan(String subjects, String topics, String examDate, Double dailyHours) {
        try {
            String endpoint = String.format("%s/gemini-3.5-flash:generateContent?key=%s", baseUrl, apiKey);

            String prompt = String.format(
                "Create a structured JSON study plan for a student. Subjects: %s. Topics: %s. Exam Date: %s. Daily Study Hours: %s. " +
                "Return JSON with title, summary, strategyTips, and day-by-day sessions array.",
                subjects, topics, examDate, dailyHours
            );

            Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                    Map.of("parts", List.of(Map.of("text", prompt)))
                ),
                "generationConfig", Map.of("responseMimeType", "application/json")
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("User-Agent", "aistudio-build");

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(endpoint, entity, String.class);

            JsonNode root = objectMapper.readTree(response.getBody());
            return root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
        } catch (Exception e) {
            e.printStackTrace();
            return "{\"error\": \"" + e.getMessage() + "\"}";
        }
    }
}

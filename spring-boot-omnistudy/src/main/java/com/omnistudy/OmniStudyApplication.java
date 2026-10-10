package com.omnistudy;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class OmniStudyApplication {
    public static void main(String[] args) {
        SpringApplication.run(OmniStudyApplication.class, args);
        System.out.println("OmniStudy Spring Boot Server started at http://localhost:8080");
    }
}

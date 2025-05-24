package com.example.QLThuocTay;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.example.QLThuocTay.Repository")
public class QlThuocTayApplication {
    public static void main(String[] args) {
        SpringApplication.run(QlThuocTayApplication.class, args);
    }
}
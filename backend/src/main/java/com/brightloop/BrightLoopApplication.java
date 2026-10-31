package com.brightloop;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BrightLoopApplication {

    public static void main(String[] args) {
        SpringApplication.run(BrightLoopApplication.class, args);
    }
}

package com.rookout.tutorial;

import com.bugsnag.Bugsnag;
import com.bugsnag.BugsnagSpringConfiguration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;

@Configuration
@Import(BugsnagSpringConfiguration.class)
public class BugsnagConfig {
    @Bean
    public Bugsnag bugsnag() {
        String bugsnagApiKey = System.getenv("BUGSNAG_API_KEY");
        if (bugsnagApiKey.equals("")) {
            return null;
        }
        return new Bugsnag(bugsnagApiKey);
    }
}
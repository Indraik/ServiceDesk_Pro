package com.servicedesk.servicedesk_backend.configure;

import com.servicedesk.servicedesk_backend.entity.Role;
import com.servicedesk.servicedesk_backend.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {
    @Bean
    CommandLineRunner initializeRoles(RoleRepository roleRepository){
        return args -> {

            if (roleRepository.findByName("CUSTOMER").isEmpty()) {
                roleRepository.save(new Role("CUSTOMER"));
            }

            if (roleRepository.findByName("AGENT").isEmpty()) {
                roleRepository.save(new Role("AGENT"));
            }

            if (roleRepository.findByName("ADMIN").isEmpty()) {
                roleRepository.save(new Role("ADMIN"));
            }
        };
    }
}

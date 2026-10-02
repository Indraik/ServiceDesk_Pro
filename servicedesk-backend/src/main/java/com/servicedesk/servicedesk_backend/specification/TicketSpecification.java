package com.servicedesk.servicedesk_backend.specification;

import com.servicedesk.servicedesk_backend.entity.Category;
import com.servicedesk.servicedesk_backend.entity.Priority;
import com.servicedesk.servicedesk_backend.entity.Ticket;
import com.servicedesk.servicedesk_backend.entity.TicketStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class TicketSpecification {

    public static Specification<Ticket> filterTickets(
            String email,
            String search,
            TicketStatus status,
            Priority priority,
            Category category) {

        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            //Logged-in user's tickets....
            predicates.add(
                    criteriaBuilder.equal(
                            root.get("createdBy").get("email"),
                            email
                    )
            );

            //Status filters...
            if(status != null){
                predicates.add(
                        criteriaBuilder.equal(
                                root.get("status"),
                                status
                        )
                );
            }

            // Priority filter...
            if(priority != null){
                predicates.add(
                        criteriaBuilder.equal(
                                root.get("priority"),
                                priority
                        )
                );
            }

            if (category != null) {
                predicates.add(
                        criteriaBuilder.equal(
                                root.get("category"),
                                category
                        )
                );
            }

            // Search filter...
            if(search != null && !search.isBlank()){
                String keyword = "%" + search.toLowerCase() + "%";

                Predicate titlePredicate =
                        criteriaBuilder.like(
                                criteriaBuilder.lower(
                                        root.get("title")
                                ),
                                keyword
                        );

                Predicate descriptionPredicate =
                        criteriaBuilder.like(
                                criteriaBuilder.lower(
                                        root.get("description")
                                ),
                                keyword
                        );
                predicates.add(
                        criteriaBuilder.or(
                                titlePredicate,
                                descriptionPredicate
                        )
                );
            }
            return criteriaBuilder.and(
                    predicates.toArray(new Predicate[0])
            );
        };
    }
    public static Specification<Ticket> assignedToAgent(
            String email) {

        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(
                        root.get("assignedTo").get("email"),
                        email
                );
    }

    public static Specification<Ticket> filterAgentTickets(
            String email,
            String search,
            TicketStatus status,
            Priority priority,
            Category category) {

        return (root, query, criteriaBuilder) -> {

            List<Predicate> predicates = new ArrayList<>();

            // Assigned agent
            predicates.add(
                    criteriaBuilder.equal(
                            root.get("assignedTo").get("email"),
                            email
                    )
            );

            // Status
            if (status != null) {
                predicates.add(
                        criteriaBuilder.equal(
                                root.get("status"),
                                status
                        )
                );
            }

            // Priority
            if (priority != null) {
                predicates.add(
                        criteriaBuilder.equal(
                                root.get("priority"),
                                priority
                        )
                );
            }

            if (category != null) {
                predicates.add(
                        criteriaBuilder.equal(
                                root.get("category"),
                                category
                        )
                );
            }

            // Search
            if (search != null && !search.isBlank()) {

                String keyword = "%" + search.toLowerCase() + "%";

                Predicate titlePredicate =
                        criteriaBuilder.like(
                                criteriaBuilder.lower(
                                        root.get("title")
                                ),
                                keyword
                        );

                Predicate descriptionPredicate =
                        criteriaBuilder.like(
                                criteriaBuilder.lower(
                                        root.get("description")
                                ),
                                keyword
                        );

                predicates.add(
                        criteriaBuilder.or(
                                titlePredicate,
                                descriptionPredicate
                        )
                );
            }

            return criteriaBuilder.and(
                    predicates.toArray(new Predicate[0])
            );
        };
    }

    public static Specification<Ticket> filterAdminTickets(
            String search,
            TicketStatus status,
            Priority priority,
            Category category) {

        return (root, query, criteriaBuilder) -> {

            List<Predicate> predicates = new ArrayList<>();

            // Status
            if (status != null) {
                predicates.add(
                        criteriaBuilder.equal(
                                root.get("status"),
                                status
                        )
                );
            }

            // Priority
            if (priority != null) {
                predicates.add(
                        criteriaBuilder.equal(
                                root.get("priority"),
                                priority
                        )
                );
            }

            if (category != null) {
                predicates.add(
                        criteriaBuilder.equal(
                                root.get("category"),
                                category
                        )
                );
            }
            
            // Search
            if (search != null && !search.isBlank()) {

                String keyword = "%" + search.toLowerCase() + "%";

                Predicate titlePredicate =
                        criteriaBuilder.like(
                                criteriaBuilder.lower(
                                        root.get("title")
                                ),
                                keyword
                        );

                Predicate descriptionPredicate =
                        criteriaBuilder.like(
                                criteriaBuilder.lower(
                                        root.get("description")
                                ),
                                keyword
                        );

                predicates.add(
                        criteriaBuilder.or(
                                titlePredicate,
                                descriptionPredicate
                        )
                );
            }

            return criteriaBuilder.and(
                    predicates.toArray(new Predicate[0])
            );
        };
    }

    public static Specification<Ticket> ticketAccessibleBy(
            String email,
            String role) {

        return (root, query, criteriaBuilder) -> {

            if ("ADMIN".equals(role)) {
                return criteriaBuilder.conjunction();
            }

            if ("AGENT".equals(role)) {
                return criteriaBuilder.equal(
                        root.get("assignedTo").get("email"),
                        email
                );
            }

            return criteriaBuilder.equal(
                    root.get("createdBy").get("email"),
                    email
            );
        };
    }
}

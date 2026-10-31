package com.brightloop.repository;

import com.brightloop.entity.QuotationTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuotationTemplateRepository extends JpaRepository<QuotationTemplate, Long> {
}

package com.brightloop.repository;

import com.brightloop.entity.QuotationTemplateLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuotationTemplateLineRepository extends JpaRepository<QuotationTemplateLine, Long> {
    List<QuotationTemplateLine> findByTemplateId(Long templateId);
}

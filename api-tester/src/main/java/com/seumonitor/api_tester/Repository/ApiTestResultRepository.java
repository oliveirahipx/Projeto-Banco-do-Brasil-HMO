package com.seumonitor.api_tester.Repository;

import com.seumonitor.api_tester.Model.ApiTestResult;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApiTestResultRepository extends JpaRepository<ApiTestResult, Long> {

}
package com.autocare.backend.controller;

import com.autocare.backend.dto.DashboardStatsDTO;
import com.autocare.backend.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
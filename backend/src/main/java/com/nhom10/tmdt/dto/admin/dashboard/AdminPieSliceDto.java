package com.nhom10.tmdt.dto.admin.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminPieSliceDto {
    private String key;       
    private String label;     
    private long count;       
    private double amount;    
    private double percentage; 
    private String color;     
}


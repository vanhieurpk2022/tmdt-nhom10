package com.nhom10.tmdt.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminFragranceNotesDto {
    private List<String> topNotes;
    private List<String> heartNotes;
    private List<String> baseNotes;
}


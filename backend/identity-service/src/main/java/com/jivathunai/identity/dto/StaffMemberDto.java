package com.jivathunai.identity.dto;

import com.jivathunai.common.enums.SystemRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffMemberDto {
    private Long id;
    private String name;
    private String email;
    private SystemRole role;
    private String status; // ACTIVE, INVITED
    private String specialty;
    private String vciRegistrationNumber;
    private String qualifications;
    private String photoUrl;
    private Long assignedDoctorId;
}

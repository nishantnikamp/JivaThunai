package com.jivathunai.adoption.document;

import lombok.*;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;

@Document(collection = "adoption_case_files")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdoptionCaseFile {
    @Id
    private String id; // Matches AdoptionListing UUID

    @Field("rescue_photos")
    private List<Photo> rescuePhotos;

    @Field("temperament_evaluation_clips")
    private List<Video> temperamentEvaluationClips;

    @Field("intake_reports")
    private List<DocumentFile> intakeReports;

    @Field("digital_adoption_deed_templates")
    private List<DocumentFile> digitalAdoptionDeedTemplates;

    @Field("rescue_details")
    private RescueDetails rescueDetails;

    @Field("behavioral_matrix")
    private BehavioralMatrix behavioralMatrix;
}

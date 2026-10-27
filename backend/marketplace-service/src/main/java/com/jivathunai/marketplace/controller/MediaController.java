package com.jivathunai.marketplace.controller;

import com.jivathunai.marketplace.service.MediaStorageService;
import com.mongodb.client.gridfs.model.GridFSFile;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.data.mongodb.gridfs.GridFsOperations;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/media")

public class MediaController {

    @Autowired
    private MediaStorageService mediaStorageService;

    @Autowired
    private GridFsOperations operations;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadMedia(@RequestParam("file") MultipartFile file) {
        try {
            String fileId = mediaStorageService.storeFile(file);
            Map<String, String> response = new HashMap<>();
            response.put("fileId", fileId);
            response.put("url", "http://localhost:8080/api/v1/media/" + fileId);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<InputStreamResource> getMedia(@PathVariable("id") String id) {
        try {
            GridFSFile gridFSFile = mediaStorageService.getFile(id);
            if (gridFSFile == null) {
                return ResponseEntity.notFound().build();
            }
            
            InputStreamResource resource = new InputStreamResource(operations.getResource(gridFSFile).getInputStream());
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(gridFSFile.getMetadata().getString("contentType")))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + gridFSFile.getFilename() + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedia(@PathVariable("id") String id) {
        try {
            mediaStorageService.deleteFile(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

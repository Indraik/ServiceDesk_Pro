package com.servicedesk.servicedesk_backend.dto;

public class ProjectInfoResponse {
    private String name;
    private String version;
    private String description;

    public ProjectInfoResponse(String name, String version, String description){
        this.name = name;
        this.version = version;
        this.description = description;
    }
    public String getName(){
        return name;
    }
    public String getVersion(){
        return version;
    }
    public String getDescription(){
        return description;
    }
}

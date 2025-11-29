package com.seumonitor.api_tester.DTO;

import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MultiTestRequest {
    private List<String> apiUrls;

    public MultiTestRequest() {}
}
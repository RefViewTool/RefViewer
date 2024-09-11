package opus.les.customrefactoring_server.controller;

import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import opus.les.customrefactoring.minerhandler.tool.refminer.RefMinerTool;
import opus.les.customrefactoring.model.RefactoringInstance;
import opus.les.customrefactoring_server.model.CodeDiff;

@RestController
public class CodeDiffController {

    @CrossOrigin(origins = "*")
    @PostMapping("/fromCode")
    public ResponseEntity<String> processDiffFromCode(@RequestBody CodeDiff diffPair) {
        // Lógica para processar o JSON recebido
        String before = diffPair.getBefore();
        String after = diffPair.getAfter();

        RefMinerTool refMinerTool = new RefMinerTool();
        List<RefactoringInstance> refInstances = refMinerTool.collect(before, after);

        return new ResponseEntity<>(refInstances.toString(), HttpStatus.OK);
    }

    @CrossOrigin(origins = "*")
    @GetMapping("/fromCommit")
    public ResponseEntity<String> processDiffFromCommit(
            @RequestParam String gitURL,
            @RequestParam String commitHash) {
        RefMinerTool refMinerTool = new RefMinerTool();
        try {
            List<RefactoringInstance> refInstances = refMinerTool.collectFromOnlineRepo(gitURL, commitHash);

            return new ResponseEntity<>(refInstances.toString(), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }
}

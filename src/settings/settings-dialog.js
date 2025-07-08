import { getConfig } from "../helpers/addin-config";

  
(function () {
  "use strict";

  Office.onReady(() => {
    const apiKeyInput = document.getElementById("apiKey");
    const workspaceIdInput = document.getElementById("workspaceId");
    const projectIdInput = document.getElementById("projectId");
    const saveBtn = document.getElementById("saveBtn");

    // Pre-fill if settings exist
    const config = getConfig(); 
    const apiKey = config.clockifyApiKey || "";
    const workspaceId = config.clockifyWorkspaceId || "";
    const projectId = config.clockifyProjectId || "";

    apiKeyInput.value = apiKey;
    workspaceIdInput.value = workspaceId; 
    projectIdInput.value = projectId;

    saveBtn.onclick = () => {
      const apiKey = apiKeyInput.value.trim();
      const workspaceId = workspaceIdInput.value.trim();
      const projectId = projectIdInput.value.trim();

      console.log("Saving settings:", {
        apiKey,
        workspaceId,
        projectId,
      });

      if (!apiKey || !workspaceId) {
        alert("API Key and Workspace ID are required.");
        return;
      }

      let config = {
        clockifyApiKey: apiKey,
        clockifyWorkspaceId: workspaceId,
        clockifyProjectId: projectId,
      }

     Office.context.ui.messageParent(JSON.stringify(config));
    };
  });
})();

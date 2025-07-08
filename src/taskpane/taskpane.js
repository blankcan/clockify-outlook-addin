/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

/* global document, Office */
import parseDuration from "parse-duration";
import URI from "urijs";
import { getConfig, setConfig } from "../helpers/addin-config";
import { createTimeEntry } from '../helpers/clockify-api.js';
(function () {
  "use strict";

  Office.onReady(function (info) {
    $(() => {
      const subjectInput = document.getElementById("subject");
      const durationInput = document.getElementById("duration");

      if (info.host === Office.HostType.Outlook) {
        const item = Office.context.mailbox.item;
        const subject = item.subject || "No subject";

        subjectInput.value = subject;
      }

      $("#submitBtn").on("click", onSubmit);

      $("#settingsBtn").on("click", openSettings);
    });

    const onSubmit = () => {
      clearError();
      const duration = $("#duration").val().trim();
      const config = getConfig();

      console.log("config", config);
      if (!config.clockifyApiKey) {
        showError(
          "No Clockify API key found. Please configure it in Settings. Please configure your Clockify API key in Settings."
        );
        openSettings();
        return;
      }

      if (!duration) {
        showError("Please enter a duration.");
        return;
      }

      const durationMs = parseDuration(duration);
      if (!durationMs || durationMs <= 0) {
        showError("Invalid duration format.");
        return;
      }

      const subject = $("#subject").val().trim();
      const durationSeconds = Math.floor(durationMs / 1000);
      showInfo(`Submitting time entry for ${durationSeconds} seconds...`);

      if(durationSeconds < 1) {
        showError("Duration must be at least 1 second.");
        return;
      }

      handleCreateTimeEntry(durationMs,subject);
    };

    async function handleCreateTimeEntry(durationMs,subject) {
      const config = getConfig();
      const { clockifyApiKey, clockifyWorkspaceId, clockifyProjectId } = config;

      if (!clockifyApiKey || !clockifyWorkspaceId) {
        alert("Please configure your Clockify settings first.");
        openSettingsDialog();
        return;
      }

      if (!durationMs) {
        alert("Invalid duration format.");
        return;
      }

      const now = new Date();
      const end = now.toISOString();
      const start = new Date(now.getTime() - durationMs).toISOString();

      try {
        await createTimeEntry({
          apiKey: clockifyApiKey,
          workspaceId: clockifyWorkspaceId,
          projectId: clockifyProjectId,
          description: subject,
          startTime: start,
          endTime: end,
        });

        showInfo("Time entry created in Clockify!");
      } catch (err) {
        console.error(err);
        showError(`Failed to create time entry: ${err.message}`);
      }
    }

    const openSettings = () => {
      const url = new URI("settingsDialog.html").absoluteTo(window.location).toString();
      console.log("Opening settings dialog at URL:", url);
      Office.context.ui.displayDialogAsync(
        url,
        { width: 40, height: 40, displayInIframe: true },
        (result) => {
          if (result.status === Office.AsyncResultStatus.Succeeded) {
            const dialog = result.value;

            // Close the dialog when it sends 'SettingsSaved'
            dialog.addEventHandler(Office.EventType.DialogMessageReceived, (arg) => {
              console.log("Raw message:", arg.message);
              const payload = JSON.parse(arg.message);
              setConfig(payload, (result) => {
                if (result.status === Office.AsyncResultStatus.Succeeded) {
                  clearInfo();
                  showInfo("Settings saved successfully.");
                  dialog.close();
                } else {
                  console.error("Failed to save settings:", result.error.message);
                  showError("Failed to save settings: " + result.error.message);
                }
              });
            });

            dialog.addEventHandler(Office.EventType.DialogEventReceived, (arg) => {
              console.log("Dialog closed:", arg);
            });
          } else {
            console.error("Could not open settings dialog:", result.error.message);
          }
        }
      );
    };

    const showError = (message) => {
      $("#error-message-container").removeClass("hide");
      $("#errorMessage").text(message);
    };

    const clearError = () => {
      $("#error-message-container").addClass("hide");
      $("#errorMessage").text("");
    };

    const showInfo = (message) => {
      $("#info-message-container").removeClass("hide");
      $("#infoMessage").text(message);
    };

    const clearInfo = () => {
      $("#info-message-container").addClass("hide");
      $("#infoMessage").text("");
    };
  });
})();

/* Office.context.mailbox.item.notificationMessages.addAsync("Debug", {
        type: Office.MailboxEnums.ItemNotificationMessageType.InformationalMessage,
        message: "Got here!",
        icon: "Icon.16x16",
        persistent: false,
      });*/

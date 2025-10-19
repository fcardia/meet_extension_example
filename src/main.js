const CLOUD_PROJECT_NUMBER = '418566026845';
const MAIN_STAGE_URL = 'https://fcardia.github.io/meet_extension_example/src/MainStage.html';

async function setUpAddon() {
  // ✅ Usa l’oggetto globale fornito dalla libreria gstatic
  const session = await google.workspace.meet.addon.createAddonSession({
    cloudProjectNumber: CLOUD_PROJECT_NUMBER,
  });

  const sidePanelClient = await session.createSidePanelClient();

  document
    .getElementById('start-activity')
    .addEventListener('click', async () => {
      await sidePanelClient.startActivity({ mainStageUrl: MAIN_STAGE_URL });
    });
}

// Avvia subito la configurazione
setUpAddon();

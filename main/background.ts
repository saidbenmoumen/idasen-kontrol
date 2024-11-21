import { app, ipcMain } from "electron";
import serve from "electron-serve";
import { createWindow } from "./helpers";
import path from "path";

const isProd: boolean = process.env.NODE_ENV === "production";

if (isProd) {
  serve({ directory: "app" });
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}

(async () => {
  await app.whenReady();

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, "assets")
    : path.join(__dirname, "../../assets");

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  const mainWindow = createWindow("main", {
    title: "IDÅSEN kontrol",
    width: 495,
    minWidth: 412,
    height: 201,
    minHeight: 201,
    frame: false,
    transparent: true,
    icon: getAssetPath("icon.png"),
  });

  // ipc communication
  ipcMain.on("app-quit", () => {
    app.quit();
  });

  ipcMain.on("app-minimize", () => {
    mainWindow.minimize();
  });

  ipcMain.on("app-settings", () => {
    // settings window
  });

  if (isProd) {
    await mainWindow.loadURL("app://./home.html");
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
    mainWindow.webContents.openDevTools();
  }
})();

app.on("window-all-closed", () => {
  app.quit();
});

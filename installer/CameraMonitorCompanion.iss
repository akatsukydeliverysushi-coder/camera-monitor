#define MyAppName "Camera Monitor Companion"
#define MyAppVersion "1.0.1"
#define MyAppPublisher "Camera Monitor"
#define MyAppExeName "CameraMonitorCompanion.exe"

[Setup]
AppId={{7D0B4B8B-4E7D-4E6C-A7D8-0D4F9B3A8E11}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName={autopf}\Camera Monitor Companion
DefaultGroupName=Camera Monitor
OutputDir=..\dist\installer
OutputBaseFilename=CameraMonitorCompanion-Setup
Compression=lzma
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=admin
ArchitecturesInstallIn64BitMode=x64

[Files]
Source: "..\dist\CameraMonitorCompanion.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\dist\ffmpeg.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\companion\README.md"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\Camera Monitor Companion"; Filename: "{app}\{#MyAppExeName}"
Name: "{autodesktop}\Camera Monitor Companion"; Filename: "{app}\{#MyAppExeName}"

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "Iniciar o Camera Monitor Companion agora"; Flags: nowait postinstall skipifsilent

[UninstallRun]
Filename: "taskkill.exe"; Parameters: "/F /IM {#MyAppExeName}"; Flags: runhidden

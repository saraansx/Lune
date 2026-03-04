; ============================================================
; Lune – Custom NSIS Installer Script
; ============================================================
; Flow: License → Install Location → Install → Finish (options)
; ============================================================

!include "nsDialogs.nsh"
!include "LogicLib.nsh"
!include "WinMessages.nsh"

; ── Skip the "per-user vs all-users" page, force current user ──
!macro customInstallMode
  StrCpy $isForceCurrentInstall "1"
!macroend

; ── Everything below is install-only (skip during uninstaller build) ──
!ifndef BUILD_UNINSTALLER

Var CheckboxDesktop
Var CheckboxStartup
Var CheckboxLaunch
Var CheckDesktopState
Var CheckStartupState
Var CheckLaunchState

Function finishPageCreate
  ; Change the "Next" button text to "Finish"
  GetDlgItem $0 $HWNDPARENT 1
  SendMessage $0 ${WM_SETTEXT} 0 "STR:Finish"

  nsDialogs::Create 1018
  Pop $0
  ${If} $0 == error
    Abort
  ${EndIf}

  ; Header
  ${NSD_CreateLabel} 0 0 100% 30u "Lune has been installed successfully!"
  Pop $0
  CreateFont $1 "Segoe UI" 12 700
  SendMessage $0 ${WM_SETFONT} $1 0

  ; Subheader
  ${NSD_CreateLabel} 0 35u 100% 20u "Choose additional options below, then click Finish."
  Pop $0

  ; Checkbox: Create Desktop Shortcut (checked by default)
  ${NSD_CreateCheckbox} 10u 70u 100% 15u "Create Desktop Shortcut"
  Pop $CheckboxDesktop
  ${NSD_SetState} $CheckboxDesktop ${BST_CHECKED}

  ; Checkbox: Launch Lune (checked by default)
  ${NSD_CreateCheckbox} 10u 90u 100% 15u "Launch Lune"
  Pop $CheckboxLaunch
  ${NSD_SetState} $CheckboxLaunch ${BST_CHECKED}

  ; Checkbox: Run on Startup (unchecked by default)
  ${NSD_CreateCheckbox} 10u 110u 100% 15u "Run Lune on Windows startup"
  Pop $CheckboxStartup
  ${NSD_SetState} $CheckboxStartup ${BST_UNCHECKED}

  nsDialogs::Show
FunctionEnd

Function finishPageLeave
  ; Read checkbox states
  ${NSD_GetState} $CheckboxDesktop $CheckDesktopState
  ${NSD_GetState} $CheckboxStartup $CheckStartupState
  ${NSD_GetState} $CheckboxLaunch  $CheckLaunchState

  ; Create Desktop Shortcut
  ${If} $CheckDesktopState == ${BST_CHECKED}
    CreateShortCut "$DESKTOP\Lune.lnk" "$INSTDIR\Lune.exe" "" "$INSTDIR\Lune.exe" 0
  ${EndIf}

  ; Run on Startup
  ${If} $CheckStartupState == ${BST_CHECKED}
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "Lune" '"$INSTDIR\Lune.exe"'
  ${Else}
    DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "Lune"
  ${EndIf}

  ; Launch Lune
  ${If} $CheckLaunchState == ${BST_CHECKED}
    Exec '"$INSTDIR\Lune.exe"'
  ${EndIf}
FunctionEnd

!endif ; !BUILD_UNINSTALLER

; ── Insert custom finish page AFTER installation ──────────────────
!macro customPageAfterInstFiles
  !ifndef BUILD_UNINSTALLER
    Page custom finishPageCreate finishPageLeave
  !endif
!macroend

; ── Uninstall Cleanup ────────────────────────────────────────
!macro customUnInstall
  DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "Lune"
  Delete "$DESKTOP\Lune.lnk"
  RMDir /r "$LOCALAPPDATA\lune"
  RMDir /r "$APPDATA\lune"
!macroend

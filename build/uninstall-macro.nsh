!macro customUnInstall
	${GetParameters} $R0
	${GetOptions} $R0 "--update" $R1
	${If} ${Errors}
		RMDir /r "$APPDATA\${APP_FILENAME}"
		DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "ilias-buddy-desktop"
	${endif}
!macroend

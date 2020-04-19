PROJECT_NAME=IliasBuddyDesktop
VERSION=0.0.1

BIN_DIR=bin

ifeq ($(PREFIX),)
    PREFIX := /usr/bin
endif
ifeq ($(PREFIX_PROGRAM_DATA),)
    PREFIX_PROGRAM_DATA := /opt
endif
ifeq ($(PREFIX_DESKTOP),)
    PREFIX_DESKTOP := /usr/share/applications
endif

.PHONY: dist install install_desktop uninstall create_package

#all: dist install install_desktop
#
## Clean up build and extract/rename executable
#dist:
#	rm -rf node_modules
#	npm install --production
#
#	mkdir -p $(BIN_DIR)
#	cp index.js $(BIN_DIR)
#	cp main.js $(BIN_DIR)
#	cp index.html $(BIN_DIR)
#	cp package.json $(BIN_DIR)
#	cp default_settings.json $(BIN_DIR)
#	cp -R css $(BIN_DIR)
#	cp -R fonts $(BIN_DIR)
#	cp -R images $(BIN_DIR)
#	cp -R js $(BIN_DIR)
#	cp -R modules $(BIN_DIR)
#	cp -R node_modules $(BIN_DIR)
#
#	echo -e "\
#	#!/usr/bin/env bash\n\
#	cd $(BIN_DIR)\n\
#	electron .\n\
#	" > $(BIN_DIR)/$(PROJECT_NAME)
#	chmod +x $(BIN_DIR)/$(PROJECT_NAME)
#
#	cp images/favicon/favicon.svg $(BIN_DIR)/$(PROJECT_NAME).svg
#	echo -e "\
#	[Desktop Entry]\n\
#	Version=1.0\n\
#	Type=Application\n\
#	Terminal=false\n\
#	Exec=$(PROJECT_NAME)\n\
#	Name=$(PROJECT_NAME)\n\
#	Comment=Ilias private RSS feed reader and notifier\n\
#	Icon=$(PROJECT_NAME).svg\n\
#	" > $(BIN_DIR)/$(PROJECT_NAME).desktop
#
## Install program
#install:
#	install -d $(DESTDIR)$(PREFIX)/
#
#	sed -i s#$(BIN_DIR)#$(PREFIX_PROGRAM_DATA)/$(PROJECT_NAME)# $(BIN_DIR)/$(PROJECT_NAME)
#	install -Dm 777 $(BIN_DIR)/$(PROJECT_NAME) $(DESTDIR)$(PREFIX)/
#	sed -i s#$(PREFIX_PROGRAM_DATA)/$(PROJECT_NAME)#$(BIN_DIR)# $(BIN_DIR)/$(PROJECT_NAME)
#
#	install -d $(DESTDIR)$(PREFIX_PROGRAM_DATA)/
#	install -d $(DESTDIR)$(PREFIX_PROGRAM_DATA)/$(PROJECT_NAME)
#	install -Dm 644 $(BIN_DIR)/$(PROJECT_NAME) $(DESTDIR)$(PREFIX)/
#
## Install a desktop file for the installed program
#install_desktop:
#	install -d $(DESTDIR)$(PREFIX_DESKTOP)/
#
#	sed -i s#Exec=#Exec=$(PREFIX)/# $(BIN_DIR)/$(PROJECT_NAME).desktop
#	sed -i s#Icon=#Icon=$(PREFIX_DESKTOP)/# $(BIN_DIR)/$(PROJECT_NAME).desktop
#	install -Dm 644 $(BIN_DIR)/$(PROJECT_NAME).desktop $(DESTDIR)$(PREFIX_DESKTOP)/
#	sed -i s#Exec=$(PREFIX)/#Exec=# $(BIN_DIR)/$(PROJECT_NAME).desktop
#	sed -i s#Icon=$(PREFIX_DESKTOP)/#Icon=# $(BIN_DIR)/$(PROJECT_NAME).desktop
#
#	install -Dm 644 $(BIN_DIR)/$(PROJECT_NAME).svg $(DESTDIR)$(PREFIX_DESKTOP)/
#
## Uninstall installed program
#uninstall:
#	rm -f $(PREFIX)/$(PROJECT_NAME)-portable-$(VERSION).jar
#	rm -f $(PREFIX)/$(PROJECT_NAME)
#
#	rm -f $(PREFIX_DESKTOP)/$(PROJECT_NAME).desktop
#	rm -f $(PREFIX_DESKTOP)/$(PROJECT_NAME).svg

create_package:
	makepkg -f .
	# Install with
	# pacman -U packagename.tar.gz

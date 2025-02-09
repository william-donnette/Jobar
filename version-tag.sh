#!/bin/bash

# Vérifie si le fichier package.json existe
if [ ! -f "package.json" ]; then
    echo "Le fichier package.json n'existe pas dans ce répertoire."
    exit 1
fi

version=$(node -p -e "require('./package.json').version")
version="v$version"
version_regex='^v[0-9]+.[0-9]+.[0-9]+(-alpha|-beta)?$'
if [[ $version =~ $version_regex ]]; then
    echo $version
    exit 0
else
    echo "Version : $version (format invalide)"
    exit 1
fi
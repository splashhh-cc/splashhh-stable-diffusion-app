#!/bin/bash

# MIT License

# Coauthored by Lincoln Stein, Eugene Brodsky and Joshua Kimsey
# Copyright 2023, The InvokeAI Development Team

####
# This launch script assumes that:
# 1. it is located in the runtime directory,
# 2. the .venv is also located in the runtime directory and is named exactly that
#
# If both of the above are not true, this script will likely not work as intended.
# Activate the virtual environment and run `invoke.py` directly.
####

set -eu

# Ensure we're in the correct folder in case user's CWD is somewhere else
scriptdir=$(dirname "$0")
cd "$scriptdir"

. .venv/bin/activate

export INVOKEAI_ROOT="$scriptdir"
PARAMS=$@

# Check to see if dialog is installed (it seems to be fairly standard, but good to check regardless) and if the user has passed the --no-tui argument to disable the dialog TUI
tui=true
if command -v dialog &>/dev/null; then
    # This must use $@ to properly loop through the arguments passed by the user
    for arg in "$@"; do
        if [ "$arg" == "--no-tui" ]; then
            tui=false
            # Remove the --no-tui argument to avoid errors later on when passing arguments to InvokeAI
            PARAMS=$(echo "$PARAMS" | sed 's/--no-tui//')
            break
        fi
    done
else
    tui=false
fi

# Set required env var for torch on mac MPS
if [ "$(uname -s)" == "Darwin" ]; then
    export PYTORCH_ENABLE_MPS_FALLBACK=1
fi

# Primary function for the case statement to determine user input
do_choice() {
    case $1 in
    1)
        clear
        printf "Generate images with a browser-based interface\n"
        invokeai --web $PARAMS
        ;;
    2)
        clear
        printf "Generate images using a command-line interface\n"
        invokeai $PARAMS
        ;;
    3)
        clear
        printf "Textual inversion training\n"
        invokeai-ti --gui $PARAMS
        ;;
    4)
        clear
        printf "Merge models (diffusers type only)\n"
        invokeai-merge --gui $PARAMS
        ;;
    5)
        clear
        printf "Download and install models\n"
        invokeai-model-install --root ${INVOKEAI_ROOT}
        ;;
    6)
        clear
        printf "Change InvokeAI startup options\n"
        invokeai-configure --root ${INVOKEAI_ROOT} --skip-sd-weights --skip-support-models
        ;;
    7)
        clear
        printf "Re-run the configure script to fix a broken install\n"
        invokeai-configure --root ${INVOKEAI_ROOT} --yes --default_only
        ;;
    8)
        clear
        printf "Open the developer console\n"
        file_name=$(basename "${BASH_SOURCE[0]}")
        bash --init-file "$file_name"
        ;;
    9)
        clear
        printf "Update InvokeAI\n"
        invokeai-update
        ;;
    10)
        clear
        printf "Command-line help\n"
        invokeai --help
        ;;
    "HELP 1")
        clear
        printf "Command-line help\n"
        invokeai --help
        ;;
    *)
        clear
        printf "Exiting...\n"
        exit
        ;;
    esac
    clear
}

# Dialog-based TUI for launcing Invoke functions
do_dialog() {
    options=(
        1 "Generate images with a browser-based interface"
        2 "Generate images using a command-line interface"
        3 "Textual inversion training"
        4 "Merge models (diffusers type only)"
        5 "Download and install models"
        6 "Change InvokeAI startup options"
        7 "Re-run the configure script to fix a broken install"
        8 "Open the developer console"
        9 "Update InvokeAI")

    choice=$(dialog --clear 
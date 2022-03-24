# ussd-browser
A tool to simlulate USSD experience by connecting to USSD Gateway from your browser.

## Caution
This is a tool for development, simulation and demo purpose only. In real world an USSD gateway is behind a Telco provider, and called from a phone.

## How it works
The tool helps to interact with an USSD gateway by providing minimal open configurations.
The UI includes:
-  a display showing what a phone would normally show on screen when using USSD service
-  an input field as a prompt to send next screen's choice or the answer to current displayed question

Additionnal feature:
- saving and loading configurations from file 
- shows error when screen content length exceeds the standard max length of 160 characters.

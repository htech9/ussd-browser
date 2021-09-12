# ussd-browser
A tool to interact with an USSD Gateway from browser

## Caution
This is a tool for development, simulation and demo purpose only. In real world an USSD gateway is behind a Telco provider, and called from a phone.

## How it works
The tool provides a mechanism to interact with a simple ussd gateway, including:
-  display the choices that would be displayed on the phone screen
-  prompt a choice response to get the next screen response

Additionnal feature:
- shows error when screen content length exceeds the standard max length (160 characters)

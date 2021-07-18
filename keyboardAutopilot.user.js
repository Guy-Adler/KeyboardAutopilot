// ==UserScript==
// @name GeoFS Keyboard Autopilot
// @description the extension enables the GeoFS built-in autopilot ot be controlled by the keyboard.
// @namespace https://github.com/Guy-Adler/KeyboardAutopilot
// @version 1.0.0
// @author Guy Adler
// @match https://www.geo-fs.com/geofs.php
// @run-at document-end
// @grant none
// ==/UserScript==

(function (main) {
    // Checks if the game completed loading
    let timer = setInterval(function () {
        if (window.geofs && geofs.aircraft && geofs.aircraft.instance && geofs.aircraft.instance.object3d) {
            clearInterval(timer);
            main();
        }
    }, 100);
})(function() {
    'use strict';
    function removeEvents() {
        // Remove all current keybinds, to change one of them:
        $(document).off('keydown');
    
        // don't break the game:
        $(document).on("keydown", ".geofs-stopKeyboardPropagation", function(a) {
            a.stopImmediatePropagation()
        });
        $(document).on("keydown", ".address-input", function(a) {
            a.stopImmediatePropagation()
        });
    }
    removeEvents();

    // modify the autopilot:
    controls.autopilot = {...controls.autopilot,
        keyboardAutopilotSettings: {
            selected: ''
        }
    };

    document.querySelectorAll('.numberValue').forEach(function(element) {
        let type = element.dataset.method.substring(3);
        controls.autopilot.keyboardAutopilotSettings[type] = {
            min: parseInt(element.min, 10) || -Infinity,
            max: parseInt(element.max, 10) || Infinity,
            step: parseInt(element.step, 10) || 1,
            loop: !!element.dataset.loop
        }
    })
    
    let keyDownEvents = controls.keyDown;
    controls.keyDown = function (event) {
        if (event.altKey) {
            if (event.key === 's') { // speed
                event.preventDefault();
                event.stopPropagation();
                controls.autopilot.keyboardAutopilotSettings.selected = 'Kias';
            } else if (event.key === 'h') { // heading
                event.preventDefault();
                event.stopPropagation();
                controls.autopilot.keyboardAutopilotSettings.selected = 'Heading';
            } else if (event.key === 'a') { // altitude
                event.preventDefault();
                event.stopPropagation();
                controls.autopilot.keyboardAutopilotSettings.selected = 'Altitude';
            }
            else if (event.key === 'v') {// vertical speed
                event.preventDefault();
                event.stopPropagation();
                controls.autopilot.keyboardAutopilotSettings.selected = 'Climbrate';
            } else if (event.key === 'PageUp' || event.key === '+'){ // increment selected mode
                event.preventDefault();
                event.stopPropagation();
                let settings = controls.autopilot.keyboardAutopilotSettings;
                let properties = settings[settings.selected];
                if (settings.selected !== '') {
                    let val = parseInt(controls.autopilot[settings.selected.toLowerCase()], 10);
                    if (val + properties.step <= properties.max) {
                        controls.autopilot[`set${settings.selected}`](val + properties.step);
                    } else {
                        if (properties.loop) {
                            controls.autopilot[`set${settings.selected}`]((val + properties.step) % 360);
                        }
                    }
                }
            } else if (event.key === 'PageDown' || event.key === '-'){ // decrement selected mode
                event.preventDefault();
                event.stopPropagation();
                let settings = controls.autopilot.keyboardAutopilotSettings;
                let properties = settings[settings.selected];
                if (settings.selected !== '') {
                    let val = controls.autopilot[settings.selected.toLowerCase()];
                    if (val - properties.step >= properties.min) {
                        controls.autopilot[`set${settings.selected}`]((val - properties.step));
                    } else {
                        if (properties.loop) {
                            controls.autopilot[`set${settings.selected}`]((properties.max - (val + properties.step) - 1) % 360);
                        }
                    }
                }
            } else {
                keyDownEvents(event);
            }
        } else {
            keyDownEvents(event);
        }
    };

    $(document).on("keydown", controls.keyDown);  // reapply the keybinds
});
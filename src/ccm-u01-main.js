import "./theme.css";

import { App } from "./App.js";
import { PanelDetail } from "./PanelDetail.js";

const openRoute = () => {
    if (
        String(window.location.hash)
            .toLowerCase() === "#ccm-u01"
    ) {
        requestAnimationFrame(() => {
            PanelDetail.open("CCM-U01");
        });
    }
};

window.addEventListener("DOMContentLoaded", () => {
    App.start();
    openRoute();
});

window.addEventListener(
    "hashchange",
    openRoute
);
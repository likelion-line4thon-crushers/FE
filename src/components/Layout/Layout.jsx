// src/components/Layout/Layout.jsx
import React from "react";
import HeaderBar from "../HeaderBar";
import { LayoutContainer } from "./Layout.styles";

const Layout = ({ children, headerProps = {} }) => {
    return (
        <LayoutContainer style={{ flexDirection: "column" }}>
            <HeaderBar
                roomId={headerProps.roomId}
                deckId={headerProps.deckId}
                totalPages={headerProps.totalPages}
            />

            <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
                {children}
            </div>
        </LayoutContainer>
    );
};

export default Layout;

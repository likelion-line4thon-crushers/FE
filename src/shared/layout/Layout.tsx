import React from "react";
import HeaderBar from "../header/HeaderBar";
import { LayoutContainer, ContentArea } from "./Layout.styles";

interface LayoutProps {
  children: React.ReactNode;
  headerProps?: {
    roomData?: any;
    roomId?: string;
    deckId?: string;
    totalPages?: number;
  };
}

const Layout = ({ children, headerProps = {} }: LayoutProps) => (
  <LayoutContainer>
    <HeaderBar
      roomData={headerProps.roomData}
      totalPages={headerProps.totalPages}
    />
    <ContentArea>{children}</ContentArea>
  </LayoutContainer>
);

export default Layout;

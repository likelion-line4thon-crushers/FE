import React from "react";
import { LayoutContainer, ContentArea } from "./PresentationLayout.styles";

interface PresentationLayoutProps {
  children: React.ReactNode;
}

const PresentationLayout = ({ children }: PresentationLayoutProps) => (
  <LayoutContainer>
    <ContentArea>{children}</ContentArea>
  </LayoutContainer>
);

export default PresentationLayout;

import styled from "styled-components";
import { MEDIA } from "@/shared/config/breakpoints";

export const HeadBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 22px;

  @media ${MEDIA.mobile} {
    align-items: flex-start;
    width: 100%;
  }
`;

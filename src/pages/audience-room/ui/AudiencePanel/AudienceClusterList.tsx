import React from "react";
import type { QuestionCluster } from "@/entities/question";
import styled from "styled-components";
import { QuestionItem, QuestionText } from "./AudiencePanel.styles";

interface AudienceClusterListProps {
  clusters: QuestionCluster[];
  isExpanded: (representative: string) => boolean;
  toggleExpand: (representative: string) => void;
}

const ClusterGroupTag = styled.div`
  background: #e74d07;
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  border-radius: 3px;
  padding: 1px 6px;
  white-space: nowrap;
  display: inline-block;
  margin-bottom: 0.37vh;
`;

const ClusterExpandToggle = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 0;
  margin-top: 0.37vh;
  font-size: 11px;
  font-weight: 500;
  color: #303030;
  letter-spacing: -0.35px;
  line-height: 1.45;
`;

const ClusterSamplesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 4px;
`;

const ClusterSampleItem = styled.div`
  padding: 4px 8px;
  background: #f4f4f4;
  border-radius: 4px;
  font-size: 11px;
  color: #444;
  line-height: 1.4;
  text-align: left;
`;

const AudienceClusterList = ({ clusters, isExpanded, toggleExpand }: AudienceClusterListProps) => {
  if (clusters.length === 0) return null;

  return (
    <>
      {clusters.map((cluster) => {
        const isGroup = cluster.count > 1;
        const expanded = isGroup && isExpanded(cluster.representative);

        return (
          <QuestionItem key={cluster.representative} $active={false}>
            <ClusterGroupTag>비슷한 질문들</ClusterGroupTag>
            <QuestionText>{cluster.representative}</QuestionText>

            {isGroup && (
              <ClusterExpandToggle
                type="button"
                aria-label={`${expanded ? "접기" : "펼치기"} — 질문 ${cluster.count}개`}
                onClick={() => toggleExpand(cluster.representative)}
              >
                질문 {cluster.count}개 {expanded ? "▲" : "▶"}
              </ClusterExpandToggle>
            )}

            {expanded && cluster.samples.length > 0 && (
              <ClusterSamplesWrapper>
                {cluster.samples.map((sample, i) => (
                  <ClusterSampleItem key={`${cluster.representative}-${i}`}>
                    {sample}
                  </ClusterSampleItem>
                ))}
              </ClusterSamplesWrapper>
            )}
          </QuestionItem>
        );
      })}
    </>
  );
};

export default AudienceClusterList;

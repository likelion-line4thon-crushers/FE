import React from "react";
import {
    LiveBox,
    QuestionContainer,
    QuestionItem,
    Author,
    Content,
    Time,
    EmptyText,
} from "./QuestionList.styles";

const QuestionList = ({ questions = [], onEndSession }) => {
    return (
        <LiveBox>

            {/* 질문 리스트 영역 */}
            <QuestionContainer>
                {questions.length > 0 ? (
                    questions.map((q, idx) => (
                        <QuestionItem key={idx}>
                            <Author>{q.user || "익명"}</Author>
                            <Content>{q.message}</Content>
                            <Time>{q.time || "방금 전"}</Time>
                        </QuestionItem>
                    ))
                ) : (
                    <EmptyText>아직 등록된 질문이 없습니다.</EmptyText>
                )}
            </QuestionContainer>
        </LiveBox>
    );
};

export default QuestionList;

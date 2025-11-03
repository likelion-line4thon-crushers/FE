import React from "react";
import {
    LiveBox,
    QuestionContainer,
    QuestionItem,
    QuestionHeader,
    SlideTag,
    Time,
    Content,
} from "./QuestionList.styles";

const QuestionList = () => {
    // 하드코딩된 테스트용 질문 데이터
    const dummyQuestions = [
        {
            id: 1,
            slide: 0,
            time: "00:00",
            content:
                "동해물과 백두산이 마르고 닳도록 동해물과 백두산이 마르고 닳도록",
        },
        {
            id: 2,
            slide: 1,
            time: "00:15",
            content:
                "발표 자료에 대해 궁금한 점이 있습니다. 슬라이드 전환 시 애니메이션 속도는 조절 가능한가요?",
        },
        {
            id: 3,
            slide: 2,
            time: "00:30",
            content:
                "현재 그래프 부분에서 데이터 출처가 궁금합니다. 혹시 직접 측정한 건가요?",
        },
        {
            id: 4,
            slide: 0,
            time: "00:45",
            content:
                "청중 피드백 시스템이 실시간으로 업데이트되는지 궁금합니다.",
        },
        {
            id: 5,
            slide: 3,
            time: "01:00",
            content: "마무리 부분에서 제안된 개선 사항에 대한 구체적인 계획이 있을까요?",
        },
    ];

    return (
        <LiveBox>
            <QuestionContainer>
                {dummyQuestions.map((q) => (
                    <QuestionItem key={q.id}>
                        <QuestionHeader>
                            <SlideTag>슬라이드 {q.slide}</SlideTag>
                            <Time>{q.time}</Time>
                        </QuestionHeader>
                        <Content>{q.content}</Content>
                    </QuestionItem>
                ))}
            </QuestionContainer>
        </LiveBox>
    );
};

export default QuestionList;

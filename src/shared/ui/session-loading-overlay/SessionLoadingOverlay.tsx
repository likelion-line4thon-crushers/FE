import {
  BrandMark,
  Center,
  LoaderRing,
  MarkSurface,
  Message,
  Overlay,
} from "./SessionLoadingOverlay.styles";

interface SessionLoadingOverlayProps {
  message?: string;
}

const SessionLoadingOverlay = ({ message = "세션 자료 정리 중..." }: SessionLoadingOverlayProps) => {
  return (
    <Overlay role="status" aria-live="polite">
      <Center aria-hidden="true">
        <LoaderRing />
        <MarkSurface>
          <BrandMark viewBox="0 0 31 32" aria-hidden="true" focusable="false">
            <path d="M23.0589 31.8934H10.7686V3.02637H14.3218V28.3338H23.0589V31.8934Z" />
            <path d="M14.3214 17.2408H10.7681C10.7681 15.2903 9.18622 13.6812 7.21489 13.6812C5.24357 13.6812 3.66164 15.266 3.66164 17.2408H0.108398C0.108398 13.3155 3.29659 10.1216 7.21489 10.1216C11.1332 10.1216 14.3214 13.3155 14.3214 17.2408Z" />
            <path d="M30.919 17.2408H27.3658C27.3658 15.2903 25.7839 13.6812 23.8125 13.6812C21.8412 13.6812 20.2593 15.266 20.2593 17.2408H16.7061C16.7061 13.3155 19.8942 10.1216 23.8125 10.1216C27.7309 10.1216 30.919 13.3155 30.919 17.2408Z" />
            <path d="M6.84998 20.996C8.15377 20.996 9.2107 19.9372 9.2107 18.6311C9.2107 17.3249 8.15377 16.2661 6.84998 16.2661C5.54619 16.2661 4.48926 17.3249 4.48926 18.6311C4.48926 19.9372 5.54619 20.996 6.84998 20.996Z" />
            <path d="M23.6429 21.1655C24.9467 21.1655 26.0037 20.1066 26.0037 18.8005C26.0037 17.4944 24.9467 16.4355 23.6429 16.4355C22.3392 16.4355 21.2822 17.4944 21.2822 18.8005C21.2822 20.1066 22.3392 21.1655 23.6429 21.1655Z" />
            <path d="M28.1204 0.100586H17.9961V3.07506H28.1204V0.100586Z" className="accent" />
          </BrandMark>
        </MarkSurface>
      </Center>
      <Message>{message}</Message>
    </Overlay>
  );
};

export default SessionLoadingOverlay;

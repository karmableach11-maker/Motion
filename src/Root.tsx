import { Motion } from "./Motion";
export const RemotionRoot: React.FC = () => {
  return (
    <>
        <Composition
          id="Motion"
          component={Motion}
          durationInFrames={900}
          fps={60}
          width={1920}
          height={1080}
        />
    </>
  );
};

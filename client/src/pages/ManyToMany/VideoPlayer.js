import { useEffect, useRef } from "react";

const VideoPlayer = (props) => {
  const ref = useRef();
  const elementRef = useRef(null);
  console.log(props)
  useEffect(() => {
    props.peer.on("stream", (stream) => (ref.current.srcObject = stream));
  }, []);

  return (
    <div className="display-user" ref={elementRef}>
      <video playsInline autoPlay ref={ref} />
      <h6>{props.user.username}</h6>
    </div>
  );
};
export default VideoPlayer;

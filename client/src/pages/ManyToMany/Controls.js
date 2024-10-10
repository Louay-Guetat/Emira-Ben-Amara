import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVideo, faVideoSlash, faMicrophone, faMicrophoneSlash, faDesktop, faRecordVinyl, faUsers, faComments, faPhoneSlash, faCircleStop } from '@fortawesome/free-solid-svg-icons';

const Controls = ({
  muteVideo,
  cameraActive,
  muteAudio,
  micActive,
  screenSharing,
  screenShare,
  toggleSidePanel,
  leave,
}) => {
  return (
    <div className="controlsWrapper">
      <button className="cntBtn" onClick={muteVideo}>
          <FontAwesomeIcon icon={cameraActive ? faVideo : faVideoSlash} />
      </button>
      <button className="cntBtn" onClick={muteAudio}>
          <FontAwesomeIcon icon={micActive ? faMicrophone : faMicrophoneSlash} />
      </button>
      <button className="cntBtn" onClick={screenSharing}>
        {screenShare ? (
          <FontAwesomeIcon icon={faCircleStop} />
        ) : (
          <FontAwesomeIcon icon={faDesktop} />
        )}
      </button>
      <button
        onClick={() => toggleSidePanel("Chats")}
        className="cntBtn"
      >
        <FontAwesomeIcon icon={faComments} />
      </button>
      <button
        onClick={() => toggleSidePanel("People")}
        className="cntBtn"
      >
        <FontAwesomeIcon icon={faUsers} />
      </button>
      <button className="cntBtn" onClick={leave}>
          <FontAwesomeIcon icon={faPhoneSlash} />
      </button>
    </div>
  );
};

export default Controls;

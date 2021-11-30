import React from 'react';
import { LogLevel } from 'bitmovin-player';
import {
  Player as Bitmovin,
  PlayerEvent,
} from 'bitmovin-player/modules/bitmovinplayer-core';
import BitmovinEngineModule from 'bitmovin-player/modules/bitmovinplayer-engine-bitmovin';
import BitmovinEngineNative from 'bitmovin-player/modules/bitmovinplayer-engine-native';
import RemoteControl from 'bitmovin-player/modules/bitmovinplayer-remotecontrol';
import MSERendererModule from 'bitmovin-player/modules/bitmovinplayer-mserenderer';
import HLSModule from 'bitmovin-player/modules/bitmovinplayer-hls';
import ContainerMP4Module from 'bitmovin-player/modules/bitmovinplayer-container-mp4';
import BitmovinSubtitles from 'bitmovin-player/modules/bitmovinplayer-subtitles';
import BitmovinSubtitlesCEA608 from 'bitmovin-player/modules/bitmovinplayer-subtitles-cea608';
import BitmovinSubtitlesNative from 'bitmovin-player/modules/bitmovinplayer-subtitles-native';
import BitmovinSubtitlesWebVTT from 'bitmovin-player/modules/bitmovinplayer-subtitles-vtt';
import DASHModule from 'bitmovin-player/modules/bitmovinplayer-dash';
import XMLModule from 'bitmovin-player/modules/bitmovinplayer-xml';
import ABRModule from 'bitmovin-player/modules/bitmovinplayer-abr';
import TSContainerModule from 'bitmovin-player/modules/bitmovinplayer-container-ts';
import PathModule from 'bitmovin-player/modules/bitmovinplayer-patch';
import StyleModule from 'bitmovin-player/modules/bitmovinplayer-style';
import Analytics from 'bitmovin-player/modules/bitmovinplayer-analytics';
import ServiceWorkerClient from 'bitmovin-player/modules/bitmovinplayer-serviceworker-client';
import { UIFactory } from 'bitmovin-player/bitmovinplayer-ui';
import 'bitmovin-player/bitmovinplayer-ui.css';

class BitmovinPlayer extends React.Component {
  player = null;

  playerConfig = {};

  videoContainer = React.createRef();

  heartbeatInterval = 0;

  getVideoContainer() {
    return this.videoContainer.current;
  }

  constructor(props) {
    super(props);
    this.state = {
      // eslint-disable-next-line react/no-unused-state
      playbackProgress: 0,
      // eslint-disable-next-line react/prop-types,react/no-unused-state
      player: props.player,
    };
  }

  // base64DecodeUint8Array(input) {
  //   const raw = atob(input);
  //   const rawLength = raw.length;
  //   const array = new Uint8Array(new ArrayBuffer(rawLength));
  //   for (let i = 0; i < rawLength; i++) {
  //     array[i] = raw.charCodeAt(i);
  //   }
  //   return array;
  // }

  componentDidMount() {
    this.playerConfig = {
      key: '',
      analytics: {
        key: '7985f8f2-dea6-4db5-8f65-3af95e1840fd',
        videoId: 'ad-scheduling',
      },
      ui: false,
      logs: {
        level: LogLevel.DEBUG,
        advertising: {
          schedule: {},
        },
      },
      playback: {
        muted: true,
        autoplay: true,
      },
      events: {
        [PlayerEvent.Play]: this.onPlay,
        [PlayerEvent.SourceLoaded]: this.onSourceLoaded,
        [PlayerEvent.CastStart]: this.CastStart,
        [PlayerEvent.CastStarted]: this.CastStarted,
      },
      remotecontrol: {
        type: 'googlecast',
        messageNamespace: 'urn:x-cast:com.formula1.player.caf',
        receiverApplicationId: '24AC46BD',
        receiverVersion: 'v3',
      },
    };

    this.setupPlayer();
  }

  componentDidUpdate(prevProps) {
    // eslint-disable-next-line react/prop-types
    const { manifest, activePlayer } = this.props;

    // eslint-disable-next-line react/prop-types
    if (prevProps.activePlayer !== activePlayer) {
      this.load({ hls: manifest });
    }
  }

  componentWillUnmount() {
    this.destroyPlayer();
  }

  setupPlayer() {
    Bitmovin.addModule(BitmovinEngineModule);
    Bitmovin.addModule(BitmovinEngineNative);
    Bitmovin.addModule(RemoteControl);
    Bitmovin.addModule(ServiceWorkerClient);
    Bitmovin.addModule(MSERendererModule);
    Bitmovin.addModule(ContainerMP4Module);
    Bitmovin.addModule(XMLModule);
    Bitmovin.addModule(DASHModule);
    Bitmovin.addModule(HLSModule);
    Bitmovin.addModule(ABRModule);
    Bitmovin.addModule(TSContainerModule);
    Bitmovin.addModule(BitmovinSubtitles);
    Bitmovin.addModule(BitmovinSubtitlesNative);
    Bitmovin.addModule(BitmovinSubtitlesCEA608);
    Bitmovin.addModule(BitmovinSubtitlesWebVTT);
    Bitmovin.addModule(Analytics);
    Bitmovin.addModule(PathModule);
    Bitmovin.addModule(StyleModule);

    const playerContainer = this.getVideoContainer();
    // eslint-disable-next-line react/prop-types
    this.player = new Bitmovin(playerContainer, this.playerConfig);
    UIFactory.buildDefaultUI(this.player, {
      playbackSpeedSelectionEnabled: false,
      disableAutoHideWhenHovered: true,
    });
    // eslint-disable-next-line react/prop-types
    const { manifest } = this.props;

    // trigger player load
    this.load({ hls: manifest });
  }

  enableHeartbeat = () => {
    const { getCurrentTime } = this;
    // eslint-disable-next-line react/prop-types
    const { setPlayProgress } = this.props;
    // clear previous interval
    clearInterval(this.heartbeatInterval);
    // next interval
    this.heartbeatInterval = setInterval(() => {
      const time = getCurrentTime();
      setPlayProgress(time);
    }, 1000);
  };

  load = sourceConfig => {
    const { player } = this;
    // eslint-disable-next-line react/prop-types
    const { playProgress } = this.props;

    // eslint-disable-next-line react/prop-types
    const { activePlayer } = this.props;

    // eslint-disable-next-line react/prop-types
    const { manifest } = this.props;

    if (!manifest.length) {
      this.stop();
      return;
    }

    if (playProgress) {
      // eslint-disable-next-line no-param-reassign
      sourceConfig.options = {
        startOffset: playProgress,
      };
    }

    player.load(sourceConfig).then(
      () => {
        console.log(
          `${
            activePlayer === 1 ? `${activePlayer}st` : `${activePlayer}nd`
          } player loaded successfully`,
        );
        this.enableHeartbeat();
      },
      () => {
        console.log('Error while loading source');
      },
    );
  };

  isReady = () => !!this.getPlayerVersion();

  getCurrentTime = () => (this.isReady() && this.player.getCurrentTime()) || 0;

  getPlayerVersion = () => this.player && this.player.version;

  stop = cb => {
    clearInterval(this.heartbeatInterval);
    // eslint-disable-next-line no-unused-expressions
    this.isReady() &&
      this.player &&
      this.player.unload &&
      this.player
        .unload()
        .then(() => {
          if (cb) {
            cb();
          }
        })
        .catch(this.onError);
  };

  onPlay = () => {
    // eslint-disable-next-line react/prop-types
    const { player } = this.props;
    console.log(`${player === 1 ? `${player}st` : `${player}nd`} playing`);
  };

  onSourceLoaded = () => {};

  destroyPlayer() {
    if (this.player !== null) {
      this.player.destroy();
    }
  }

  CastStart = () => {
    // eslint-disable-next-line react/prop-types
    const { player } = this.props;
    console.log('CastStart Player', player);
  };

  CastStarted = () => {
    // eslint-disable-next-line react/prop-types
    const { player } = this.props;
    console.log('CastStarted Player', player);
  };

  render() {
    return <div id="player" ref={this.videoContainer} />;
  }
}

export default BitmovinPlayer;

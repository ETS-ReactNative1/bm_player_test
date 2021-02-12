import React from 'react';
import { Player as Bitmovin, LogLevel } from 'bitmovin-player';
import BitmovinEngineModule from 'bitmovin-player/modules/bitmovinplayer-engine-bitmovin';
import MSERendererModule from 'bitmovin-player/modules/bitmovinplayer-mserenderer';
import HLSModule from 'bitmovin-player/modules/bitmovinplayer-hls';
import ContainerMP4Module from 'bitmovin-player/modules/bitmovinplayer-container-mp4';
import DASHModule from 'bitmovin-player/modules/bitmovinplayer-dash';
import XMLModule from 'bitmovin-player/modules/bitmovinplayer-xml';
import ABRModule from 'bitmovin-player/modules/bitmovinplayer-abr';
import TSContainerModule from 'bitmovin-player/modules/bitmovinplayer-container-ts';
import PathModule from 'bitmovin-player/modules/bitmovinplayer-patch';
import StyleModule from 'bitmovin-player/modules/bitmovinplayer-style';
import Analytics from 'bitmovin-player/modules/bitmovinplayer-analytics';
import { UIFactory } from 'bitmovin-player/bitmovinplayer-ui';
import 'bitmovin-player/bitmovinplayer-ui.css';

class BitmovinPlayer extends React.Component {
  player = null;

  videoContainer = React.createRef();

  playerConfig = {
    key: '456747b9-c7e7-4832-aa2c-40a45a5da235',
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
    remotecontrol: {
      type: 'googlecast',
      receiverApplicationId: '2D21C8BE',
      receiverVersion: 'v3',
    },
  };

  getVideoContainer() {
    return this.videoContainer.current;
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
    this.setupPlayer();
  }

  componentWillUnmount() {
    this.destroyPlayer();
  }

  setupPlayer() {
    Bitmovin.addModule(BitmovinEngineModule);
    Bitmovin.addModule(MSERendererModule);
    Bitmovin.addModule(ContainerMP4Module);
    Bitmovin.addModule(XMLModule);
    Bitmovin.addModule(DASHModule);
    Bitmovin.addModule(HLSModule);
    Bitmovin.addModule(ABRModule);
    Bitmovin.addModule(TSContainerModule);
    Bitmovin.addModule(Analytics);
    Bitmovin.addModule(PathModule);
    Bitmovin.addModule(StyleModule);

    const playerContainer = this.getVideoContainer();
    // eslint-disable-next-line react/prop-types
    const { manifest } = this.props;
    this.player = new Bitmovin(playerContainer, this.playerConfig);
    UIFactory.buildDefaultUI(this.player, {
      playbackSpeedSelectionEnabled: false,
      disableAutoHideWhenHovered: true,
    });
    this.player.load({ hls: manifest }).then(
      () => {
        console.log('Successfully loaded source');
      },
      () => {
        console.log('Error while loading source');
      },
    );
  }

  destroyPlayer() {
    if (this.player !== null) {
      this.player.destroy();
    }
  }

  render() {
    return <div id="player" ref={this.videoContainer} />;
  }
}

export default BitmovinPlayer;

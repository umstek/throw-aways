import { EventEmitter } from 'events';

export enum ChannelMode {
  FORCED_MONO = 'forced_mono',
  ORIGINAL = 'original',
}

export enum PlayerState {}

export default class AudioPlayer extends EventEmitter {
  private audioContext: AudioContext;
  private gainNode: GainNode;
  private pannerNode: StereoPannerNode;
  private audioElement: HTMLAudioElement;
  private analyser: AnalyserNode | undefined;
  private originalSource: MediaElementAudioSourceNode | undefined;

  constructor() {
    super();

    this.audioContext = new AudioContext();
    this.gainNode = this.audioContext.createGain();
    this.pannerNode = this.audioContext.createStereoPanner();
    this.audioElement = new Audio();
    this.audioElement.autoplay = false;
    this.audioElement.src = '';
    this.audioElement.addEventListener('ended', this.onEnded.bind(this));

    this.connectAudioNodes();
  }

  private onEnded() {
    this.emit('ended');
  }

  private connectAudioNodes() {
    const source = this.audioContext.createMediaElementSource(
      this.audioElement,
    );
    this.originalSource = source;
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);
    source
      .connect(this.analyser)
      .connect(this.pannerNode)
      .connect(this.gainNode)
      .connect(this.audioContext.destination);

    setInterval(() => {
      this.analyser?.getByteFrequencyData(dataArray);
      this.emit('fft', dataArray);
      console.log(dataArray);
    }, 100);
  }

  setAudioSource(url: string) {
    this.audioElement.src = url;
  }

  play() {
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    this.audioElement.play();
  }

  pause() {
    this.audioElement.pause();
    this.emit('paused');
  }

  stop() {
    this.audioElement.pause();
    this.audioElement.currentTime = 0;
    this.emit('stopped');
  }

  setPlaybackRate(rate: number) {
    this.audioElement.playbackRate = rate;
    this.emit('playbackRateChanged', rate);
  }

  setVolume(volume: number) {
    this.gainNode.gain.value = volume;
    this.emit('volumeChanged', volume);
  }

  setPan(pan: number) {
    this.pannerNode.pan.value = pan;
    this.emit('panChanged', pan);
  }

  rewind(seconds: number) {
    this.audioElement.currentTime -= seconds;
    this.emit('rewound', seconds);
  }

  forward(seconds: number) {
    this.audioElement.currentTime += seconds;
    this.emit('forwarded', seconds);
  }

  seek(seconds: number) {
    this.audioElement.currentTime = seconds;
    this.emit('seeked', seconds);
  }

  restoreChannelConfig() {
    const audioElement = new Audio();
    audioElement.autoplay = false;
    audioElement.src = this.audioElement.src;
    audioElement.currentTime = this.audioElement.currentTime;
    audioElement.addEventListener('ended', this.onEnded.bind(this));
    this.audioElement.pause();
    this.audioElement.currentTime = 0;
    this.audioElement.src = '';
    this.audioElement.removeEventListener('ended', this.onEnded);
    this.audioElement = audioElement;
    this.audioContext.destination.disconnect();
    this.gainNode.disconnect();
    this.pannerNode.disconnect();

    const audioSource = this.audioContext.createMediaElementSource(
      this.audioElement,
    );

    audioSource
      .connect(this.pannerNode)
      .connect(this.gainNode)
      .connect(this.audioContext.destination);
  }

  switchToMono() {
    const audioElement = new Audio();
    audioElement.autoplay = false;
    audioElement.src = this.audioElement.src;
    audioElement.currentTime = this.audioElement.currentTime;
    audioElement.addEventListener('ended', this.onEnded.bind(this));
    this.audioElement.pause();
    this.audioElement.currentTime = 0;
    this.audioElement.src = '';
    audioElement.loop = true;
    this.audioElement.removeEventListener('ended', this.onEnded);
    this.audioElement = audioElement;
    this.audioContext.destination.disconnect();
    this.gainNode.disconnect();
    this.pannerNode.disconnect();

    const audioSource = this.audioContext.createMediaElementSource(
      this.audioElement,
    );

    const mergerNode = this.audioContext.createChannelMerger(2);
    audioSource.connect(mergerNode, 0, 0);
    audioSource.connect(mergerNode, 0, 1);

    mergerNode
      .connect(this.pannerNode)
      .connect(this.gainNode)
      .connect(this.audioContext.destination);
  }
}

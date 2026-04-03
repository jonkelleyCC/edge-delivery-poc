export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  let hasVideo = false;

  cols.forEach((col, index) => {
    // video column
    if (index === 0) {
      const posterImageSources = col.querySelectorAll('picture source');
      const videoLink = col.querySelector('a');
      const firstChild = col.firstElementChild;

      if (posterImageSources.length || videoLink) {
        hasVideo = true;
      }

      const videoElement = document.createElement('video');

      videoElement.autoplay = true;
      videoElement.muted = true;
      videoElement.loop = true;
      videoElement.playsInline = true;
      videoElement.preload = 'auto';
      videoElement.loading = 'eager';
      videoElement.className = 'hero-video';

      if (posterImageSources.length) {
        videoElement.poster = posterImageSources[0].srcset;
      }

      if (videoLink?.href) {
        const source = document.createElement('source');
        source.src = videoLink.href;
        source.type = 'video/mp4';
        videoElement.appendChild(source);
      }

      firstChild.replaceWith(videoElement);
    }

    // static image column
    if (index === 1) {
      if (hasVideo) {
        // hide/remove the image here
      }
    }
  });
}

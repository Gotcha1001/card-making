function smartImageFit(
  imageSrc,
  containerWidth,
  containerHeight,
  targetWidth,
  targetHeight
) {
  const img = new window.Image();
  img.src = imageSrc;
  return new Promise((resolve) => {
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      canvas.toBlob(
        (blob) => {
          resolve(URL.createObjectURL(blob));
        },
        "image/png",
        1.0
      );
    };
  });
}

export { smartImageFit };

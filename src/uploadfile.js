const { createWriteStream, unlinkSync } = require('fs');

const storeFS = ({ pathfile, stream, filename }) => {
  const path = `${pathfile}/${filename}`;
  return new Promise((resolve, reject) =>
    stream
      .on('error', (error) => {
        console.log('TCL: storeFS -> error', error);
        if (stream.truncated) {
          console.log('gggggggggggg');
          // Delete the truncated file.
          unlinkSync(path);
        }
        reject(error);
      })
      .pipe(createWriteStream(path))
      .on('error', (error) => reject(error))
      .on('finish', () => resolve({ path }))
  );
};

exports.storeFS = storeFS;

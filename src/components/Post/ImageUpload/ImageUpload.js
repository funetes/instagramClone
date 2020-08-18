import React, { useState } from 'react';
import './ImageUpload.css';
import { Button } from '@material-ui/core';

import db from '../../../Firebase/db';
import storage from '../../../Firebase/storage';
import firebase from 'firebase';

function ImageUpload({ username }) {
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState(null);
  const [progress, setProgress] = useState(0);
  const handleChange = e => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };
  const handleUpload = () => {
    // 1. store to stroage
    // 2. update to db
    const uploadTask = storage.ref(`images/${image.name}`).put(image);
    uploadTask.on(
      'state_changed',
      snapShot => {
        const progress = Math.round(
          (snapShot.bytesTransferred / snapShot.totalBytes) * 100
        );
        setProgress(progress);
      },
      error => {
        alert(error.message);
      },
      () => {
        // 1. get imgUrl to storage
        storage
          .ref('images')
          .child(image.name)
          .getDownloadURL()
          .then(url => {
            // 2. update to db
            db.collection('posts').add({
              timestamp: firebase.firestore.FieldValue.serverTimestamp(),
              imageUrl: url,
              caption,
              username,
            });
            setProgress(0);
            setCaption('');
            setImage(null);
          });
      }
    );
  };
  return (
    <div className='imageupload'>
      <progress value={progress} max='100' className='imageupload__progress' />
      <input
        type='text'
        placeholder='Enter a caption...'
        onChange={e => setCaption(e.target.value)}
        value={caption}
      />
      <input type='file' onChange={handleChange} />
      <Button onClick={handleUpload}>Upload</Button>
    </div>
  );
}

export default ImageUpload;
